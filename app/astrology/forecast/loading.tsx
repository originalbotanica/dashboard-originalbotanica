import Link from "next/link";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionary";

/**
 * Shown while the month's forecast is generated on first view of the month.
 * Generation takes 10 to 15 seconds, so this carries the wait with intention
 * instead of a blank screen.
 */
export default async function ForecastLoading() {
  const locale = await getLocale();
  return (
    <main className="min-h-screen">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/astrology" className="nav-link text-[var(--accent)]">
            ← {t(locale, "astro.eyebrow")}
          </Link>
          <p className="sublabel text-xs">{t(locale, "fc.loadSublabel")}</p>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 pt-20 pb-20">
        <p className="eyebrow mb-4">{t(locale, "fc.loadEyebrow")}</p>
        <h1 className="display text-4xl md:text-5xl mb-6 leading-tight">
          {t(locale, "fc.loadTitle")}
        </h1>
        <p className="invocation text-[var(--foreground-muted)] text-lg leading-relaxed max-w-2xl animate-pulse">
          {t(locale, "fc.loadBody")}
        </p>

        <div className="mt-12 space-y-4 max-w-2xl" aria-hidden>
          <div className="h-4 rounded bg-[var(--surface)] animate-pulse" />
          <div className="h-4 rounded bg-[var(--surface)] animate-pulse w-11/12" />
          <div className="h-4 rounded bg-[var(--surface)] animate-pulse w-4/5" />
          <div className="h-4 rounded bg-[var(--surface)] animate-pulse w-9/12" />
        </div>
      </section>
    </main>
  );
}
