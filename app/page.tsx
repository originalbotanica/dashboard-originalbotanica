import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { MarketingHeader } from "@/components/marketing-header";
import { FeatureStrip } from "@/components/feature-strip";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionary";

/**
 * Marketing homepage (logged out). Sells the membership and drives the
 * 7-day free trial. Dark, candlelit, mobile-first, EN/ES. One primary CTA.
 */

const OB_CDN = "https://dlkhclkmyx18n.cloudfront.net";

const OG_IMAGE = `${OB_CDN}/Banners/original-botanica.png`;
const OG_DESC =
  "A 7-day free trial into Original Botanica's spiritual membership: daily tarot, your birth chart, dream interpretation, a virtual altar, an ancestors altar, 400+ rituals — plus 10% off everything at the botanica. A real Bronx botanica, serving practitioners since 1959.";

export const metadata = {
  title: "Your spiritual home, online",
  description: OG_DESC,
  alternates: { canonical: "/" },
  openGraph: {
    title: "Original Botanica — your spiritual home, online",
    description: OG_DESC,
    url: "/",
    type: "website",
    images: [{ url: OG_IMAGE, width: 1200, height: 800, alt: "Original Botanica" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Original Botanica — your spiritual home, online",
    description: OG_DESC,
    images: [OG_IMAGE],
  },
};

/** Voices from the Original Botanica family on using The Practice. */
const TESTIMONIALS: { quote: string; name: string }[] = [
  {
    quote:
      "I pull my card every morning before we open the shop. Two quiet minutes that set the whole day straight — I've come to need it.",
    name: "Yessenia",
  },
  {
    quote:
      "Having the astrologer in my pocket is a different thing. I asked about a hard transit and it gave me the reading and the ritual to go with it. The botanica, just always open.",
    name: "Lara",
  },
  {
    quote:
      "My family is back home and I can't always get to the altar. Lighting a candle for my grandmother here, wherever I am, means more than I expected.",
    name: "Miguel",
  },
  {
    quote:
      "People ask me for the right ritual all day long. Now I carry four hundred of them in one place, each with what it needs. The whole shop's knowledge, with me.",
    name: "Joseph",
  },
  {
    quote:
      "The part regulars love most: your membership takes 10% off everything at originalbotanica.com — even what's already on sale. For anyone who shops the botanica, it pays for itself in a couple of orders.",
    name: "Carmen",
  },
  {
    quote:
      "I wrote down a dream that had been sitting with me for weeks. The interpretation finally gave it meaning, and a small ritual to lay it to rest. I slept easier that night.",
    name: "Rosa",
  },
];

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
  const tr = (k: string, vars?: Record<string, string | number>) => t(locale, k, vars);

  return (
    <main className="flex-1">
      <MarketingHeader />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative min-h-[100svh] flex flex-col items-center justify-center text-center px-6 pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src={`${OB_CDN}/spiritual-candles.png`}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(20,16,11,0.55) 0%, rgba(20,16,11,0.92) 75%, rgba(20,16,11,1) 100%)",
            }}
          />
        </div>

        <Image
          src="/logo-original-botanica.svg"
          alt="Original Botanica"
          width={140}
          height={100}
          priority
          className="h-auto w-[110px] md:w-[140px] mb-8"
        />
        <h1 className="display text-4xl md:text-6xl mb-5 max-w-3xl leading-tight">
          {tr("lp.heroTitle")}
        </h1>
        <p className="invocation text-lg md:text-2xl text-[var(--foreground)] leading-relaxed mb-9 max-w-2xl">
          {tr("lp.heroHook")}
        </p>

        <FeatureStrip
          items={[
            { key: "tarot", label: tr("lp.featTarot") },
            { key: "astrology", label: tr("lp.featAstrology") },
            { key: "dreams", label: tr("lp.featDreams") },
            { key: "altar", label: tr("lp.featAltar") },
            { key: "ancestors", label: tr("lp.featAncestors") },
            { key: "rituals", label: tr("lp.featRituals") },
          ]}
        />

        <p className="text-sm md:text-base text-[var(--foreground-muted)] leading-relaxed mb-9 max-w-xl">
          {tr("lp.heroWhy")}
        </p>

        <Link href="/signup" className="btn-primary text-base">
          {tr("lp.heroCta")}
        </Link>
        <p className="text-sm text-[var(--foreground-muted)] mt-5">
          {tr("lp.heroMicro")}
        </p>
        <p className="text-sm mt-3">
          <Link href="/gift" className="text-[var(--accent)] hover:underline">
            {tr("lp.heroGift")}
          </Link>
        </p>
        <p className="eyebrow mt-12 text-[var(--foreground-subtle)]">
          {tr("lp.heroTrust")}
        </p>
      </section>

      {/* ── The 10% discount — headline benefit ───────────────────────── */}
      <section className="border-t border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-6 py-20 md:py-24 text-center">
          <p className="eyebrow mb-4 text-[var(--accent)]">{tr("lp.discountEyebrow")}</p>
          <h2 className="display text-3xl md:text-4xl mb-5 leading-tight">
            {tr("lp.discountTitle")}
          </h2>
          <p className="text-[var(--foreground-muted)] leading-relaxed mb-6 max-w-xl mx-auto">
            {tr("lp.discountBody")}
          </p>
          <p className="text-sm text-[var(--foreground-subtle)] max-w-md mx-auto">
            {tr("lp.discountTerms")}
          </p>
        </div>
      </section>

      {/* ── The tools ─────────────────────────────────────────────────── */}
      <section
        aria-label={tr("lp.toolsTitle")}
        className="border-t border-[var(--border)]"
      >
        <div className="max-w-5xl mx-auto px-6 py-20 md:py-24">
          <p className="eyebrow mb-3 text-center">{tr("lp.toolsEyebrow")}</p>
          <h2 className="display text-3xl md:text-4xl mb-14 text-center max-w-2xl mx-auto leading-tight">
            {tr("lp.toolsTitle")}
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            <FeatureCard
              href="/tools/tarot"
              imageSrc="/tarot-wheel/wheel_full.png"
              imageFit="contain"
              title={tr("lp.toolTarotTitle")}
              body={tr("lp.toolTarotBody")}
            />
            <FeatureCard
              href="/tools/astrology"
              imageSrc={`${OB_CDN}/cta-spiritual-services.jpg`}
              title={tr("lp.toolAstroTitle")}
              body={tr("lp.toolAstroBody")}
            />
            <FeatureCard
              href="/tools/dreams"
              imageSrc={`${OB_CDN}/incense-smudges-resins.png`}
              title={tr("lp.toolDreamsTitle")}
              body={tr("lp.toolDreamsBody")}
            />
            <FeatureCard
              href="/tools/virtual-altar"
              imageSrc={`${OB_CDN}/transforms/_miscImage/virtual-candle-altar.jpg`}
              title={tr("lp.toolAltarTitle")}
              body={tr("lp.toolAltarBody")}
            />
            <FeatureCard
              href="/tools/ancestors"
              imageSrc={`${OB_CDN}/spiritual-candles.png`}
              title={tr("lp.toolAncestorsTitle")}
              body={tr("lp.toolAncestorsBody")}
            />
            <FeatureCard
              href="/tools/rituals"
              imageSrc={`${OB_CDN}/herbs-roots_2022-09-13-200156_sxob.png`}
              title={tr("lp.toolRitualsTitle")}
              body={tr("lp.toolRitualsBody")}
            />
          </div>
          <div className="text-center mt-14">
            <Link href="/signup" className="btn-primary text-base">
              {tr("lp.heroCta")}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Heritage / authenticity ───────────────────────────────────── */}
      <section className="border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-6 py-20 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="eyebrow mb-4 text-[var(--accent)]">{tr("lp.heritageEyebrow")}</p>
            <h2 className="display text-3xl md:text-4xl mb-5 leading-tight">
              {tr("lp.heritageTitle")}
            </h2>
            <p className="text-[var(--foreground-muted)] leading-relaxed">
              {tr("lp.heritageBody")}
            </p>
          </div>
          <div>
            {/* The building over the decades: A&P → Botanica Eligio's
                Supplies → Original Products, on Webster Ave in the Bronx. */}
            <div
              role="img"
              aria-label={tr("lp.heritageCaption")}
              className="aspect-[4/3] rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--surface)]"
              style={{
                backgroundImage: "url('/heritage/building-then-now.png')",
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
              }}
            />
            <p className="text-xs text-[var(--foreground-subtle)] mt-3 text-center">
              {tr("lp.heritageCaption")}
            </p>
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────── */}
      <section className="border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-6 py-20 md:py-24">
          <p className="eyebrow mb-3 text-center">{tr("lp.testimonialsEyebrow")}</p>
          <h2 className="display text-3xl md:text-4xl mb-3 text-center max-w-2xl mx-auto leading-tight">
            {tr("lp.testimonialsTitle")}
          </h2>
          <p className="text-sm text-[var(--foreground-subtle)] text-center mb-14">
            {tr("lp.testimonialsNote")}
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            {TESTIMONIALS.map((tm) => (
              <figure
                key={tm.name}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6"
              >
                <blockquote className="invocation text-[var(--foreground)] leading-relaxed">
                  “{tm.quote}”
                </blockquote>
                <figcaption className="eyebrow mt-4 text-[var(--accent)]">
                  {tm.name}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ / objections ──────────────────────────────────────────── */}
      <section className="border-t border-[var(--border)]">
        <div className="max-w-2xl mx-auto px-6 py-20 md:py-24">
          <p className="eyebrow mb-3 text-center">{tr("lp.faqEyebrow")}</p>
          <h2 className="display text-3xl md:text-4xl mb-12 text-center leading-tight">
            {tr("lp.faqTitle")}
          </h2>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <details
                key={n}
                className="group border border-[var(--border)] rounded-lg bg-[var(--surface)] px-5 py-4"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none text-[var(--foreground)] font-medium">
                  {tr(`lp.faqQ${n}`)}
                  <span className="text-[var(--accent)] ml-4 transition-transform group-open:rotate-45" aria-hidden>
                    +
                  </span>
                </summary>
                <p className="text-[var(--foreground-muted)] leading-relaxed mt-3 text-sm">
                  {tr(`lp.faqA${n}`)}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────── */}
      <section className="relative border-t border-[var(--border)] overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src={`${OB_CDN}/herbs-roots_2022-09-13-200156_sxob.png`}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-25"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(20,16,11,0.75) 0%, rgba(20,16,11,0.96) 80%, rgba(20,16,11,1) 100%)",
            }}
          />
        </div>
        <div className="max-w-2xl mx-auto px-6 py-24 text-center">
          <h2 className="display text-3xl md:text-4xl mb-6 leading-tight">
            {tr("lp.finalTitle")}
          </h2>
          <p className="text-[var(--foreground-muted)] leading-relaxed mb-10 max-w-lg mx-auto">
            {tr("lp.finalBody")}
          </p>
          <Link href="/signup" className="btn-primary inline-flex text-base">
            {tr("lp.heroCta")}
          </Link>
          <p className="text-sm mt-5">
            <Link href="/gift" className="text-[var(--accent)] hover:underline">
              {tr("lp.heroGift")}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  href,
  imageSrc,
  title,
  body,
  imageFit = "cover",
}: {
  href: string;
  imageSrc: string;
  title: string;
  body: string;
  imageFit?: "cover" | "contain";
}) {
  return (
    <Link href={href} className="group block">
      <div className="relative aspect-[4/3] mb-5 rounded-xl overflow-hidden border border-[var(--border)] group-hover:border-[var(--accent)] transition-colors">
        <Image
          src={imageSrc}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className={`${imageFit === "contain" ? "object-contain p-4" : "object-cover"} transition-transform duration-500 group-hover:scale-105`}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(20,16,11,0) 50%, rgba(20,16,11,0.45) 100%)",
          }}
        />
      </div>
      <h3 className="display text-xl mb-2 group-hover:text-[var(--accent)] transition-colors">
        {title}
      </h3>
      <p className="text-[var(--foreground-muted)] leading-relaxed text-sm">
        {body}
      </p>
    </Link>
  );
}
