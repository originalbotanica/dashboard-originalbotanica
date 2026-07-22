import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { MarketingHeader } from "@/components/marketing-header";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionary";

/**
 * Marketing homepage (logged out) — Jimmy's landing design.
 * Black + gold, sacred-geometry backdrop, wordmark hero, intro card,
 * six photo tiles, 10%-off banner, heritage block. EN/ES.
 * Photo assets are CDN stand-ins until the designer's exports arrive.
 */

const OB_CDN = "https://dlkhclkmyx18n.cloudfront.net";

// Jimmy's gold. Warmer and yellower than the app accent.
const GOLD = "#d2ac66";
const GOLD_SOFT = "rgba(210, 172, 102, 0.55)";

const OG_IMAGE = `${OB_CDN}/Banners/original-botanica.png`;
const OG_DESC =
  "A 7-day free trial into Original Botanica's spiritual membership: daily tarot, your birth chart, dream interpretation, a virtual altar, an ancestors altar, hundreds of rituals, plus 10% off everything at the botanica. A real Bronx botanica, serving practitioners since 1959.";

export const metadata = {
  title: "The Practice: your virtual spiritual home",
  description: OG_DESC,
  alternates: { canonical: "/" },
  openGraph: {
    title: "The Practice, from Original Botanica",
    description: OG_DESC,
    url: "/",
    type: "website",
    images: [{ url: OG_IMAGE, width: 1200, height: 800, alt: "Original Botanica" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Practice, from Original Botanica",
    description: OG_DESC,
    images: [OG_IMAGE],
  },
};

/** Faint sacred-geometry line work behind the page, like the comp. */
function GeometryBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-20 overflow-hidden"
    >
      <svg
        className="absolute left-1/2 -translate-x-1/2 top-[6%] w-[1400px] max-w-none opacity-[0.05]"
        viewBox="0 0 800 800"
        fill="none"
        stroke={GOLD}
        strokeWidth="1"
      >
        <circle cx="400" cy="400" r="360" />
        <circle cx="400" cy="400" r="250" />
        <circle cx="400" cy="400" r="120" />
        <path d="M400 40 L760 580 L40 580 Z" />
        <path d="M400 760 L760 220 L40 220 Z" />
        <path d="M40 400 H760 M400 40 V760" />
      </svg>
      <svg
        className="absolute left-1/2 -translate-x-1/2 bottom-[2%] w-[1200px] max-w-none opacity-[0.05]"
        viewBox="0 0 800 400"
        fill="none"
        stroke={GOLD}
        strokeWidth="1"
      >
        <circle cx="400" cy="200" r="180" />
        <path d="M20 200 H780" />
        <path d="M60 200 l14 -10 v20 z M740 200 l-14 -10 v20 z" fill={GOLD} />
        <circle cx="200" cy="80" r="2.5" fill={GOLD} />
        <circle cx="620" cy="310" r="2.5" fill={GOLD} />
        <circle cx="90" cy="330" r="2" fill={GOLD} />
        <circle cx="700" cy="60" r="2" fill={GOLD} />
      </svg>
    </div>
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  // Case 1: arriving with ?code=... — exchange it for a session.
  if (params.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(params.code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name")
          .eq("id", user.id)
          .maybeSingle();
        if (!profile?.first_name) redirect("/profile-setup");
        redirect("/dashboard");
      }
    }
  }

  // Case 2: already signed in — route them onward.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile?.first_name) redirect("/profile-setup");
    redirect("/dashboard");
  }

  // Case 3: logged out — marketing.
  const locale = await getLocale();
  const tr = (k: string, vars?: Record<string, string | number>) =>
    t(locale, k, vars);

  return (
    <main className="relative isolate flex-1 bg-[#0d0a07]">
      <GeometryBackdrop />
      <MarketingHeader />

      {/* ── Hero: The Practice wordmark ─────────────────────────────── */}
      <section className="relative isolate flex flex-col items-center justify-center text-center px-6 pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/landing/hero.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-95"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(13,10,7,0.25) 0%, rgba(13,10,7,0.05) 45%, rgba(13,10,7,0.85) 92%, #0d0a07 100%)",
            }}
          />
        </div>

        <p className="uppercase tracking-[0.35em] text-xs md:text-sm text-[var(--foreground)] mb-7">
          {tr("lp2.introducing")}
        </p>

        {/* Wordmark — the brand name stays the same in both languages. */}
        <div
          className="flex items-center gap-5 mb-2"
          style={{ color: GOLD }}
        >
          <span aria-hidden className="h-px w-12 md:w-20" style={{ backgroundColor: GOLD_SOFT }} />
          <span className="display text-3xl md:text-5xl tracking-[0.3em] uppercase">
            The
          </span>
          <span aria-hidden className="h-px w-12 md:w-20" style={{ backgroundColor: GOLD_SOFT }} />
        </div>
        <h1
          className="display text-[4.2rem] md:text-[7.5rem] uppercase tracking-[0.06em] leading-none mb-5"
          style={{ color: GOLD }}
        >
          Practice
        </h1>
        <p
          className="uppercase tracking-[0.3em] text-[0.65rem] md:text-xs mb-8"
          style={{ color: GOLD }}
        >
          {tr("lp2.byline")}
        </p>
        <p className="uppercase tracking-[0.22em] text-base md:text-xl text-white">
          {tr("lp2.tagline")}
        </p>
      </section>

      {/* ── Intro card: photo + pitch ───────────────────────────────── */}
      <section className="px-6">
        <div className="relative isolate max-w-[1400px] mx-auto rounded-md border border-[#b08d52]/60 overflow-hidden">
          {/* Mobile: the photo gets its own block so it stays fully visible. */}
          <div className="relative md:hidden aspect-[4/3]">
            <Image
              src="/landing/intro-card.jpg"
              alt=""
              fill
              sizes="100vw"
              className="object-cover object-left"
            />
          </div>
          <div className="absolute inset-0 -z-10 hidden md:block">
            <Image
              src="/landing/intro-card.jpg"
              alt=""
              fill
              sizes="(max-width: 1400px) 100vw, 1400px"
              className="object-cover"
            />
          </div>
          <div className="p-8 md:p-12 md:ml-[42%] max-w-2xl">
            <h2
              className="display text-[1.55rem] md:text-[2.05rem] uppercase tracking-[0.02em] mb-5 leading-[1.25]"
              style={{ color: GOLD }}
            >
              {tr("lp2.introTitle")}
            </h2>
            <p className="text-[#cfc8bd] leading-relaxed md:text-lg mb-8">
              {tr("lp2.introBody")}
            </p>
            <p
              className="font-semibold leading-relaxed md:text-lg"
              style={{ color: GOLD }}
            >
              {tr("lp2.introHighlight")}
            </p>
          </div>
        </div>
      </section>

      {/* ── The six tools ───────────────────────────────────────────── */}
      <section aria-label={tr("lp.toolsTitle")} className="px-6 py-8">
        <div className="max-w-[1400px] mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
          <ToolTile
            href="/tools/tarot"
            imageSrc="/landing/tile-tarot.jpg"
            title={tr("lp.toolTarotTitle")}
            body={tr("lp.toolTarotBody")}
            learnMore={tr("lp2.learnMore")}
          />
          <ToolTile
            href="/tools/astrology"
            imageSrc="/landing/tile-astrologer.jpg"
            title={tr("lp.toolAstroTitle")}
            body={tr("lp.toolAstroBody")}
            learnMore={tr("lp2.learnMore")}
          />
          <ToolTile
            href="/tools/dreams"
            imageSrc="/landing/tile-dreams.jpg"
            title={tr("lp.toolDreamsTitle")}
            body={tr("lp.toolDreamsBody")}
            learnMore={tr("lp2.learnMore")}
          />
          <ToolTile
            href="/tools/virtual-altar"
            imageSrc="/landing/tile-altar.jpg"
            title={tr("lp.toolAltarTitle")}
            body={tr("lp.toolAltarBody")}
            learnMore={tr("lp2.learnMore")}
          />
          <ToolTile
            href="/tools/ancestors"
            imageSrc="/landing/tile-ancestors.jpg"
            title={tr("lp.toolAncestorsTitle")}
            body={tr("lp.toolAncestorsBody")}
            learnMore={tr("lp2.learnMore")}
          />
          <ToolTile
            href="/tools/rituals"
            imageSrc="/landing/tile-rituals.jpg"
            title={tr("lp.toolRitualsTitle")}
            body={tr("lp.toolRitualsBody")}
            learnMore={tr("lp2.learnMore")}
          />
        </div>
      </section>

      {/* ── 10% off banner + primary CTA ────────────────────────────── */}
      <section className="px-6 py-8">
        <div className="relative isolate max-w-[1400px] mx-auto rounded-md border border-[#b08d52]/60 overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <Image
              src="/landing/banner-botanica.jpg"
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(13,10,7,0.9) 0%, rgba(13,10,7,0.78) 45%, rgba(13,10,7,0.4) 75%, rgba(13,10,7,0.15) 100%)",
              }}
            />
          </div>
          {/* Type scales down a notch at phone widths so nothing overflows
              the rounded banner (clipped on ~360px Android). */}
          <div className="px-6 py-10 md:px-14 md:py-16 max-w-2xl">
            <p className="display uppercase text-3xl sm:text-4xl md:text-5xl leading-tight text-white mb-1 break-words">
              {tr("lp2.joinAndGet")}
            </p>
            <p
              className="display uppercase text-5xl sm:text-7xl md:text-[6.5rem] leading-[0.95] mb-1 break-words"
              style={{ color: GOLD }}
            >
              {tr("lp2.tenOff")}
            </p>
            <p className="display uppercase text-3xl sm:text-4xl md:text-5xl leading-tight text-white mb-3 break-words">
              {tr("lp2.everythingAt")}
            </p>
            <a
              href="https://originalbotanica.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg sm:text-xl md:text-2xl font-semibold text-white hover:underline underline-offset-4 break-all"
            >
              www.originalbotanica.com
            </a>
            <div className="mt-9">
              <Link
                href="/signup"
                className="inline-block uppercase tracking-[0.12em] text-sm font-semibold rounded-sm px-6 py-3 text-[#181207] transition-opacity hover:opacity-90"
                style={{ backgroundColor: GOLD }}
              >
                {tr("lp.heroCta")}
              </Link>
            </div>
            <p className="text-xs text-[#e6dfd2] mt-5 leading-relaxed max-w-xs" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.7)" }}>
              {tr("lp.heroMicro")}{" "}
              <Link href="/gift" className="hover:underline" style={{ color: "#d4b578", textShadow: "0 1px 3px rgba(0,0,0,0.7)" }}>
                {tr("lp.heroGift")}
              </Link>
            </p>
            <p className="text-xs mt-2 leading-relaxed max-w-xs">
              <Link href="/redeem" className="hover:underline" style={{ color: "#d4b578", textShadow: "0 1px 3px rgba(0,0,0,0.7)" }}>
                {tr("lp.heroRedeem")}
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* ── Heritage: a real botanica since 1959 ────────────────────── */}
      <section className="px-6 pb-24 pt-2">
        <div className="relative isolate max-w-[1400px] mx-auto rounded-md border border-[#b08d52]/60 overflow-hidden bg-[#0f0c08]">
          <GeometryBackdrop />
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-10 lg:gap-14 p-8 md:p-12">
            {/* Smaller logo so the storefronts and copy get the room. */}
            <Image
              src="/logo-ob-white-banner.png"
              alt="Original Botanica"
              width={120}
              height={86}
              className="h-auto w-[90px] md:w-[110px] shrink-0"
            />
            {/* Both storefronts, then and now, shown in full — never cropped. */}
            <Image
              src="/landing/heritage-storefronts.jpg"
              alt={tr("lp.heritageCaption")}
              width={436}
              height={570}
              className="h-auto w-full max-w-[320px] md:max-w-[280px] lg:max-w-[330px] shrink-0 rounded-sm"
            />
            <div className="max-w-2xl">
              <h2
                className="display text-[1.6rem] md:text-[2.1rem] uppercase tracking-[0.02em] leading-[1.2] mb-5"
                style={{ color: GOLD }}
              >
                {tr("lp2.heritageTitle")}
              </h2>
              <div className="h-px w-full mb-6" style={{ backgroundColor: GOLD_SOFT }} />
              <p className="text-[#cfc8bd] leading-relaxed mb-5">
                {tr("lp2.heritageBody1")}
              </p>
              <p className="text-white leading-relaxed">
                {tr("lp2.heritageBody2")}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/** A landing tile: full-bleed photo, gold-ruled title, Learn more. */
function ToolTile({
  href,
  imageSrc,
  title,
  body,
  learnMore,
}: {
  href: string;
  imageSrc: string;
  title: string;
  body: string;
  learnMore: string;
}) {
  return (
    <Link
      href={href}
      // aspect-square is the tile's preferred shape; the caption lives in
      // normal flow so a longer caption stretches the tile taller. The
      // overflow clipping lives on the inner image layer, NOT here — an
      // overflow-hidden container refuses to grow for its content, which
      // clipped the title off the top on narrow Android screens.
      className="group relative flex flex-col justify-end aspect-square rounded-md border border-[#b08d52]/60 hover:border-[#d2ac66] transition-colors"
    >
      <span className="absolute inset-0 overflow-hidden rounded-md" aria-hidden>
        <Image
          src={imageSrc}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(13,10,7,0) 40%, rgba(13,10,7,0.35) 60%, rgba(13,10,7,0.65) 100%)",
          }}
        />
      </span>
      <div className="relative p-6">
        <h3 className="display uppercase text-[1.7rem] leading-[1.05] text-white mb-2.5">
          {title}
        </h3>
        <div className="h-px w-24 mb-3" style={{ backgroundColor: GOLD_SOFT }} />
        <p className="text-[0.78rem] text-[#d6cfc4] leading-relaxed max-w-[30ch]">
          {body}
        </p>
        <div className="flex justify-end mt-3">
          <span
            className="uppercase tracking-[0.16em] text-[0.6rem] border rounded-sm px-3 py-1.5 transition-colors group-hover:bg-[#d2ac66] group-hover:text-[#181207]"
            style={{ borderColor: GOLD_SOFT, color: GOLD }}
          >
            {learnMore}
          </span>
        </div>
      </div>
    </Link>
  );
}
