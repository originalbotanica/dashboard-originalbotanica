import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionStatus } from "@/lib/subscription";

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
            </div>

            {!sub.isActive && (
              <p className="form-error mt-8">
                Your subscription is not active. The astrologer is locked until
                you reactivate.
              </p>
            )}
          </>
        )}

        <section className="mt-24 border-t border-[var(--border)] pt-12">
          <p className="eyebrow mb-4">Coming soon</p>
          <ul className="text-[var(--foreground-muted)] leading-relaxed space-y-2">
            <li>Inline ritual and product recommendations from the botanica</li>
          </ul>
        </section>
      </section>
    </main>
  );
}
