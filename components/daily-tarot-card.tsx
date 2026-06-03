"use client";

import { useState } from "react";
import Image from "next/image";
import type { TarotCard } from "@/lib/tarot/deck";
import { SUIT_ELEMENT } from "@/lib/tarot/deck";

/**
 * The daily tarot card on the member dashboard.
 *
 * One card, drawn for this member each day (the draw happens on the server,
 * seeded by user id + date, so it is personal and shows no hydration
 * flicker). The card arrives face down. The member turns it. Behind it: the
 * actual Rider-Waite image, a reading written for this member by the house,
 * and a question to carry through the day.
 *
 * The reading and question come in as props. The dashboard generates them
 * (personalized, cached) and falls back to the card's authored house reading
 * if generation is unavailable, so this component always has words to show.
 */
export function DailyTarotCard({
  card,
  dateLabel,
  imageSrc,
  reading,
  question,
}: {
  card: TarotCard;
  dateLabel: string;
  imageSrc: string;
  reading: string;
  question: string;
}) {
  const [revealed, setRevealed] = useState(false);

  const elementLine = card.suit
    ? SUIT_ELEMENT[card.suit]
    : "Major Arcana. A turning point on the road.";

  return (
    <section aria-label="Your card today" className="border-t border-[var(--border)]">
      <div className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-5 gap-10 md:gap-14 items-center">
        {/* The card itself — tap to turn. */}
        <div className="md:col-span-2 flex justify-center">
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            className="tarot-card"
            aria-pressed={revealed}
            aria-label={
              revealed
                ? `${card.name}. Tap to turn the card back over.`
                : "Tap to reveal today's tarot card."
            }
          >
            <span className={`tarot-card-inner ${revealed ? "is-revealed" : ""}`}>
              {/* Back of the card — what you see first. */}
              <span className="tarot-face tarot-back" aria-hidden={revealed}>
                <span className="tarot-back-frame">
                  <span className="tarot-back-star" />
                  <span className="tarot-back-mark">Original Botanica</span>
                  <span className="tarot-back-hint">Tap to reveal</span>
                </span>
              </span>

              {/* Face of the card — the day's pull, the real image. The
                  Rider-Waite art carries its own title, so no caption here. */}
              <span className="tarot-face tarot-front" aria-hidden={!revealed}>
                <Image
                  src={imageSrc}
                  alt={card.name}
                  fill
                  sizes="(max-width: 768px) 70vw, 300px"
                  className="tarot-front-img"
                />
              </span>
            </span>
          </button>
        </div>

        {/* The reading. */}
        <div className="md:col-span-3">
          <p className="eyebrow mb-4">Your card today</p>

          {revealed ? (
            <>
              <h2 className="display text-2xl md:text-3xl mb-2 leading-tight">
                {card.name}
              </h2>
              <p className="eyebrow mb-6 text-[var(--foreground-subtle)]">
                {elementLine}
              </p>
              <p className="text-[var(--foreground-muted)] leading-relaxed mb-8 whitespace-pre-line">
                {reading}
              </p>
              {question ? (
                <div className="invocation text-[var(--foreground)] border-l-2 border-[var(--accent)] pl-4 py-2">
                  {question}
                </div>
              ) : null}
            </>
          ) : (
            <>
              <h2 className="display text-2xl md:text-3xl mb-5 leading-tight">
                The card is waiting.
              </h2>
              <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
                One card, pulled for you this {dayName(dateLabel)}. A reading in
                the voice of the botanica, written for you, and a question to sit
                with for the day. Turn it when you are ready.
              </p>
              <button
                type="button"
                onClick={() => setRevealed(true)}
                className="btn-ghost"
              >
                Reveal today&apos;s card
              </button>
            </>
          )}
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
