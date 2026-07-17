import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { headers } from "next/headers";
import { hasUntendedCandles } from "@/lib/altar/tend";
import { dailyCandle } from "@/lib/altar/daily-candle";
import { candleImageUrl, desireLabel } from "@/lib/altar/catalog";
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
import { DailyTarotTeaser } from "@/components/daily-tarot-teaser";

import { ProseLine, buildProductLookup } from "@/lib/rag/render-prose";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionary";

export const metadata = {
  title: "Your practice today",
  description:
    "Today's reading, your daily card, and the work of the day.",
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

  // Greet each member by their own clock: Vercel geolocates the request and
  // passes the visitor's IANA timezone in this header. Fall back to the
  // botanica's clock (never the server's UTC, which said "Good afternoon"
  // at 10:42 AM New York time).
  const reqHeaders = await headers();
  let memberTz = reqHeaders.get("x-vercel-ip-timezone") || "America/New_York";
  let hour: number;
  try {
    hour = Number(
      new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        hour12: false,
        timeZone: memberTz,
      }).format(new Date()),
    );
  } catch {
    // Unrecognized timezone string from the header — use the botanica's.
    memberTz = "America/New_York";
    hour = Number(
      new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        hour12: false,
        timeZone: memberTz,
      }).format(new Date()),
    );
  }
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

  // Tending nudge: when a burning candle hasn't been held today, the altar
  // section's link becomes the day's small call to devotion.
  const needsTending = await hasUntendedCandles(user.id, memberTz);

  const today = new Date().toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: memberTz,
  });

  return (
    <main className="flex-1">
      {/* ── 1. Hero — candlelit invocation ────────────────────────────── */}
      <section
        aria-label="Today"
        className="relative flex flex-col items-center text-center px-6 pt-28 pb-14 overflow-hidden"
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

        {/* Per Jason: no "Today the focus is…" block here — the hero stays
            quiet (date, greeting, flame) and the page goes straight into
            Today's Reading below. */}
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

      {/* ── 3. Daily tarot — straight from the reading to the wheel ────── */}
      <DailyTarotTeaser />

      {/* (Calendar touchpoint removed per Jason — the calendar lives in the
          menu and at /calendar.) */}

      {/* ── 4. Dreams — image right ───────────────────────────────────── */}
      <ToolSection
        eyebrow={tr("dash.dreamsEyebrow")}
        headline={tr("dash.dreamsHeadline")}
        body={tr("dash.dreamsBody")}
        href="/dreams/new"
        linkLabel={tr("dash.dreamsLink")}
        imageSrc="/landing/gfx-dreams.jpg"
        imageSide="right"
      />

      {/* ── 5. Virtual altar — image right ────────────────────────────── */}
      <ToolSection
        eyebrow={tr("dash.altarEyebrow")}
        headline={tr("dash.altarHeadline")}
        body={tr("dash.altarBody")}
        href="/altar/virtual"
        linkLabel={tr(needsTending ? "dash.altarTendLink" : "dash.altarLink")}
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
        imageSrc={`${OB_CDN}/transforms/Blog/_1200x630_crop_center-center_82_none/how-to-create-an-ancestor-altar.jpg`}
        imageSide="left"
      />

      {/* ── 7. Rituals library — image right ──────────────────────────── */}
      <ToolSection
        eyebrow={tr("dash.ritualsEyebrow")}
        headline={tr("dash.ritualsHeadline")}
        body={tr("dash.ritualsBody")}
        href="/rituals"
        linkLabel={tr("dash.ritualsLink")}
        imageSrc={`${OB_CDN}/transforms/_1200x630_crop_center-center_82_none/beltane-rituals-altar.jpg`}
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
        imageSrc={`${OB_CDN}/transforms/_1200x630_crop_center-center_82_none/about-original-botanica.jpg`}
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

  // The astrologer's candle of the day: the reading's focus, answered on
  // the altar. Same candle all day for everyone the sky gave that focus.
  const rec = dailyHoroscope
    ? dailyCandle(
        dailyHoroscope.content.focus,
        new Date().toISOString().slice(0, 10),
      )
    : null;

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
      afterNode={
        rec ? (
          <div className="mt-10 flex items-center gap-6 border-t border-[var(--border)] pt-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={candleImageUrl(rec.candle.slug)}
              alt={rec.candle.name}
              className="h-28 w-auto rounded-lg shrink-0"
              style={{ filter: "drop-shadow(0 0 12px rgba(240, 176, 110, 0.35))" }}
            />
            <div>
              <p className="eyebrow mb-2">{tr("dash.candleEyebrow")}</p>
              <p className="text-[var(--foreground-muted)] leading-relaxed mb-3">
                {tr("dash.candleLine", {
                  purpose: desireLabel(rec.desire, locale).toLowerCase(),
                  name: rec.candle.name,
                })}
              </p>
              <Link
                href={`/altar/virtual/new?candle=${rec.candle.slug}`}
                className="nav-link text-[var(--accent)]"
              >
                {tr("dash.candleCta")} →
              </Link>
            </div>
          </div>
        ) : undefined
      }
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
  afterNode,
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
  /** Optional extra content under the link (e.g. the candle of the day). */
  afterNode?: React.ReactNode;
}) {
  // The photo is a tap target too — on a phone the image is the biggest
  // thing on screen, and tapping it should open the tool, not just the
  // text link beneath it.
  const imageClasses =
    "md:col-span-2 relative aspect-square rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--surface)] block transition-opacity hover:opacity-90";
  const imageInner = (
    <Image
      src={imageSrc}
      alt=""
      fill
      sizes="(max-width: 768px) 100vw, 40vw"
      className="object-cover"
    />
  );
  const imageBlock = external ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={linkLabel}
      className={imageClasses}
    >
      {imageInner}
    </a>
  ) : (
    <Link href={href} aria-label={linkLabel} className={imageClasses}>
      {imageInner}
    </Link>
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
      {afterNode}
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
