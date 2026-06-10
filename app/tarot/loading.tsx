import Link from "next/link";

/**
 * Shown while the day's personalized reading is generated on first view.
 * Mirrors the page's header and title so the swap-in feels seamless.
 */
export default function TarotLoading() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="nav-link text-[var(--accent)]">
            ← Dashboard
          </Link>
          <p className="sublabel text-xs">Daily tarot</p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 pt-16 text-center">
        <h1 className="display text-3xl md:text-5xl leading-tight">
          Your card for today.
        </h1>
        <p className="invocation text-[var(--foreground-muted)] mt-5 max-w-xl mx-auto leading-relaxed animate-pulse">
          The deck is being shuffled and your reading written. A few seconds.
        </p>

        {/* Face-down card placeholder, same footprint as the real pull. */}
        <div className="mt-14 mx-auto w-[220px] md:w-[260px] aspect-[3/5] rounded-xl border border-[var(--border)] bg-[var(--surface)] animate-pulse" />
      </div>
    </main>
  );
}
