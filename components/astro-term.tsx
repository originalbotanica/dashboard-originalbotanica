"use client";

/**
 * A tappable astrology term inside reading prose.
 *
 * Renders the term with a quiet dotted underline. Tapping opens a small
 * card: the plain-language definition, the member's own placement
 * ("In your chart: Saturn in Capricorn · house 5", fetched lazily), and
 * for planets/points a one-tap "Ask about your Saturn" that opens the
 * astrologer with the question ready.
 *
 * Desktop: anchored popover. Phones: bottom sheet. One card open at a
 * time; Escape or any outside tap closes it.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { glossaryEntry, HOUSES } from "@/lib/astrology/glossary";
import { useLocale } from "./locale-provider";

let closeCurrent: (() => void) | null = null;

const STR = {
  en: {
    inYourChart: "In your chart",
    ask: (term: string) => `Ask about your ${term}`,
    house: (n: number) => `The ${ordinalEn(n)} house`,
    question: (term: string) =>
      `What does my ${term} placement mean for me right now?`,
  },
  es: {
    inYourChart: "En tu carta",
    ask: (term: string) => `Pregunta por tu ${term}`,
    house: (n: number) => `La casa ${n}`,
    question: (term: string) =>
      `¿Qué significa la posición de ${term} en mi carta ahora mismo?`,
  },
};

function ordinalEn(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function AstroTerm({
  termKey,
  house,
  children,
}: {
  termKey?: string;
  house?: number;
  children: string;
}) {
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [line, setLine] = useState<string | null>(null);
  const ref = useRef<HTMLSpanElement>(null);
  const t = STR[locale];

  const entry = termKey ? glossaryEntry(termKey) : undefined;
  const title = house
    ? t.house(house)
    : entry
      ? entry.name[locale]
      : children;
  const def = house
    ? HOUSES[house - 1]?.[locale] ?? ""
    : entry
      ? entry.def[locale]
      : "";
  const askable = entry && (entry.kind === "planet" || entry.kind === "point");

  const close = useCallback(() => setOpen(false), []);

  const toggle = useCallback(() => {
    if (open) {
      setOpen(false);
      return;
    }
    closeCurrent?.();
    closeCurrent = close;
    setOpen(true);
    // Personal line, fetched once per open; cheap and cached by the browser.
    if (termKey) {
      fetch(`/api/astrology/term-context?key=${encodeURIComponent(termKey)}`)
        .then((r) => (r.ok ? r.json() : { line: null }))
        .then((d) => setLine(d.line ?? null))
        .catch(() => setLine(null));
    }
  }, [open, close, termKey]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [open, close]);

  if (!entry && !house) return <>{children}</>;

  const card = (
    <div className="rounded-xl border border-[var(--border)] bg-[#1d1812] shadow-2xl p-4 text-left">
      <p className="eyebrow text-xs mb-2 text-[var(--accent)]">{title}</p>
      <p className="text-sm leading-relaxed text-[var(--foreground-muted)]">{def}</p>
      {line && (
        <p className="text-sm mt-3 pt-3 border-t border-[var(--border)] text-[var(--foreground)]">
          <span className="eyebrow text-[10px] block mb-1 text-[var(--foreground-subtle)]">
            {t.inYourChart}
          </span>
          {line}
        </p>
      )}
      {askable && (
        <a
          href={`/astrology/astrologer?ask=${encodeURIComponent(t.question(entry!.name[locale]))}`}
          className="nav-link inline-block text-xs mt-3 text-[var(--accent)]"
        >
          {t.ask(entry!.name[locale])} →
        </a>
      )}
    </div>
  );

  return (
    <span ref={ref} className="relative inline">
      <button
        type="button"
        onClick={toggle}
        className="underline decoration-dotted decoration-[var(--accent)]/50 underline-offset-4 hover:decoration-[var(--accent)] cursor-pointer bg-transparent border-0 p-0 m-0 font-inherit text-inherit"
      >
        {children}
      </button>
      {open && (
        <>
          {/* Desktop: anchored popover */}
          <span className="hidden sm:block absolute z-40 left-0 top-full mt-2 w-80">
            {card}
          </span>
          {/* Phones: bottom sheet */}
          <span className="sm:hidden fixed inset-x-0 bottom-0 z-40 p-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
            {card}
          </span>
        </>
      )}
    </span>
  );
}
