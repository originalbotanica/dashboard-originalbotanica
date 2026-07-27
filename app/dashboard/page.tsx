import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { headers } from "next/headers";
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

  const restBanners = [
    <DashBanner
      key="tarot"
      image="/dashboard/tarot.webp"
      photoSide="right"
      eyebrow={tr("dash2.tarotEyebrow")}
      headline={tr("dash2.tarotHeadline")}
      body={tr("dash2.tarotBody")}
      href="/tarot"
      linkLabel={tr("dash2.tarotLink")}
    />,
    <DashBanner
      key="dreams"
      image="/dashboard/dreams.webp"
      photoSide="left"
      eyebrow={tr("dash2.dreamsEyebrow")}
      headline={tr("dash2.dreamsHeadline")}
      body={tr("dash2.dreamsBody")}
      href="/dreams/new"
      linkLabel={tr("dash2.dreamsLink")}
    />,
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

  // Priority: a flame waiting to be charged outranks everything; an
  // untended ancestor comes next; otherwise the stars lead the day.
  const banners =
    state.candlesToCharge > 0
      ? [altarBanner, astrologyBanner, ancestorsBanner, ...restBanners]
      : state.memorialsUntended > 0
        ? [astrologyBanner, ancestorsBanner, altarBanner, ...restBanners]
        : [astrologyBanner, altarBanner, ancestorsBanner, ...restBanners];

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

      {/* ── Hero: the day, the member, the house ─────────────────────── */}
      <section
        aria-label="Today"
        className="px-6 pt-28 pb-12 md:pt-32 md:pb-16"
      >
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 md:gap-8 items-center">
          <div className="text-center md:text-left">
            <Image
              src="/logo-ob-white-banner.png"
              alt="Original Botanica"
              width={200}
              height={145}
              priority
              className="h-auto w-[150px] md:w-[190px] mx-auto md:mx-0 mb-6"
            />
            <p className="display text-3xl md:text-5xl leading-none tracking-wide">
              {tr("dash2.title")}
            </p>
            <p className="eyebrow mt-3 text-[var(--foreground-muted)]">
              {tr("dash2.tagline")}
            </p>
          </div>

          <div className="text-center md:text-right md:border-l md:border-[var(--border)] md:pl-10">
            {sunSign && (
              <p className="display text-2xl md:text-3xl text-[var(--accent)] mb-2">
                {signGlyph(sunSign)}
              </p>
            )}
            <p className="eyebrow text-[var(--foreground-muted)] mb-3">
              {today}
            </p>
            <p className="display text-xl md:text-2xl leading-tight">
              {greeting},
            </p>
            <p className="display text-xl md:text-2xl leading-tight text-[var(--accent)]">
              {displayName}
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto mt-10">
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

  const rec = dailyHoroscope
    ? dailyCandle(
        dailyHoroscope.content.focus,
        new Date().toISOString().slice(0, 10),
      )
    : null;

  return (
    <DashBanner
      image="/dashboard/astrology.webp"
      photoSide="left"
      priority
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
      afterNode={
        rec ? (
          <span className="mt-6 flex items-center gap-4 border-t border-[var(--border)] pt-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={candleImageUrl(rec.candle.slug)}
              alt=""
              aria-hidden
              className="h-16 w-auto rounded shrink-0"
              style={{
                filter: "drop-shadow(0 0 10px rgba(240, 176, 110, 0.35))",
              }}
            />
            <span className="block">
              <span className="eyebrow block mb-1">
                {tr("dash.candleEyebrow")}
              </span>
              <span className="block text-sm text-[var(--foreground-muted)] leading-snug">
                {tr("dash.candleLine", {
                  purpose: desireLabel(rec.desire, locale).toLowerCase(),
                  name: rec.candle.name,
                })}
              </span>
            </span>
          </span>
        ) : undefined
      }
    />
  );
}
