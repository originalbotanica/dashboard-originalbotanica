import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { MemberNav } from "@/components/member-nav";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { loadAstrologerContext } from "@/lib/astrologer/context";
import { getOrGenerateChartReading } from "@/lib/astrology/chart-reading";
import { getSubscriptionStatus } from "@/lib/subscription";
import { getTodaysSky, aspectPhrase, aspectMeaning } from "@/lib/astrology/sky";
import { getOrGenerateDailyHoroscope } from "@/lib/daily-horoscope/generate";
import { isValidSign, type Sign } from "@/lib/daily-horoscope/prompt";
import { ProseLine, buildProductLookup } from "@/lib/rag/render-prose";
import { ZodiacWheel } from "@/components/zodiac-wheel";
import { getLocale } from "@/lib/i18n/server";
import { t, type Locale } from "@/lib/i18n/dictionary";
import { signName } from "@/lib/astrology/terms";

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
  const locale = await getLocale();

  // Warm the member's written chart reading in the background: most members
  // pass through this hub before opening their chart, so the one-time ~30s
  // generation happens invisibly here and the chart page opens instant.
  // after() runs once the response is sent; failures are silent by design
  // (the chart page can still generate on demand).
  if (hasBirthData && hasChart && sub.isActive) {
    after(async () => {
      try {
        const ctx = await loadAstrologerContext(user.id);
        if (ctx) {
          await getOrGenerateChartReading(user.id, ctx, profile.first_name!, locale);
        }
      } catch {
        /* warm-up only */
      }
    });
  }

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

      <MemberNav />

      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20">
        <div className="grid lg:grid-cols-[1fr_320px] gap-10 lg:gap-14 items-center">
          <div className="max-w-2xl">
        <p className="eyebrow mb-4">{t(locale, "astro.eyebrow")}</p>
        <h1 className="display text-4xl md:text-5xl mb-6 leading-tight">
          {t(locale, "astro.chartAwaits", { name: profile.first_name })}
        </h1>

        {/* Today's sky: one quiet line, computed locally. */}
        <p className="eyebrow mb-8 text-[var(--foreground-muted)]">
          {t(locale, "astro.skyLine", {
            moon: signName(sky.moonSign, locale),
            phase: sky.waxing ? t(locale, "astro.waxing") : t(locale, "astro.waning"),
            sun: signName(sky.sunSign, locale),
          })}
          {sky.aspect ? ` ${aspectPhrase(sky.aspect.name, locale)}. ${aspectMeaning(sky.aspect, locale)}` : ""}
        </p>

        {!hasBirthData ? (
          <>
            <p className="text-[var(--foreground-muted)] text-lg leading-relaxed max-w-2xl mb-10">
              {t(locale, "astro.needBirthBody")}
            </p>
            <Link href="/profile-setup" className="btn-primary inline-flex">
              {t(locale, "astro.addBirth")}
            </Link>
          </>
        ) : (
          <>
            <p className="text-[var(--foreground-muted)] text-lg leading-relaxed max-w-2xl mb-8">
              {t(locale, "astro.ready")}
            </p>

            {hasChart && (
              <div className="invocation text-base text-[var(--foreground-muted)] mb-12 border-l-2 border-[var(--accent)] pl-4 py-2">
                {t(locale, "astro.sunIn", { sign: signName(profile.sun_sign, locale) })}{" "}
                {t(locale, "astro.moonIn", { sign: signName(profile.moon_sign, locale) })}
                {profile.rising_sign
                  ? " " + t(locale, "astro.risingIn", { sign: signName(profile.rising_sign, locale) })
                  : ""}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
              <Link
                href="/astrology/astrologer"
                className="btn-primary inline-flex"
              >
                {t(locale, "astro.talk")}
              </Link>
              <Link
                href="/astrology/forecast"
                className="btn-ghost inline-flex"
              >
                {t(locale, "astro.monthlyForecast")}
              </Link>
              <Link
                href="/astrology/compatibility"
                className="btn-ghost inline-flex"
              >
                {t(locale, "astro.compatibility")}
              </Link>
              <Link href="/astrology/chart" className="btn-ghost inline-flex">
                {t(locale, "astro.viewChart")}
              </Link>
              <Link href="/astrology/moon" className="btn-ghost inline-flex">
                {t(locale, "astro.tonightsMoon")}
              </Link>
            </div>

            {!sub.isActive && (
              <p className="form-error mt-8">
                {t(locale, "astro.subInactive")}
              </p>
            )}
          </>
        )}
          </div>

          <div className="flex justify-center lg:justify-end">
            <ZodiacWheel className="w-60 h-60 sm:w-72 sm:h-72 lg:w-80 lg:h-80" />
          </div>
        </div>

        <div className="max-w-3xl">

        {/* Today's horoscope for the member's sign. Cached per sign per day,
            so this is usually instant; Suspense keeps the page fast on the
            one cold generation each morning. */}
        {hasChart && profile.sun_sign && isValidSign(profile.sun_sign) && (
          <section className="mt-20 border-t border-[var(--border)] pt-12">
            <p className="eyebrow mb-6">{t(locale, "astro.todayFor", { sign: signName(profile.sun_sign, locale) })}</p>
            <Suspense
              fallback={
                <p className="invocation text-[var(--foreground-muted)] animate-pulse">
                  {t(locale, "astro.readingSky", { sign: signName(profile.sun_sign, locale) })}
                </p>
              }
            >
              <HubHoroscope sign={profile.sun_sign} locale={locale} />
            </Suspense>
          </section>
        )}

        <section className="mt-24 border-t border-[var(--border)] pt-12">
          <p className="eyebrow mb-4">{t(locale, "astro.wovenEyebrow")}</p>
          <p className="text-[var(--foreground-muted)] leading-relaxed max-w-2xl">
            {t(locale, "astro.wovenBody")}
          </p>
        </section>
        </div>
      </section>
    </main>
  );
}

/**
 * The member's daily horoscope, rendered on the hub. Streams in behind a
 * Suspense boundary so the hub never waits on generation.
 */
async function HubHoroscope({ sign, locale }: { sign: Sign; locale: Locale }) {
  const horoscope = await getOrGenerateDailyHoroscope(sign, locale).catch(() => null);
  if (!horoscope) {
    return (
      <p className="text-[var(--foreground-muted)] leading-relaxed">
        {t(locale, "astro.horoscopeFail")}
      </p>
    );
  }
  return (
    <div className="max-w-2xl">
      <h2 className="display text-2xl md:text-3xl leading-tight mb-4">
        {t(locale, "astro.focusPre")}
        <span className="italic text-[var(--accent)]">
          {t(locale, `focus.${horoscope.content.focus}`)}
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
