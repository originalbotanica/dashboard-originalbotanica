import Link from "next/link";
import Image from "next/image";
import { MarketingHeader } from "@/components/marketing-header";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionary";

const OB_CDN = "https://dlkhclkmyx18n.cloudfront.net";

/**
 * Shared layout for a marketing tool detail page.
 *
 * Each tool passes its own hero (eyebrow + headline + subhead + image)
 * and body content as children. The layout handles the consistent shell:
 * floating header, atmospheric hero with backdrop image, body container,
 * trial CTA at the bottom. Chrome strings are bilingual via the shared
 * dictionary (mkt.* keys).
 */
export async function MarketingToolLayout({
  eyebrow,
  headline,
  subhead,
  heroImageUrl,
  children,
}: {
  eyebrow: string;
  headline: string;
  subhead: string;
  heroImageUrl: string;
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  return (
    <main className="flex-1">
      <MarketingHeader />

      {/* Hero with full-bleed photography */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-6 pt-28 pb-16 overflow-hidden">
        {/* Clear way back to the main page from a tool's detail view. */}
        <Link
          href="/"
          className="absolute top-24 left-6 z-10 inline-flex items-center gap-1.5 nav-link text-sm text-[var(--foreground-muted)] hover:text-[var(--accent)] transition-colors"
        >
          <span aria-hidden>←</span> {t(locale, "mkt.allTools")}
        </Link>

        <div className="absolute inset-0 -z-10">
          <Image
            src={heroImageUrl}
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
                "radial-gradient(ellipse at center, rgba(20,16,11,0.55) 0%, rgba(20,16,11,0.95) 80%)",
            }}
          />
        </div>

        <p className="eyebrow mb-4 text-[var(--accent)]">{eyebrow}</p>
        <h1 className="display text-4xl md:text-6xl mb-6 max-w-3xl leading-tight">
          {headline}
        </h1>
        <p className="text-lg md:text-xl text-[var(--foreground-muted)] leading-relaxed max-w-2xl">
          {subhead}
        </p>
      </section>

      {/* Body content (passed by the specific tool page) */}
      <section className="border-t border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-6 py-20">{children}</div>
      </section>

      {/* Closing CTA on warm backdrop */}
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
                "radial-gradient(ellipse at center, rgba(20,16,11,0.78) 0%, rgba(20,16,11,0.96) 80%)",
            }}
          />
        </div>
        <div className="max-w-2xl mx-auto px-6 py-24 text-center">
          <h2 className="display text-3xl md:text-4xl mb-6 leading-tight">
            {t(locale, "mkt.ctaHeadline")}
          </h2>
          <p className="text-[var(--foreground-muted)] leading-relaxed mb-10 max-w-lg mx-auto">
            {t(locale, "mkt.ctaBody")}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/signup" className="btn-primary">
              {t(locale, "mkt.startTrial")}
            </Link>
            <Link href="/" className="btn-ghost">
              {t(locale, "mkt.allTools")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
