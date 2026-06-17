"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { TarotCard } from "@/lib/tarot/deck";
import { SUIT_ELEMENT } from "@/lib/tarot/deck";

/**
 * The daily tarot card on the dedicated pull page.
 *
 * One card, drawn for this member each day (the draw happens on the server,
 * seeded by user id + date, so it is personal and shows no hydration
 * flicker). The ritual: the member shuffles the deck (a ~3s flourish), the
 * card settles face down, they turn it, and behind it is the actual
 * Rider-Waite image, a reading written for them by the house, and a question
 * to carry through the day.
 *
 * The shuffle is theatre — today's card is already decided on the server, so
 * shuffling never changes the pull. The reading and question come in as props
 * (personalized and cached, with the card's authored house reading as a
 * fallback), so the reveal always has words to show.
 */

const STACK = 9; // cards in the shuffle deck
const STEP_MS = 430; // time per shuffle pose
const SHUFFLE_SEQUENCE = [
  "fan",
  "splitA",
  "riffleA",
  "splitB",
  "riffleB",
  "gather",
] as const;
type Pose = "stack" | (typeof SHUFFLE_SEQUENCE)[number];
type Phase = "idle" | "shuffling" | "revealed";

/** The transform for one card in the deck, for a given shuffle pose. */
function poseTransform(pose: Pose, i: number): string {
  const mid = (STACK - 1) / 2;
  const off = i - mid; // -mid .. +mid
  const half = i < STACK / 2 ? -1 : 1;
  switch (pose) {
    case "stack":
      // A neat deck with a touch of thickness.
      return `translate(${off * 0.6}px, ${-i * 0.8}px) rotate(0deg)`;
    case "fan":
      return `translateX(${off * 16}px) translateY(${-Math.abs(off) * 4}px) rotate(${off * 7}deg)`;
    case "splitA":
      return `translateX(${half * 72}px) translateY(${-Math.abs(off) * 2}px) rotate(${half * 6}deg)`;
    case "riffleA":
      return `translateX(${off * 3}px) translateY(${(i % 2 ? -8 : 8)}px) rotate(0deg)`;
    case "splitB":
      return `translateX(${-half * 72}px) translateY(${-Math.abs(off) * 2}px) rotate(${-half * 6}deg)`;
    case "riffleB":
      return `translateX(${off * 3}px) translateY(${(i % 2 ? 8 : -8)}px) rotate(0deg)`;
    case "gather":
      return `translate(${off * 0.6}px, ${-i * 0.8}px) rotate(0deg)`;
  }
}

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
  const [phase, setPhase] = useState<Phase>("idle");
  const [pose, setPose] = useState<Pose>("stack");
  const [stackVisible, setStackVisible] = useState(false);
  const timers = useRef<number[]>([]);

  const doneKey = `ob-tarot-revealed:${dateLabel}`;
  const elementLine = card.suit
    ? SUIT_ELEMENT[card.suit]
    : "Major Arcana. A turning point on the road.";

  // If the member already turned today's card, start revealed (no reshuffle).
  useEffect(() => {
    try {
      if (localStorage.getItem(doneKey)) setPhase("revealed");
    } catch {
      /* localStorage may be unavailable */
    }
  }, [doneKey]);

  // Clear any pending timers on unmount.
  useEffect(
    () => () => {
      timers.current.forEach((t) => clearTimeout(t));
    },
    [],
  );

  const reveal = useCallback(() => {
    setPhase("revealed");
    try {
      localStorage.setItem(doneKey, "1");
    } catch {
      /* ignore */
    }
  }, [doneKey]);

  const shuffle = useCallback(() => {
    if (phase !== "idle") return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      reveal();
      return;
    }

    setPhase("shuffling");
    setStackVisible(true);
    setPose("stack");

    // Step through the shuffle poses, then settle and turn the card.
    SHUFFLE_SEQUENCE.forEach((p, k) => {
      timers.current.push(
        window.setTimeout(() => setPose(p), 60 + k * STEP_MS),
      );
    });
    const total = 60 + SHUFFLE_SEQUENCE.length * STEP_MS;
    timers.current.push(window.setTimeout(() => setStackVisible(false), total));
    timers.current.push(window.setTimeout(reveal, total + 260));
  }, [phase, reveal]);

  const revealed = phase === "revealed";

  const stackBackStyle: React.CSSProperties = {
    borderRadius: "0.9rem",
    background:
      "radial-gradient(ellipse at 50% 38%, rgba(232,172,124,0.16) 0%, transparent 58%), linear-gradient(160deg,#221a13 0%,#1a140f 55%,#14100b 100%)",
    border: "1px solid var(--border-strong)",
    boxShadow: "0 10px 24px rgba(0,0,0,0.5)",
  };

  return (
    <section aria-label="Your card today" className="border-t border-[var(--border)]">
      <div className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-5 gap-10 md:gap-14 items-center">
        {/* The card — shuffle, then turn. */}
        <div className="md:col-span-2 flex justify-center">
          <div className="relative w-full" style={{ maxWidth: 300 }}>
            <button
              type="button"
              onClick={phase === "idle" ? shuffle : undefined}
              className="tarot-card"
              disabled={phase === "shuffling"}
              aria-label={
                revealed
                  ? card.name
                  : phase === "shuffling"
                    ? "Shuffling the deck"
                    : "Shuffle the deck and draw today's card"
              }
              style={{ cursor: phase === "idle" ? "pointer" : "default" }}
            >
              <span className={`tarot-card-inner ${revealed ? "is-revealed" : ""}`}>
                <span className="tarot-face tarot-back" aria-hidden={revealed}>
                  <span className="tarot-back-frame">
                    <span className="tarot-back-star" />
                    <span className="tarot-back-mark">Original Botanica</span>
                    <span className="tarot-back-hint">
                      {phase === "idle" ? "Tap to shuffle" : " "}
                    </span>
                  </span>
                </span>
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

            {/* The shuffle deck — a flourish over the resting card. */}
            {phase === "shuffling" ? (
              <div
                className="absolute inset-0"
                aria-hidden
                style={{
                  perspective: 1400,
                  opacity: stackVisible ? 1 : 0,
                  transition: "opacity 240ms ease",
                }}
              >
                {Array.from({ length: STACK }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      inset: 0,
                      transformOrigin: "50% 60%",
                      transform: poseTransform(pose, i),
                      transition: `transform ${STEP_MS - 40}ms cubic-bezier(0.45, 0, 0.25, 1)`,
                      transitionDelay: `${Math.abs(i - (STACK - 1) / 2) * 16}ms`,
                      zIndex: i,
                      ...stackBackStyle,
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        inset: 10,
                        borderRadius: "0.6rem",
                        border: "1px solid rgba(232,172,124,0.22)",
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
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
          ) : phase === "shuffling" ? (
            <>
              <h2 className="display text-2xl md:text-3xl mb-5 leading-tight">
                Shuffling the deck…
              </h2>
              <p className="text-[var(--foreground-muted)] leading-relaxed">
                The cards are finding your {dayName(dateLabel)}. Let them settle.
              </p>
            </>
          ) : (
            <>
              <h2 className="display text-2xl md:text-3xl mb-5 leading-tight">
                The deck is ready.
              </h2>
              <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
                One card, pulled for you this {dayName(dateLabel)}. Shuffle the
                deck, turn the card, and read it in the voice of the botanica —
                with a question to sit with for the day.
              </p>
              <button type="button" onClick={shuffle} className="btn-ghost">
                Shuffle the deck
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
