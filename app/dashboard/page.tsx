import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { headers } from "next/headers";
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
import { DashBanner } from "@/components/dash-banner";
import { getDashState, type DashState } from "@/lib/dashboard/state";
import { ProseLine, buildProductLookup } from "@/lib/rag/render-prose";
import { getLocale } from "@/lib/i18n/server";
import { t, type Locale } from "@/lib/i18n/dictionary";

export const metadata = {
  title: "Your practice today",
  description: "Today's reading, your daily card, and the work of the day.",
};

const EMPTY_LOOKUP = buildProductLookup([]);
const OB_BASE_URL = "https://originalbotanica.com";

/**
 * The member dashboard — the daily devotional surface.
 *
 * Art direction from Jimmy: a hero that names the day and the member,
 * then full-bleed banner plates, each with its own photography, so the
 * inside of the house feels like the doorway promised.
 *
 * What the banners carry is live: candles burning and how many days they
 * have left, flames waiting to be charged, ancestors untended this week,
 * the astrologer's reading and candle of the day. Whatever needs the
 * member rises to the top of the page.
 *
 * The previous editorial dashboard is preserved at
 * app/dashboard/page.original.tsx.bak (and the tag
 * pre-dashboard-redesign-2026-07-27) if we ever want it back.
 */

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
    .select("first_name, last_name, sun_sign, locale")
    .eq("id", user.id)
    .maybeSingle();

  // Don't let an incomplete profile land on a bare "friend" dashboard —
  // finish onboarding first. (Tool pages already do this.)
  if (!profile?.first_name) redirect("/profile-setup");

  const locale = await getLocale();
  const tr = (k: string, vars?: Record<string, string | number>) =>
    t(locale, k, vars);

  // Greet each member by their own clock: Vercel geolocates the request and
  // passes the visitor's IANA timezone in this header. Fall back to the
  // botanica's clock (never the server's UTC).
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
  const fullName = [profile?.first_name, profile?.last_name]
    .filter(Boolean)
    .join(" ");
  const displayName = fullName || profile?.first_name || "friend";

  const sunSign = profile?.sun_sign || null;
  // One shared promise, NOT awaited here: the astrology banner reads it
  // behind a Suspense boundary, so the page shell paints instantly and the
  // one cold generation each morning streams in.
  const horoscopePromise: Promise<DailyHoroscope | null> =
    sunSign && isValidSign(sunSign)
      ? getOrGenerateDailyHoroscope(sunSign, locale).catch(() => null)
      : Promise.resolve(null);

  const state = await getDashState(user.id, memberTz);

  const today = new Date().toLocaleDateString(
    locale === "es" ? "es-ES" : "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      timeZone: memberTz,
    },
  );

  // ── The banners, in the order the day calls for ──────────────────────
  // Anything waiting on the member (a flame to charge, an ancestor
  // untended) rises above the rest. Otherwise the stars lead.
  const altarBanner = (
    <DashBanner
      key="altar"
      image="/dashboard/altar.webp"
      photoSide="right"
      eyebrow={tr("dash2.altarEyebrow")}
      headline={
        state.candlesToCharge > 0
          ? tr("dash2.altarHeadlineCharge")
          : state.candlesBurning > 0
            ? tr("dash2.altarHeadlineBurning")
            : tr("dash2.altarHeadlineEmpty")
      }
      status={altarStatus(state, locale)}
      urgent={state.candlesToCharge > 0}
      body={
        state.candlesBurning > 0 ? tr("dash2.altarBodyLit") : tr("dash2.altarBody")
      }
      href={state.candlesBurning > 0 ? "/altar/virtual" : "/altar/virtual/new"}
      linkLabel={
        state.candlesToCharge > 0
          ? tr("dash2.altarLinkCharge")
          : state.candlesBurning > 0
            ? tr("dash2.altarLinkVisit")
            : tr("dash2.altarLinkLight")
      }
    />
  );

  const ancestorsBanner = (
    <DashBanner
      key="ancestors"
      image="/dashboard/ancestors.webp"
      photoSide="left"
      eyebrow={tr("dash2.ancestorsEyebrow")}
      headline={
        state.memorials > 0
          ? tr("dash2.ancestorsHeadlineLit")
          : tr("dash2.ancestorsHeadline")
      }
      status={ancestorsStatus(state, locale)}
      urgent={state.memorialsUntended > 0}
      body={
        state.memorials > 0
          ? tr("dash2.ancestorsBodyLit")
          : tr("dash2.ancestorsBody")
      }
      href={state.memorials > 0 ? "/ancestors" : "/ancestors/new"}
      linkLabel={
        state.memorials > 0
          ? tr("dash2.ancestorsLinkVisit")
          : tr("dash2.ancestorsLinkAdd")
      }
    />
  );

  const astrologyBanner = (
    <Suspense
      key="astrology"
      fallback={
        <DashBanner
          image="/dashboard/astrology.webp"
          photoSide="left"
          priority
          eyebrow={tr("dash.astroEyebrow")}
          headline={tr("dash.astroHeadline")}
          body={tr("dash.astroBodyFallback")}
          href="/astrology"
          linkLabel={tr("dash.astroLink")}
        />
      }
    >
      <AstrologyBanner
        sunSign={sunSign}
        horoscopePromise={horoscopePromise}
      />
    </Suspense>
  );

  const tarotBanner = (
    <DashBanner
      key="tarot"
      image="/dashboard/tarot.webp"
      photoSide="right"
      eyebrow={tr("dash2.tarotEyebrow")}
      headline={tr("dash2.tarotHeadline")}
      body={tr("dash2.tarotBody")}
      href="/tarot"
      linkLabel={tr("dash2.tarotLink")}
    />
  );

  const dreamsBanner = (
    <DashBanner
      key="dreams"
      image="/dashboard/dreams.webp"
      photoSide="left"
      eyebrow={tr("dash2.dreamsEyebrow")}
      headline={tr("dash2.dreamsHeadline")}
      body={tr("dash2.dreamsBody")}
      href="/dreams/new"
      linkLabel={tr("dash2.dreamsLink")}
    />
  );

  const tailBanners = [
    <DashBanner
      key="rituals"
      image="/dashboard/rituals.webp"
      photoSide="right"
      eyebrow={tr("dash2.ritualsEyebrow")}
      headline={tr("dash2.ritualsHeadline")}
      status={
        state.savedRituals > 0
          ? t(
              locale,
              state.savedRituals === 1
                ? "dash2.ritualsSavedOne"
                : "dash2.ritualsSavedMany",
              { n: state.savedRituals },
            )
          : null
      }
      body={tr("dash2.ritualsBody")}
      href="/rituals"
      linkLabel={tr("dash2.ritualsLink")}
    />,
    <DashBanner
      key="store"
      image="/dashboard/store.webp"
      photoSide="left"
      eyebrow={tr("dash2.storeEyebrow")}
      headline={tr("dash.benefitHeadline")}
      body={tr("dash.benefitBody")}
      href="https://originalbotanica.com"
      linkLabel={tr("dash.benefitLink")}
      external
    />,
  ];

  // Per Jason, a fixed order: astrologer, tarot, altar, ancestors, dreams,
  // rituals, the discount. The cards still carry live state — what's
  // waiting is said in the status line and colored in accent — but the
  // page reads the same way every morning.
  const banners = [
    astrologyBanner,
    tarotBanner,
    altarBanner,
    ancestorsBanner,
    dreamsBanner,
    ...tailBanners,
  ];

  return (
    <main className="flex-1 relative">
      {/* Jimmy's sacred-geometry field, held behind the whole page. */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url(/dashboard/bg.webp)",
            backgroundSize: "cover",
            backgroundPosition: "top center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(13,10,7,0.55) 0%, rgba(13,10,7,0.85) 40%, #0d0a07 78%)",
          }}
        />
      </div>

      <MemberNav variant="floating" />

      {/* ── Hero: Jimmy's band — the house on the left, the day on the
             right, one gold rule between them. ────────────────────────── */}
      <section aria-label="Today" className="pt-16 md:pt-[4.5rem]">
        <div className="relative overflow-hidden">
          <Image
            src="/dashboard/hero.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* The photograph holds the left; the right falls to black so the
              date and greeting read like an inscription. */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(8,6,4,0.35) 0%, rgba(8,6,4,0.45) 38%, rgba(8,6,4,0.88) 56%, #060504 68%, #060504 100%)",
            }}
          />
          <div className="relative max-w-6xl mx-auto px-6 py-12 md:py-16 grid md:grid-cols-2 gap-10 md:gap-6 items-center">
            {/* The lockup */}
            <div className="text-center">
              <p className="display uppercase tracking-[0.3em] text-sm md:text-base text-[var(--accent)] flex items-center justify-center gap-4">
                <span aria-hidden className="h-px w-8 bg-[var(--accent)]" />
                {tr("dash2.the")}
                <span aria-hidden className="h-px w-8 bg-[var(--accent)]" />
              </p>
              <p
                className="display uppercase leading-none text-[var(--accent)] text-4xl md:text-6xl tracking-[0.04em]"
                style={{ textShadow: "0 2px 24px rgba(0,0,0,0.65)" }}
              >
                {tr("dash2.practice")}
              </p>
              <p className="display uppercase tracking-[0.22em] text-[0.6rem] md:text-xs text-[var(--accent)] mt-2">
                {tr("dash2.byOB")}
              </p>
              <p className="uppercase tracking-[0.16em] text-xs md:text-sm text-white mt-4">
                {tr("dash2.tagline")}
              </p>
            </div>

            {/* The day */}
            <div className="text-center">
              {sunSign && (
                <p
                  className="text-4xl md:text-5xl text-[var(--accent)] mb-4 leading-none"
                  aria-label={sunSign}
                >
                  {signGlyph(sunSign)}
                </p>
              )}
              <p className="display uppercase tracking-[0.12em] text-lg md:text-2xl text-[var(--accent)]">
                {today}
              </p>
              <span
                aria-hidden
                className="block h-px bg-[var(--accent)] my-3 mx-auto w-[78%]"
              />
              <p className="display uppercase tracking-[0.08em] text-lg md:text-2xl text-[var(--accent)]">
                {greeting},
              </p>
              <p className="uppercase tracking-[0.1em] text-sm md:text-lg text-white mt-2 font-semibold">
                {displayName}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 mt-8">
          <MembershipPrompt sub={sub} trialLeft={trialLeft} locale={locale} />
        </div>
      </section>

      {/* ── The banners ──────────────────────────────────────────────── */}
      <section className="px-6 pb-16">
        <div className="max-w-5xl mx-auto flex flex-col gap-5">{banners}</div>
      </section>

      {/* ── Gift a membership ────────────────────────────────────────── */}
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

/** "Burning · 4 days left · 2 flames to charge" — the altar in one line. */
function altarStatus(state: DashState, locale: Locale): string | null {
  if (state.candlesBurning === 0) return null;
  const parts: string[] = [];
  parts.push(
    t(
      locale,
      state.candlesBurning === 1
        ? "dash2.altarBurningOne"
        : "dash2.altarBurningMany",
      { n: state.candlesBurning },
    ),
  );
  if (state.soonestDaysLeft !== null) {
    parts.push(
      t(
        locale,
        state.soonestDaysLeft === 1
          ? "dash2.altarDayLeftOne"
          : "dash2.altarDayLeftMany",
        { n: state.soonestDaysLeft },
      ),
    );
  }
  if (state.candlesToCharge > 0) {
    parts.push(
      t(
        locale,
        state.candlesToCharge === 1
          ? "dash2.altarToChargeOne"
          : "dash2.altarToChargeMany",
        { n: state.candlesToCharge },
      ),
    );
  }
  return parts.join(" · ");
}

/** "3 flames lit · 1 altar to tend" */
function ancestorsStatus(state: DashState, locale: Locale): string | null {
  if (state.memorials === 0) return null;
  const parts: string[] = [
    t(
      locale,
      state.memorials === 1 ? "dash2.ancFlameOne" : "dash2.ancFlameMany",
      { n: state.memorials },
    ),
  ];
  if (state.memorialsUntended > 0) {
    parts.push(
      t(
        locale,
        state.memorialsUntended === 1
          ? "dash2.ancTendOne"
          : "dash2.ancTendMany",
        { n: state.memorialsUntended },
      ),
    );
  }
  return parts.join(" · ");
}

const SIGN_GLYPHS: Record<string, string> = {
  aries: "♈",
  taurus: "♉",
  gemini: "♊",
  cancer: "♋",
  leo: "♌",
  virgo: "♍",
  libra: "♎",
  scorpio: "♏",
  sagittarius: "♐",
  capricorn: "♑",
  aquarius: "♒",
  pisces: "♓",
};
function signGlyph(sign: string): string {
  return SIGN_GLYPHS[sign.toLowerCase()] ?? "✦";
}

/**
 * The astrology banner, personalized with today's action once the shared
 * horoscope promise resolves, plus the astrologer's candle of the day.
 */
async function AstrologyBanner({
  sunSign,
  horoscopePromise,
}: {
  sunSign: string | null;
  horoscopePromise: Promise<DailyHoroscope | null>;
}) {
  const dailyHoroscope = await horoscopePromise;
  const locale = await getLocale();
  const tr = (k: string, vars?: Record<string, string | number>) =>
    t(locale, k, vars);

  // Per Jason: no ritual instruction and no candle recommendation here.
  // The card names the day's focus and gives the reading's own opening —
  // the astrologer's voice, not a to-do. The full reading is one tap away.
  const focus = dailyHoroscope?.content.focus?.toLowerCase() ?? null;
  const focusLabel = focus ? tr(`focus.${focus}`) : null;

  return (
    <DashBanner
      image="/dashboard/astrology.webp"
      photoSide="left"
      priority
      eyebrow={tr("dash.astroEyebrow")}
      headline={
        focusLabel
          ? tr("dash2.astroFocusHeadline", { focus: focusLabel })
          : tr("dash.astroHeadline")
      }
      status={
        dailyHoroscope && sunSign
          ? tr("dash2.astroFor", { sign: sunSign })
          : null
      }
      bodyNode={
        dailyHoroscope ? (
          <ProseLine
            text={firstSentences(dailyHoroscope.content.summary, 2)}
            lookup={EMPTY_LOOKUP}
            optimisticBaseUrl={OB_BASE_URL}
          />
        ) : undefined
      }
      body={dailyHoroscope ? "" : tr("dash.astroBodyAdd")}
      href="/astrology"
      linkLabel={tr("dash.astroLink")}
    />
  );
}

/** Keep the dashboard line short: the first sentence or two of the reading. */
function firstSentences(text: string, count: number): string {
  const parts = text.match(/[^.!?]+[.!?]+/g);
  if (!parts) return text;
  return parts.slice(0, count).join(" ").trim();
}
