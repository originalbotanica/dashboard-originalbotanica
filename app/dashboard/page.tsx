import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionStatus, trialDaysLeft } from "@/lib/subscription";
import { getOrGenerateDailyHoroscope } from "@/lib/daily-horoscope/generate";
import { isValidSign } from "@/lib/daily-horoscope/prompt";
import { MemberHeader } from "@/components/member-header";
import { Candle } from "@/components/candle";
import { DailyTarotTeaser } from "@/components/daily-tarot-teaser";
import { ProseLine, buildProductLookup } from "@/lib/rag/render-prose";

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

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const displayName = profile?.first_name || "friend";

  const sunSign = profile?.sun_sign || null;
  const dailyHoroscope =
    sunSign && isValidSign(sunSign)
      ? await getOrGenerateDailyHoroscope(sunSign).catch(() => null)
      : null;

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

  return (
    <main className="flex-1">
      {/* ── 1. Hero — candlelit invocation ────────────────────────────── */}
      <section
        aria-label="Today"
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-24 overflow-hidden"
      >
        <MemberHeader />

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

        {/* Today's invocation — daily horoscope or fallback */}
        {sunSign && dailyHoroscope ? (
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
        ) : (
          <>
            <h1 className="display text-4xl md:text-6xl max-w-3xl leading-[1.05]">
              Welcome to the practice.
            </h1>
            <p className="invocation text-lg md:text-xl text-[var(--foreground-muted)] mt-8 max-w-2xl leading-relaxed">
              Add your birth details and the astrologer will read for you each
              morning.
            </p>
          </>
        )}

        {sub.isTrialing && trialLeft !== null && (
          <p className="eyebrow mt-16 text-[var(--accent)]">
            {trialLeft} {trialLeft === 1 ? "day" : "days"} left in your trial
          </p>
        )}
      </section>

      {/* ── 2. Astrology — image left ─────────────────────────────────── */}
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
        body="For an intention. For protection. For someone you love who needs the prayer. The candle burns at the botanica and on your altar surface here."
        href="/altar/virtual"
        linkLabel="Tend the altar"
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
    </main>
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
    <div className="md:col-span-2 relative aspect-square rounded-xl overflow-hidden border border-[var(--border)]">
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
