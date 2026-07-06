import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionStatus, trialDaysLeft } from "@/lib/subscription";
import {
  getOrGenerateDailyHoroscope,
  type DailyHoroscope,
} from "@/lib/daily-horoscope/generate";
import { isValidSign } from "@/lib/daily-horoscope/prompt";
import { MemberNav } from "@/components/member-nav";
import { MembershipPrompt } from "@/components/membership-prompt";
import { Candle } from "@/components/candle";
import { CalendarToday } from "@/components/calendar-today";
import { DailyTarotTeaser } from "@/components/daily-tarot-teaser";
import { getMoon, moonGuidance } from "@/lib/astrology/moon";
import { getTodaysSky } from "@/lib/astrology/sky";
import { MoonPhase } from "@/components/moon-phase";
import { ProseLine, buildProductLookup } from "@/lib/rag/render-prose";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionary";

export const metadata = {
  title: "Your practice today",
  description:
    "Today's reading, tonight's moon, your daily card, and the work of the day.",
};

const EMPTY_LOOKUP = buildProductLookup([]);
const OB_BASE_URL = "https://originalbotanica.com";

/**
 * The member dashboard — the daily devotional surface.
 *
 * Design language: candlelit, reverent, atmospheric. Like stepping into
 * the botanica at dawn. Each section has its own visual treatment so
 * the eye keeps moving instead of scanning identical cards.
 *
 * Imagery comes from originalbotanica.com's CloudFront CDN (same shots
 * used on the marketing site). Falls back gracefully if those URLs
 * change later.
 */

const OB_CDN = "https://dlkhclkmyx18n.cloudfront.net";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const sub = await getSubscriptionStatus(user.id);
  const trialLeft = trialDaysLeft(sub);

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, sun_sign, locale")
    .eq("id", user.id)
    .maybeSingle();

  // Don't let an incomplete profile land on a bare "friend" dashboard —
  // finish onboarding first. (Tool pages already do this.)
  if (!profile?.first_name) redirect("/profile-setup");

  const locale = await getLocale();
  const tr = (k: string, vars?: Record<string, string | number>) => t(locale, k, vars);

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? tr("dash.greetingMorning")
      : hour < 18
        ? tr("dash.greetingAfternoon")
        : tr("dash.greetingEvening");
  const displayName = profile?.first_name || "friend";

  const sunSign = profile?.sun_sign || null;
  // One shared promise, NOT awaited here: the hero and the astrology section
  // both read it behind Suspense boundaries, so the page shell paints
  // instantly and the one cold generation each morning streams in. Sharing
  // the promise means Claude is called once, not once per section.
  const horoscopePromise: Promise<DailyHoroscope | null> =
    sunSign && isValidSign(sunSign)
      ? getOrGenerateDailyHoroscope(sunSign, locale).catch(() => null)
      : Promise.resolve(null);

  const today = new Date().toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Tonight's moon — a small daily touchpoint. Pure calculation, no API.
  const moon = getMoon();
  const moonGuide = moonGuidance(moon.bucket);
  const sky = getTodaysSky();

  const PHASE_KEYS: Record<string, string> = {
    "New Moon": "moon.phaseNew",
    "Waxing Crescent": "moon.phaseWaxingCrescent",
    "First Quarter": "moon.phaseFirstQuarter",
    "Waxing Gibbous": "moon.phaseWaxingGibbous",
    "Full Moon": "moon.phaseFull",
    "Waning Gibbous": "moon.phaseWaningGibbous",
    "Last Quarter": "moon.phaseLastQuarter",
    "Waning Crescent": "moon.phaseWaningCrescent",
  };
  const GUIDE_KEYS: Record<string, string> = {
    new: "moon.guideNew",
    waxing: "moon.guideWaxing",
    full: "moon.guideFull",
    waning: "moon.guideWaning",
  };
  const moonPhaseLabel = PHASE_KEYS[moon.phaseName]
    ? tr(PHASE_KEYS[moon.phaseName])
    : moon.phaseName;
  const moonSignLabel = tr("sign." + String(sky.moonSign).toLowerCase());
  const moonGuideTitle = GUIDE_KEYS[moon.bucket]
    ? tr(GUIDE_KEYS[moon.bucket])
    : moonGuide.title;

  return (
    <main className="flex-1">
      {/* ── 1. Hero — candlelit invocation ────────────────────────────── */}
      <section
        aria-label="Today"
        className="relative min-h-[100svh] flex flex-col items-center justify-center text-center px-6 pt-24 pb-24 overflow-hidden"
      >
        <MemberNav variant="floating" />

        {/* Clean atmospheric background — warm darkness + radial candle glow.
            No photographic imagery competing with the foreground candle. */}
        <div className="absolute inset-0 -z-10">
          {/* Base: deep warm brown gradient */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 45%, #2a1f15 0%, #1a130d 35%, #14100b 60%, #0d0a07 100%)",
            }}
          />
          {/* Warm amber bloom behind the candle */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 48%, rgba(232,172,124,0.18) 0%, rgba(232,172,124,0.05) 22%, transparent 45%)",
            }}
          />
          {/* Subtle vignette to deepen the edges */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%)",
            }}
          />
        </div>

        {/* Centered logo, large and prominent */}
        <Image
          src="/logo-ob-white-banner.png"
          alt="Original Botanica"
          width={180}
          height={130}
          priority
          className="h-auto w-[140px] md:w-[180px] mb-10"
        />

        {/* Date + personal greeting */}
        <p className="eyebrow mb-3 text-[var(--foreground-muted)]">{today}</p>
        <p className="sublabel mb-14 text-base md:text-lg">
          {greeting}, {displayName}
        </p>

        {/* Layered animated candle flame */}
        <div className="mb-14" aria-hidden>
          <Candle size="large" lit />
        </div>

        {/* Today's invocation — daily horoscope or fallback. Streams in
            behind Suspense so the hero never blocks on generation. */}
        <Suspense
          fallback={
            <>
              <h1 className="display text-4xl md:text-6xl max-w-3xl leading-[1.05]">
                {sunSign ? `${sunSign}.` : tr("dash.heroWelcomeTitle")}
              </h1>
              <p className="invocation text-lg md:text-xl text-[var(--foreground-muted)] mt-8 max-w-2xl leading-relaxed animate-pulse">
                {sunSign
                  ? tr("dash.heroReadingFor")
                  : tr("dash.heroWelcomeBody")}
              </p>
            </>
          }
        >
          <HeroInvocation sunSign={sunSign} horoscopePromise={horoscopePromise} />
        </Suspense>

        <MembershipPrompt sub={sub} trialLeft={trialLeft} locale={locale} />
      </section>

      {/* ── Astrology first — lead with the stars, per Steve's note ───── */}
      <Suspense
        fallback={
          <ToolSection
            eyebrow={tr("dash.astroEyebrow")}
            headline={tr("dash.astroHeadline")}
            body={tr("dash.astroBodyFallback")}
            href="/astrology"
            linkLabel={tr("dash.astroLink")}
            imageSrc={`${OB_CDN}/cta-spiritual-services.jpg`}
            imageSide="left"
          />
        }
      >
        <AstrologySection sunSign={sunSign} horoscopePromise={horoscopePromise} />
      </Suspense>

      {/* ── Tonight's moon — compact daily touchpoint ─────────────────── */}
      <section aria-label="Tonight's moon" className="border-t border-[var(--border)]">
        <Link
          href="/astrology/moon"
          className="group block max-w-5xl mx-auto px-6 py-10"
        >
          <div className="flex items-center gap-5 md:gap-8">
            <div className="shrink-0">
              <MoonPhase
                illumination={moon.illumination}
                waxing={moon.waxing}
                size={64}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="eyebrow mb-1 text-[var(--foreground-muted)]">
                {tr("dash.moonEyebrow")}
              </p>
              <p className="display text-xl md:text-2xl leading-tight">
                {moonPhaseLabel} {tr("moon.in")} {moonSignLabel} · {moon.illuminationPct}
                {tr("moon.litSuffix")}
              </p>
              <p className="text-[var(--foreground-muted)] text-sm leading-relaxed mt-1">
                {moonGuideTitle}
              </p>
            </div>
            <span className="nav-link text-[var(--accent)] hidden sm:inline-flex items-center gap-2 shrink-0">
              {tr("dash.lunarGuide")}
              <span aria-hidden>→</span>
            </span>
          </div>
        </Link>
      </section>

      {/* ── Today on the spiritual calendar ───────────────────────────── */}
      <CalendarToday />

      {/* ── 3. Dreams — image right ───────────────────────────────────── */}
      <ToolSection
        eyebrow={tr("dash.dreamsEyebrow")}
        headline={tr("dash.dreamsHeadline")}
        body={tr("dash.dreamsBody")}
        href="/dreams/new"
        linkLabel={tr("dash.dreamsLink")}
        imageSrc="/landing/gfx-dreams.jpg"
        imageSide="right"
      />

      {/* ── 4. Daily tarot — teaser linking to the dedicated pull page ─── */}
      <DailyTarotTeaser />

      {/* ── 5. Virtual altar — image right ────────────────────────────── */}
      <ToolSection
        eyebrow={tr("dash.altarEyebrow")}
        headline={tr("dash.altarHeadline")}
        body={tr("dash.altarBody")}
        href="/altar/virtual"
        linkLabel={tr("dash.altarLink")}
        imageSrc={`${OB_CDN}/transforms/_miscImage/virtual-candle-altar.jpg`}
        imageSide="right"
      />

      {/* ── 6. Ancestors altar — image left ───────────────────────────── */}
      <ToolSection
        eyebrow={tr("dash.ancestorsEyebrow")}
        headline={tr("dash.ancestorsHeadline")}
        body={tr("dash.ancestorsBody")}
        href="/ancestors"
        linkLabel={tr("dash.ancestorsLink")}
        imageSrc={`${OB_CDN}/spiritual-candles.png`}
        imageSide="left"
      />

      {/* ── 7. Rituals library — image right ──────────────────────────── */}
      <ToolSection
        eyebrow={tr("dash.ritualsEyebrow")}
        headline={tr("dash.ritualsHeadline")}
        body={tr("dash.ritualsBody")}
        href="/rituals"
        linkLabel={tr("dash.ritualsLink")}
        imageSrc={`${OB_CDN}/herbs-roots_2022-09-13-200156_sxob.png`}
        imageSide="right"
      />

      {/* ── 8. Member benefit — image left ────────────────────────────── */}
      <ToolSection
        eyebrow={tr("dash.benefitEyebrow")}
        headline={tr("dash.benefitHeadline")}
        body={tr("dash.benefitBody")}
        href="https://originalbotanica.com"
        linkLabel={tr("dash.benefitLink")}
        external
        imageSrc={`${OB_CDN}/spiritual-baths-washes.png`}
        imageSide="left"
      />

      {/* ── Gift a membership — a warm, distinct closing callout ───────── */}
      <section
        aria-label="Give the gift of guidance"
        className="border-t border-[var(--border)]"
      >
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <p className="eyebrow mb-4 text-[var(--foreground-muted)]">
            {tr("dash.giftEyebrow")}
          </p>
          <h2 className="display text-2xl md:text-4xl leading-tight mb-5">
            {tr("dash.giftHeadline")}
          </h2>
          <p className="text-[var(--foreground-muted)] leading-relaxed mb-8 max-w-xl mx-auto">
            {tr("dash.giftBody")}
          </p>
          <Link href="/gift" className="btn-primary inline-flex">
            {tr("dash.giftCta")}
          </Link>
        </div>
      </section>
    </main>
  );
}

/**
 * The hero's daily invocation. Awaits the shared horoscope promise behind
 * Suspense. When generation fails the member sees an honest note instead of
 * a silent generic welcome.
 */
async function HeroInvocation({
  sunSign,
  horoscopePromise,
}: {
  sunSign: string | null;
  horoscopePromise: Promise<DailyHoroscope | null>;
}) {
  const dailyHoroscope = await horoscopePromise;
  const locale = await getLocale();
  const tr = (k: string, vars?: Record<string, string | number>) => t(locale, k, vars);
  if (sunSign && dailyHoroscope) {
    return (
      <>
        <h1 className="display text-4xl md:text-6xl max-w-3xl leading-[1.05]">
          {sunSign}. Today the focus is{" "}
          <span className="italic text-[var(--accent)]">
            {dailyHoroscope.content.focus}
          </span>
          .
        </h1>
        <p className="invocation text-lg md:text-xl text-[var(--foreground-muted)] mt-8 max-w-2xl leading-relaxed">
          <ProseLine
            text={dailyHoroscope.content.summary}
            lookup={EMPTY_LOOKUP}
            optimisticBaseUrl={OB_BASE_URL}
          />
        </p>
      </>
    );
  }
  if (sunSign) {
    return (
      <>
        <h1 className="display text-4xl md:text-6xl max-w-3xl leading-[1.05]">
          {tr("dash.heroSignCandle", { sign: sunSign })}
        </h1>
        <p className="invocation text-lg md:text-xl text-[var(--foreground-muted)] mt-8 max-w-2xl leading-relaxed">
          {tr("dash.heroSignError")}
        </p>
      </>
    );
  }
  return (
    <>
      <h1 className="display text-4xl md:text-6xl max-w-3xl leading-[1.05]">
        {tr("dash.heroWelcomeTitle")}
      </h1>
      <p className="invocation text-lg md:text-xl text-[var(--foreground-muted)] mt-8 max-w-2xl leading-relaxed">
        {tr("dash.heroWelcomeBody")}
      </p>
    </>
  );
}

/**
 * The astrology tool section, personalized with today's action once the
 * shared horoscope promise resolves.
 */
async function AstrologySection({
  sunSign,
  horoscopePromise,
}: {
  sunSign: string | null;
  horoscopePromise: Promise<DailyHoroscope | null>;
}) {
  const dailyHoroscope = await horoscopePromise;
  const locale = await getLocale();
  const tr = (k: string, vars?: Record<string, string | number>) => t(locale, k, vars);
  return (
    <ToolSection
      eyebrow={tr("dash.astroEyebrow")}
      headlineNode={
        dailyHoroscope ? (
          <ProseLine
            text={dailyHoroscope.content.action}
            lookup={EMPTY_LOOKUP}
            optimisticBaseUrl={OB_BASE_URL}
          />
        ) : (
          tr("dash.astroHeadline")
        )
      }
      body={
        dailyHoroscope
          ? tr("dash.astroBodyFrom", { sign: sunSign ?? "" })
          : tr("dash.astroBodyAdd")
      }
      href="/astrology"
      linkLabel={tr("dash.astroLink")}
      imageSrc={`${OB_CDN}/cta-spiritual-services.jpg`}
      imageSide="left"
    />
  );
}

/**
 * Editorial side-by-side tool section.
 * Same structure for every tool: image on one side, eyebrow + headline +
 * body + link on the other. The `imageSide` prop flips left/right so we
 * can alternate down the page.
 */
function ToolSection({
  eyebrow,
  headline,
  headlineNode,
  body,
  href,
  linkLabel,
  imageSrc,
  imageSide,
  external = false,
}: {
  eyebrow: string;
  headline?: string;
  headlineNode?: React.ReactNode;
  body: string;
  href: string;
  linkLabel: string;
  imageSrc: string;
  imageSide: "left" | "right";
  external?: boolean;
}) {
  const imageBlock = (
    <div className="md:col-span-2 relative aspect-square rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
      <Image
        src={imageSrc}
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 40vw"
        className="object-cover"
      />
    </div>
  );
  const textBlock = (
    <div className="md:col-span-3">
      <p className="eyebrow mb-4">{eyebrow}</p>
      <h2 className="display text-2xl md:text-3xl mb-5 leading-tight">
        {headlineNode ?? headline}
      </h2>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-6">
        {body}
      </p>
      {external ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="nav-link text-[var(--accent)] inline-flex items-center gap-2"
        >
          {linkLabel}
          <span aria-hidden>→</span>
        </a>
      ) : (
        <Link
          href={href}
          className="nav-link text-[var(--accent)] inline-flex items-center gap-2"
        >
          {linkLabel}
          <span aria-hidden>→</span>
        </Link>
      )}
    </div>
  );

  return (
    <section
      aria-label={eyebrow}
      className="border-t border-[var(--border)]"
    >
      <div className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-5 gap-10 items-center">
        {imageSide === "left" ? (
          <>
            {imageBlock}
            {textBlock}
          </>
        ) : (
          <>
            {textBlock}
            {imageBlock}
          </>
        )}
      </div>
    </section>
  );
}
