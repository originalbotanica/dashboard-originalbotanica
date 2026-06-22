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
import { DailyTarotTeaser } from "@/components/daily-tarot-teaser";
import { getMoon, moonGuidance } from "@/lib/astrology/moon";
import { getTodaysSky } from "@/lib/astrology/sky";
import { MoonPhase } from "@/components/moon-phase";
import { ProseLine, buildProductLookup } from "@/lib/rag/render-prose";

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

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const displayName = profile?.first_name || "friend";

  const sunSign = profile?.sun_sign || null;
  // One shared promise, NOT awaited here: the hero and the astrology section
  // both read it behind Suspense boundaries, so the page shell paints
  // instantly and the one cold generation each morning streams in. Sharing
  // the promise means Claude is called once, not once per section.
  const horoscopePromise: Promise<DailyHoroscope | null> =
    sunSign && isValidSign(sunSign)
      ? getOrGenerateDailyHoroscope(sunSign).catch(() => null)
      : Promise.resolve(null);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Label for the tarot teaser copy. The actual card draw and personalized
  // reading happen on the dedicated /tarot page, so the dashboard stays light
  // and costs no generation for members who do not open the pull.
  const tarotDateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  });

  // Tonight's moon — a small daily touchpoint. Pure calculation, no API.
  const moon = getMoon();
  const moonGuide = moonGuidance(moon.bucket);
  const sky = getTodaysSky();

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
          src="/logo-original-botanica.svg"
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
                {sunSign ? `${sunSign}.` : "Welcome to the practice."}
              </h1>
              <p className="invocation text-lg md:text-xl text-[var(--foreground-muted)] mt-8 max-w-2xl leading-relaxed animate-pulse">
                {sunSign
                  ? "The astrologer is reading for you..."
                  : "Add your birth details and the astrologer will read for you each morning."}
              </p>
            </>
          }
        >
          <HeroInvocation sunSign={sunSign} horoscopePromise={horoscopePromise} />
        </Suspense>

        <MembershipPrompt sub={sub} trialLeft={trialLeft} />
      </section>

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
                Tonight&apos;s moon
              </p>
              <p className="display text-xl md:text-2xl leading-tight">
                {moon.phaseName} in {sky.moonSign} · {moon.illuminationPct}% lit
              </p>
              <p className="text-[var(--foreground-muted)] text-sm leading-relaxed mt-1">
                {moonGuide.title}
              </p>
            </div>
            <span className="nav-link text-[var(--accent)] hidden sm:inline-flex items-center gap-2 shrink-0">
              The lunar guide
              <span aria-hidden>→</span>
            </span>
          </div>
        </Link>
      </section>

      {/* ── 2. Astrology — image left ─────────────────────────────────── */}
      <Suspense
        fallback={
          <ToolSection
            eyebrow="Today's reading"
            headline="Your chart, your reading."
            body="The astrologer is reading for you. For a longer reading rooted in your full chart, speak with the astrologer."
            href="/astrology"
            linkLabel="Ask your astrologer"
            imageSrc={`${OB_CDN}/cta-spiritual-services.jpg`}
            imageSide="left"
          />
        }
      >
        <AstrologySection sunSign={sunSign} horoscopePromise={horoscopePromise} />
      </Suspense>

      {/* ── 3. Dreams — image right ───────────────────────────────────── */}
      <ToolSection
        eyebrow="Dreams"
        headline="What did the night bring?"
        body="Describe a dream while it's still fresh. The interpretation honors Lucumí, Espiritismo, folk Catholic, and Western traditions. Every dream ends with a ritual."
        href="/dreams/new"
        linkLabel="Interpret a dream"
        imageSrc={`${OB_CDN}/incense-smudges-resins.png`}
        imageSide="right"
      />

      {/* ── 4. Daily tarot — teaser linking to the dedicated pull page ─── */}
      <DailyTarotTeaser dateLabel={tarotDateLabel} />

      {/* ── 5. Virtual altar — image right ────────────────────────────── */}
      <ToolSection
        eyebrow="Virtual altar"
        headline="Light a candle."
        body="For an intention. For protection. For someone you love who needs the prayer. Choose your candle, write your petition, and let it burn on your altar. Add it to the community altar so others hold the intention with you."
        href="/altar/virtual"
        linkLabel="Light a candle"
        imageSrc={`${OB_CDN}/transforms/_miscImage/virtual-candle-altar.jpg`}
        imageSide="right"
      />

      {/* ── 6. Ancestors altar — image left ───────────────────────────── */}
      <ToolSection
        eyebrow="Ancestors altar"
        headline="A flame for those who came before."
        body="Memorialize the ones you carry. Their names lit. Their stories with you. Share a private link with family so they can add their light."
        href="/ancestors"
        linkLabel="Visit your ancestors"
        imageSrc={`${OB_CDN}/spiritual-candles.png`}
        imageSide="left"
      />

      {/* ── 7. Rituals library — image right ──────────────────────────── */}
      <ToolSection
        eyebrow="The rituals library"
        headline="More than four hundred rituals, organized by purpose."
        body="Money drawing. Uncrossing. Road opening. Protection. Love that needs to land. Real workings from sixty-six years of practice, each with its steps, its supplies, and the day to do it. Search by your need and save the ones you return to."
        href="/rituals"
        linkLabel="Browse the library"
        imageSrc={`${OB_CDN}/herbs-roots_2022-09-13-200156_sxob.png`}
        imageSide="right"
      />

      {/* ── 8. Member benefit — image left ────────────────────────────── */}
      <ToolSection
        eyebrow="A member benefit"
        headline="10% off at the botanica."
        body="Sign in to originalbotanica.com with the same email and your discount applies automatically at checkout. Every candle, oil, herb, and bath."
        href="https://originalbotanica.com"
        linkLabel="Shop the botanica"
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
            Give the gift of guidance
          </p>
          <h2 className="display text-2xl md:text-4xl leading-tight mb-5">
            Know someone walking a hard road?
          </h2>
          <p className="text-[var(--foreground-muted)] leading-relaxed mb-8 max-w-xl mx-auto">
            Give them a season at the botanica — daily tarot, dream
            interpretation, a place to honor their ancestors, and a spiritualist
            to talk with. A gift for a new practitioner, a grieving friend, or
            anyone who could use a little light.
          </p>
          <Link href="/gift" className="btn-primary inline-flex">
            Gift a membership
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
          {sunSign}. The candle is lit.
        </h1>
        <p className="invocation text-lg md:text-xl text-[var(--foreground-muted)] mt-8 max-w-2xl leading-relaxed">
          Today&apos;s reading could not be drawn just now. Refresh in a
          moment, or ask the astrologer directly.
        </p>
      </>
    );
  }
  return (
    <>
      <h1 className="display text-4xl md:text-6xl max-w-3xl leading-[1.05]">
        Welcome to the practice.
      </h1>
      <p className="invocation text-lg md:text-xl text-[var(--foreground-muted)] mt-8 max-w-2xl leading-relaxed">
        Add your birth details and the astrologer will read for you each
        morning.
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
  return (
    <ToolSection
      eyebrow="Today's reading"
      headlineNode={
        dailyHoroscope ? (
          <ProseLine
            text={dailyHoroscope.content.action}
            lookup={EMPTY_LOOKUP}
            optimisticBaseUrl={OB_BASE_URL}
          />
        ) : (
          "Your chart, your reading."
        )
      }
      body={
        dailyHoroscope
          ? `Drawn from your ${sunSign} placement. For a longer reading rooted in your full chart, speak with the astrologer.`
          : "Add your birth date and city to receive a daily reading personal to you, and to begin conversations with the astrologer."
      }
      href="/astrology"
      linkLabel="Ask your astrologer"
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
