import Image from "next/image";
import Link from "next/link";

/**
 * The dashboard teaser for the daily tarot card.
 *
 * Shows the tarot wheel and invites the member to pull their card. The spin
 * and the reveal happen on the dedicated /tarot page, where the ritual of
 * turning the wheel lives.
 *
 * Server component, no client JS: it is just a styled link. The actual card
 * draw and the personalized reading are generated on the /tarot page, so a
 * member who never opens it costs nothing.
 */
export function DailyTarotTeaser({ dateLabel }: { dateLabel: string }) {
  return (
    <section aria-label="Your card today" className="border-t border-[var(--border)]">
      <div className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-5 gap-10 md:gap-14 items-center">
        {/* The tarot wheel — links to the pull page. */}
        <div className="md:col-span-2 flex justify-center">
          <Link
            href="/tarot"
            className="group block w-full max-w-[320px]"
            aria-label="Go to your daily tarot pull"
          >
            <Image
              src="/tarot-wheel/wheel_full.png"
              alt="The Original Botanica tarot wheel"
              width={320}
              height={323}
              className="w-full h-auto drop-shadow-[0_18px_40px_rgba(0,0,0,0.45)] transition-transform duration-700 ease-out group-hover:scale-[1.04] group-hover:rotate-12"
            />
            <span className="mt-5 block text-center text-[0.62rem] tracking-[0.24em] uppercase text-[var(--foreground-subtle)]">
              Pull your card
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
