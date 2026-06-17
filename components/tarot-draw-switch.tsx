"use client";

import { useEffect, useState } from "react";
import type { TarotCard } from "@/lib/tarot/deck";
import { DailyTarotCard } from "./daily-tarot-card";
import { TarotWheel } from "./tarot-wheel";

/**
 * TEMPORARY testing switch for the tarot draw.
 *
 * Lets Jason and his partner flip between the two experiences — the shuffle
 * deck (current live) and Chris's spinning wheel — on the same page, so they
 * can compare before launch. The choice is remembered per browser. A ?draw=
 * query param wins over the saved choice so a direct link can force a mode.
 *
 * This whole component (and the toggle) is meant to be removed once a winner
 * is chosen — see step 4 of the rollout. The page keeps both draws wired, so
 * deleting this file and rendering the chosen one directly is a small change.
 */

type Mode = "shuffle" | "wheel";

const STORE_KEY = "ob-tarot-draw-mode";

export function TarotDrawSwitch({
  initialMode,
  fromQuery,
  shuffle,
  wheel,
}: {
  initialMode: Mode;
  fromQuery: boolean;
  shuffle: {
    card: TarotCard;
    dateLabel: string;
    imageSrc: string;
    reading: string;
    question: string;
  };
  wheel: {
    index: number;
    reversed: boolean;
    reading: string;
    dayKey: string;
    dateLabel: string;
  };
}) {
  const [mode, setMode] = useState<Mode>(initialMode);

  // If the URL did not force a mode, restore the tester's last choice.
  useEffect(() => {
    if (fromQuery) return;
    try {
      const saved = localStorage.getItem(STORE_KEY);
      if (saved === "wheel" || saved === "shuffle") setMode(saved);
    } catch {
      /* ignore */
    }
  }, [fromQuery]);

  function pick(m: Mode) {
    setMode(m);
    try {
      localStorage.setItem(STORE_KEY, m);
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      <div className="max-w-5xl mx-auto px-6 mt-8 flex flex-col items-center">
        <div
          role="group"
          aria-label="Choose the tarot draw (testing)"
          className="inline-flex rounded-full border border-[var(--border)] p-1"
        >
          <button
            type="button"
            onClick={() => pick("shuffle")}
            aria-pressed={mode === "shuffle"}
            className={`nav-link rounded-full px-5 py-2 ${
              mode === "shuffle"
                ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                : "text-[var(--foreground-muted)]"
            }`}
          >
            Shuffle deck
          </button>
          <button
            type="button"
            onClick={() => pick("wheel")}
            aria-pressed={mode === "wheel"}
            className={`nav-link rounded-full px-5 py-2 ${
              mode === "wheel"
                ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                : "text-[var(--foreground-muted)]"
            }`}
          >
            Spinning wheel
          </button>
        </div>
        <p className="text-xs text-[var(--foreground-subtle)] mt-3">
          Preview toggle — for testing only. Members will see just one.
        </p>
      </div>

      {mode === "wheel" ? (
        <TarotWheel
          index={wheel.index}
          reversed={wheel.reversed}
          reading={wheel.reading}
          dayKey={wheel.dayKey}
          dateLabel={wheel.dateLabel}
        />
      ) : (
        <DailyTarotCard
          card={shuffle.card}
          dateLabel={shuffle.dateLabel}
          imageSrc={shuffle.imageSrc}
          reading={shuffle.reading}
          question={shuffle.question}
        />
      )}
    </>
  );
}
