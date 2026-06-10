import Link from "next/link";

/**
 * Shown while the month's forecast is generated on first view of the month.
 * Generation takes 10 to 15 seconds, so this carries the wait with intention
 * instead of a blank screen.
 */
export default function ForecastLoading() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/astrology" className="nav-link text-[var(--accent)]">
            ← Astrology
          </Link>
          <p className="sublabel text-xs">Monthly forecast</p>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 pt-20 pb-20">
        <p className="eyebrow mb-4">Your month</p>
        <h1 className="display text-4xl md:text-5xl mb-6 leading-tight">
          The astrologer is reading your month.
        </h1>
        <p className="invocation text-[var(--foreground-muted)] text-lg leading-relaxed max-w-2xl animate-pulse">
          Your chart, the month&apos;s transits, and the botanica&apos;s archive
          are being read together. This takes a few breaths the first time each
          month. Stay here.
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
