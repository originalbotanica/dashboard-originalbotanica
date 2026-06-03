import Link from "next/link";

/**
 * The dashboard teaser for the daily tarot card.
 *
 * Shows the card face down and invites the member to pull it. The reveal
 * itself does not happen here. Tapping the card or the button carries them
 * to the dedicated /tarot page, where the ritual of turning the card lives.
 *
 * Server component, no client JS: it is just a styled link. The actual card
 * draw and the personalized reading are generated on the /tarot page, so a
 * member who never opens it costs nothing.
 */
export function DailyTarotTeaser({ dateLabel }: { dateLabel: string }) {
  return (
    <section aria-label="Your card today" className="border-t border-[var(--border)]">
      <div className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-5 gap-10 md:gap-14 items-center">
        {/* Face-down card — links to the pull page. */}
        <div className="md:col-span-2 flex justify-center">
          <Link
            href="/tarot"
            className="tarot-card"
            aria-label="Go to your daily tarot pull"
          >
            <span className="tarot-card-inner">
              <span className="tarot-face tarot-back">
                <span className="tarot-back-frame">
                  <span className="tarot-back-star" />
                  <span className="tarot-back-mark">Original Botanica</span>
                  <span className="tarot-back-hint">Pull your card</span>
                </span>
              </span>
            </span>
          </Link>
        </div>

        {/* Invitation. */}
        <div className="md:col-span-3">
          <p className="eyebrow mb-4">Your card today</p>
          <h2 className="display text-2xl md:text-3xl mb-5 leading-tight">
            The card is waiting.
          </h2>
          <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
            One card, pulled for you this {dayName(dateLabel)}. A reading in the
            voice of the botanica, written for you, and a question to sit with
            for the day. Step into the pull when you are ready.
          </p>
          <Link href="/tarot" className="btn-ghost inline-flex">
            Reveal today&apos;s card
          </Link>
        </div>
      </div>
    </section>
  );
}

/** "Wednesday, June 3, 2026" -> "Wednesday". Falls back to "day". */
function dayName(dateLabel: string): string {
  const first = dateLabel.split(",")[0]?.trim();
  return first || "day";
}
