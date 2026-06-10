import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionStatus } from "@/lib/subscription";
import { getTodaysSky } from "@/lib/astrology/sky";
import { getOrGenerateDailyHoroscope } from "@/lib/daily-horoscope/generate";
import { isValidSign, type Sign } from "@/lib/daily-horoscope/prompt";
import { ProseLine, buildProductLookup } from "@/lib/rag/render-prose";

const EMPTY_LOOKUP = buildProductLookup([]);
const OB_BASE_URL = "https://originalbotanica.com";

export const metadata = {
  title: "Astrology",
};

const OB_CDN = "https://dlkhclkmyx18n.cloudfront.net";

/**
 * Astrology hub page.
 *
 * Two doors for Part 1: Talk to Your Astrologer, View Your Chart.
 * Forecast + Compatibility arrive in Part 2.
 *
 * Visual treatment matches the dashboard: warm photography backdrop,
 * minimal text overlay, generous space.
 */
export default async function AstrologyHubPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "first_name, birth_date, birth_place, sun_sign, moon_sign, rising_sign",
    )
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.first_name) redirect("/profile-setup");

  const sub = await getSubscriptionStatus(user.id);
  const hasBirthData = !!profile.birth_date && !!profile.birth_place;
  const hasChart = !!profile.sun_sign;

  // Today's sky, computed locally. No API, nothing to wait on.
  const sky = getTodaysSky();

  return (
    <main className="min-h-screen relative">
      {/* Atmospheric backdrop */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={`${OB_CDN}/cta-spiritual-services.jpg`}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-25"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(20,16,11,0.9) 0%, rgba(20,16,11,0.96) 100%)",
          }}
        />
      </div>

      <header className="border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="nav-link text-[var(--accent)]">
            ← Dashboard
          </Link>
          <p className="sublabel text-xs">Astrology</p>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 pt-24 pb-20">
        <p className="eyebrow mb-4">Astrology</p>
        <h1 className="display text-4xl md:text-5xl mb-6 leading-tight">
          {profile.first_name}, your chart awaits.
        </h1>

        {/* Today's sky: one quiet line, computed locally. */}
        <p className="eyebrow mb-8 text-[var(--foreground-muted)]">
          Today&apos;s sky: Moon in {sky.moonSign},{" "}
          {sky.waxing ? "waxing" : "waning"}. Sun in {sky.sunSign}.
          {sky.aspect ? ` Moon ${sky.aspect.name} Sun. ${sky.aspect.meaning}` : ""}
        </p>

        {!hasBirthData ? (
          <>
            <p className="text-[var(--foreground-muted)] text-lg leading-relaxed max-w-2xl mb-10">
              To read your chart, the astrologer needs your birth date and the
              city where you were born. Birth time is helpful but not required.
            </p>
            <Link href="/profile-setup" className="btn-primary inline-flex">
              Add your birth details
            </Link>
          </>
        ) : (
          <>
            <p className="text-[var(--foreground-muted)] text-lg leading-relaxed max-w-2xl mb-8">
              Your astrologer is ready. Ask about a placement, a current transit,
              or the ritual that fits this week.
            </p>

            {hasChart && (
              <div className="invocation text-base text-[var(--foreground-muted)] mb-12 border-l-2 border-[var(--accent)] pl-4 py-2">
                Sun in {profile.sun_sign}. Moon in {profile.moon_sign}.
                {profile.rising_sign
                  ? ` Rising in ${profile.rising_sign}.`
                  : ""}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
              <Link
                href="/astrology/astrologer"
                className="btn-primary inline-flex"
              >
                Talk to your astrologer
              </Link>
              <Link
                href="/astrology/forecast"
                className="btn-ghost inline-flex"
              >
                Monthly forecast
              </Link>
              <Link
                href="/astrology/compatibility"
                className="btn-ghost inline-flex"
              >
                Compatibility
              </Link>
              <Link href="/astrology/chart" className="btn-ghost inline-flex">
                View your chart
              </Link>
              <Link href="/astrology/moon" className="btn-ghost inline-flex">
                Tonight&apos;s moon
              </Link>
            </div>

            {!sub.isActive && (
              <p className="form-error mt-8">
                Your subscription is not active. The astrologer is locked until
                you reactivate.
              </p>
            )}
          </>
        )}

        {/* Today's horoscope for the member's sign. Cached per sign per day,
            so this is usually instant; Suspense keeps the page fast on the
            one cold generation each morning. */}
        {hasChart && profile.sun_sign && isValidSign(profile.sun_sign) && (
          <section className="mt-20 border-t border-[var(--border)] pt-12">
            <p className="eyebrow mb-6">Today for {profile.sun_sign}</p>
            <Suspense
              fallback={
                <p className="invocation text-[var(--foreground-muted)] animate-pulse">
                  Reading today&apos;s sky for {profile.sun_sign}...
                </p>
              }
            >
              <HubHoroscope sign={profile.sun_sign} />
            </Suspense>
          </section>
        )}

        <section className="mt-24 border-t border-[var(--border)] pt-12">
          <p className="eyebrow mb-4">Woven through your readings</p>
          <p className="text-[var(--foreground-muted)] leading-relaxed max-w-2xl">
            Every reading draws on the botanica&apos;s archive. Where a ritual
            or supply fits, it appears with the reading: rituals link into the
            library, supplies link to the shelves at the botanica.
          </p>
        </section>
      </section>
    </main>
  );
}

/**
 * The member's daily horoscope, rendered on the hub. Streams in behind a
 * Suspense boundary so the hub never waits on generation.
 */
async function HubHoroscope({ sign }: { sign: Sign }) {
  const horoscope = await getOrGenerateDailyHoroscope(sign).catch(() => null);
  if (!horoscope) {
    return (
      <p className="text-[var(--foreground-muted)] leading-relaxed">
        Today&apos;s reading could not be drawn just now. Refresh in a moment,
        or ask the astrologer directly.
      </p>
    );
  }
  return (
    <div className="max-w-2xl">
      <h2 className="display text-2xl md:text-3xl leading-tight mb-4">
        The focus is{" "}
        <span className="italic text-[var(--accent)]">
          {horoscope.content.focus}
        </span>
        .
      </h2>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-4">
        <ProseLine
          text={horoscope.content.summary}
          lookup={EMPTY_LOOKUP}
          optimisticBaseUrl={OB_BASE_URL}
        />
      </p>
      <p className="invocation text-[var(--foreground-muted)] border-l-2 border-[var(--accent)] pl-4 py-1">
        <ProseLine
          text={horoscope.content.action}
          lookup={EMPTY_LOOKUP}
          optimisticBaseUrl={OB_BASE_URL}
        />
      </p>
    </div>
  );
}
