import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { MarketingHeader } from "@/components/marketing-header";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionary";

/**
 * Marketing homepage (logged out) — Jimmy's landing design.
 * Hero wordmark, intro card, six photo tiles, 10%-off banner,
 * heritage block. Dark + gold, EN/ES, all links functional.
 * Photo assets are CDN stand-ins until the designer's exports arrive.
 */

const OB_CDN = "https://dlkhclkmyx18n.cloudfront.net";

const OG_IMAGE = `${OB_CDN}/Banners/original-botanica.png`;
const OG_DESC =
  "A 7-day free trial into Original Botanica's spiritual membership: daily tarot, your birth chart, dream interpretation, a virtual altar, an ancestors altar, 400+ rituals — plus 10% off everything at the botanica. A real Bronx botanica, serving practitioners since 1959.";

export const metadata = {
  title: "The Practice — your virtual spiritual home",
  description: OG_DESC,
  alternates: { canonical: "/" },
  openGraph: {
    title: "The Practice — from Original Botanica",
    description: OG_DESC,
    url: "/",
    type: "website",
    images: [{ url: OG_IMAGE, width: 1200, height: 800, alt: "Original Botanica" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Practice — from Original Botanica",
    description: OG_DESC,
    images: [OG_IMAGE],
  },
};

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
    <main className="flex-1">
      <MarketingHeader />

      {/* ── Hero: The Practice wordmark ─────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-40 pb-16 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src={`${OB_CDN}/spiritual-candles.png`}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-35"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(20,16,11,0.45) 0%, rgba(20,16,11,0.85) 70%, rgba(20,16,11,1) 100%)",
            }}
          />
        </div>

        <p className="eyebrow mb-6 tracking-[0.3em]">{tr("lp2.introducing")}</p>

        {/* Wordmark — the brand name stays the same in both languages. */}
        <div className="flex items-center gap-4 text-[var(--accent)] mb-1">
          <span aria-hidden className="h-px w-10 md:w-16 bg-[var(--accent)]" />
          <span className="display text-2xl md:text-4xl tracking-[0.35em] uppercase">
            The
          </span>
          <span aria-hidden className="h-px w-10 md:w-16 bg-[var(--accent)]" />
        </div>
        <h1 className="display text-6xl md:text-8xl uppercase tracking-[0.08em] text-[var(--accent)] leading-none mb-4">
          Practice
        </h1>
        <p className="eyebrow tracking-[0.28em] mb-6">{tr("lp2.byline")}</p>
        <p className="uppercase tracking-[0.2em] text-lg md:text-xl text-[var(--foreground)]">
          {tr("lp2.tagline")}
        </p>
      </section>

      {/* ── Intro card: photo + pitch ───────────────────────────────── */}
      <section className="px-6">
        <div className="max-w-5xl mx-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden grid md:grid-cols-[2fr_3fr]">
          <div className="relative min-h-[260px] md:min-h-full">
            <Image
              src={`${OB_CDN}/cta-spiritual-services.jpg`}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
          <div className="p-8 md:p-12">
            <h2 className="display text-2xl md:text-3xl uppercase tracking-wide text-[var(--accent)] mb-5 leading-snug">
              {tr("lp2.introTitle")}
            </h2>
            <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
              {tr("lp2.introBody")}
            </p>
            <p className="invocation text-[var(--accent)] leading-relaxed border-t border-[var(--border)] pt-6">
              {tr("lp2.introHighlight")}
            </p>
          </div>
        </div>
      </section>

      {/* ── The six tools — photo tiles ─────────────────────────────── */}
      <section aria-label={tr("lp.toolsTitle")} className="px-6 pt-10 pb-4">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ToolTile
            href="/tools/tarot"
            imageSrc={`${OB_CDN}/transforms/Blog/_thumbnail/Tarot-Reading.jpg`}
            title={tr("lp.toolTarotTitle")}
            body={tr("lp.toolTarotBody")}
            learnMore={tr("lp2.learnMore")}
          />
          <ToolTile
            href="/tools/astrology"
            imageSrc={`${OB_CDN}/cta-spiritual-services.jpg`}
            title={tr("lp.toolAstroTitle")}
            body={tr("lp.toolAstroBody")}
            learnMore={tr("lp2.learnMore")}
          />
          <ToolTile
            href="/tools/dreams"
            imageSrc={`${OB_CDN}/incense-smudges-resins.png`}
            title={tr("lp.toolDreamsTitle")}
            body={tr("lp.toolDreamsBody")}
            learnMore={tr("lp2.learnMore")}
          />
          <ToolTile
            href="/tools/virtual-altar"
            imageSrc={`${OB_CDN}/transforms/_miscImage/virtual-candle-altar.jpg`}
            title={tr("lp.toolAltarTitle")}
            body={tr("lp.toolAltarBody")}
            learnMore={tr("lp2.learnMore")}
          />
          <ToolTile
            href="/tools/ancestors"
            imageSrc={`${OB_CDN}/spiritual-candles.png`}
            title={tr("lp.toolAncestorsTitle")}
            body={tr("lp.toolAncestorsBody")}
            learnMore={tr("lp2.learnMore")}
          />
          <ToolTile
            href="/tools/rituals"
            imageSrc={`${OB_CDN}/herbs-roots_2022-09-13-200156_sxob.png`}
            title={tr("lp.toolRitualsTitle")}
            body={tr("lp.toolRitualsBody")}
            learnMore={tr("lp2.learnMore")}
          />
        </div>
      </section>

      {/* ── The six tools ───────────────────────────────────────────── */}
      <section aria-label={tr("lp.toolsTitle")} className="px-6 py-10">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ToolTile
            href="/tools/tarot"
            imageSrc={`${OB_CDN}/transforms/Blog/_thumbnail/Tarot-Reading.jpg`}
            title={tr("lp.toolTarotTitle")}
            body={tr("lp.toolTarotBody")}
            learnMore={tr("lp2.learnMore")}
          />
          <ToolTile
            href="/tools/astrology"
            imageSrc={`${OB_CDN}/cta-spiritual-services.jpg`}
            title={tr("lp.toolAstroTitle")}
            body={tr("lp.toolAstroBody")}
            learnMore={tr("lp2.learnMore")}
          />
          <ToolTile
            href="/tools/dreams"
            imageSrc={`${OB_CDN}/incense-smudges-resins.png`}
            title={tr("lp.toolDreamsTitle")}
            body={tr("lp.toolDreamsBody")}
            learnMore={tr("lp2.learnMore")}
          />
          <ToolTile
            href="/tools/virtual-altar"
            imageSrc={`${OB_CDN}/transforms/_miscImage/virtual-candle-altar.jpg`}
            title={tr("lp.toolAltarTitle")}
            body={tr("lp.toolAltarBody")}
            learnMore={tr("lp2.learnMore")}
          />
          <ToolTile
            href="/tools/ancestors"
            imageSrc={`${OB_CDN}/spiritual-candles.png`}
            title={tr("lp.toolAncestorsTitle")}
            body={tr("lp.toolAncestorsBody")}
            learnMore={tr("lp2.learnMore")}
          />
          <ToolTile
            href="/tools/rituals"
            imageSrc={`${OB_CDN}/herbs-roots_2022-09-13-200156_sxob.png`}
            title={tr("lp.toolRitualsTitle")}
            body={tr("lp.toolRitualsBody")}
            learnMore={tr("lp2.learnMore")}
          />
        </div>
      </section>

      {/* ── 10% off banner + primary CTA ────────────────────────────── */}
      <section className="px-6 py-10">
        <div className="relative max-w-5xl mx-auto rounded-xl border border-[var(--border)] overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <Image
              src={`${OB_CDN}/spiritual-baths-washes.png`}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover opacity-45"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(20,16,11,0.95) 0%, rgba(20,16,11,0.75) 45%, rgba(20,16,11,0.35) 100%)",
              }}
            />
          </div>
          <div className="p-8 md:p-14 max-w-xl">
            <p className="display uppercase tracking-wide text-3xl md:text-4xl leading-tight mb-1">
              {tr("lp2.joinAndGet")}
            </p>
            <p className="display uppercase text-6xl md:text-7xl leading-none text-[var(--accent)] mb-1">
              {tr("lp2.tenOff")}
            </p>
            <p className="display uppercase tracking-wide text-3xl md:text-4xl leading-tight mb-2">
              {tr("lp2.everythingAt")}
            </p>
            <a
              href="https://originalbotanica.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg md:text-xl text-[var(--foreground)] hover:text-[var(--accent)] underline underline-offset-4 transition-colors"
            >
              www.originalbotanica.com
            </a>
            <div className="mt-8">
              <Link href="/signup" className="btn-primary text-sm uppercase tracking-wide">
                {tr("lp.heroCta")}
              </Link>
            </div>
            <p className="text-xs text-[var(--foreground-muted)] mt-4 leading-relaxed">
              {tr("lp.heroMicro")}{" "}
              <Link href="/gift" className="text-[var(--accent)] hover:underline">
                {tr("lp.heroGift")}
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* ── Heritage: a real botanica since 1959 ────────────────────── */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden grid md:grid-cols-2">
          <div className="grid grid-cols-[2fr_3fr]">
            <div className="relative flex items-center justify-center bg-[#2a1430] p-6">
              <Image
                src="/logo-original-botanica.svg"
                alt="Original Botanica"
                width={120}
                height={86}
                className="h-auto w-full max-w-[120px]"
              />
            </div>
            <div
              role="img"
              aria-label={tr("lp.heritageCaption")}
              className="min-h-[240px]"
              style={{
                backgroundImage: "url('/heritage/building-then-now.png')",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
              }}
            />
          </div>
          <div className="p-8 md:p-12">
            <h2 className="display text-2xl md:text-3xl uppercase tracking-wide text-[var(--accent)] mb-5 leading-snug">
              {tr("lp2.heritageTitle")}
            </h2>
            <p className="text-[var(--foreground-muted)] leading-relaxed mb-5 border-t border-[var(--border)] pt-5">
              {tr("lp2.heritageBody1")}
            </p>
            <p className="text-[var(--foreground)] leading-relaxed">
              {tr("lp2.heritageBody2")}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

/** A landing tile: full-bleed photo, title + one-liner, Learn more. */
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
      className="group relative block aspect-[10/11] rounded-xl overflow-hidden border border-[var(--border)] hover:border-[var(--accent)] transition-colors"
    >
      <Image
        src={imageSrc}
        alt=""
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,16,11,0.05) 30%, rgba(20,16,11,0.82) 78%, rgba(20,16,11,0.95) 100%)",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <h3 className="display uppercase tracking-wide text-2xl leading-tight text-[var(--foreground)] mb-2 border-b border-[var(--accent)] pb-2 inline-block group-hover:text-[var(--accent)] transition-colors">
          {title}
        </h3>
        <p className="text-xs text-[var(--foreground-muted)] leading-relaxed mb-3 max-w-[26ch]">
          {body}
        </p>
        <span className="eyebrow text-[0.65rem] tracking-[0.18em] text-[var(--accent)] border border-[var(--accent)] rounded-sm px-2.5 py-1 inline-block">
          {learnMore}
        </span>
      </div>
    </Link>
  );
}
