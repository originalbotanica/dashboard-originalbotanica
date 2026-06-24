"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CalEvent } from "@/lib/calendar/events";

type Day = { y: number; m: number; d: number };

/**
 * A month-at-a-glance grid for the spiritual calendar. Days with events show
 * colored dots; tapping a day reveals its observances and their actions.
 * Prev/next page through the months (forward from the current month).
 */
export function CalendarMonthGrid({
  events,
  today,
  locale,
}: {
  events: CalEvent[];
  today: Day;
  locale: "en" | "es";
}) {
  const intl = locale === "es" ? "es-ES" : "en-US";
  const [view, setView] = useState({ y: today.y, m: today.m });
  const [sel, setSel] = useState<Day>(today);

  const byDay = useMemo(() => {
    const map = new Map<number, CalEvent[]>();
    for (const e of events) {
      if (e.y === view.y && e.m === view.m) {
        const arr = map.get(e.d);
        if (arr) arr.push(e);
        else map.set(e.d, [e]);
      }
    }
    return map;
  }, [events, view]);

  const first = new Date(Date.UTC(view.y, view.m - 1, 1));
  const startWeekday = first.getUTCDay(); // 0 Sun … 6 Sat
  const daysInMonth = new Date(Date.UTC(view.y, view.m, 0)).getUTCDate();
  const monthTitle = first.toLocaleDateString(intl, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  // Sun-first weekday initials (Sep 1 2024 was a Sunday).
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Date(Date.UTC(2024, 8, 1 + i)).toLocaleDateString(intl, {
      weekday: "narrow",
      timeZone: "UTC",
    }),
  );

  const cells: (number | null)[] = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const atMonthStart = view.y === today.y && view.m === today.m;
  const step = (delta: number) => {
    let m = view.m + delta;
    let y = view.y;
    if (m < 1) {
      m = 12;
      y--;
    } else if (m > 12) {
      m = 1;
      y++;
    }
    setView({ y, m });
  };

  const isToday = (d: number) =>
    view.y === today.y && view.m === today.m && d === today.d;
  const isSel = (d: number) =>
    sel.y === view.y && sel.m === view.m && sel.d === d;

  const selEvents = events.filter(
    (e) => e.y === sel.y && e.m === sel.m && e.d === sel.d,
  );
  const selLabel = new Date(Date.UTC(sel.y, sel.m - 1, sel.d)).toLocaleDateString(
    intl,
    { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" },
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={atMonthStart}
          aria-label="Previous month"
          className="nav-link text-[var(--foreground-muted)] hover:text-[var(--accent)] disabled:opacity-30 disabled:cursor-not-allowed px-2"
        >
          ←
        </button>
        <p className="display text-xl capitalize">{monthTitle}</p>
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Next month"
          className="nav-link text-[var(--foreground-muted)] hover:text-[var(--accent)] px-2"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {weekdays.map((w, i) => (
          <div key={i} className="text-xs text-[var(--foreground-subtle)] uppercase py-1">
            {w}
          </div>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <div key={`b${i}`} />;
          const evs = byDay.get(d) ?? [];
          return (
            <button
              key={d}
              type="button"
              onClick={() => setSel({ y: view.y, m: view.m, d })}
              className="aspect-square rounded-lg flex flex-col items-center justify-center gap-1 transition-colors hover:bg-[var(--surface)]"
              style={{
                border: isSel(d)
                  ? "1px solid var(--accent)"
                  : "1px solid transparent",
                background: isToday(d) ? "var(--surface)" : undefined,
              }}
            >
              <span
                className={`text-sm ${isToday(d) ? "text-[var(--accent)] font-medium" : "text-[var(--foreground)]"}`}
              >
                {d}
              </span>
              <span className="flex gap-0.5 h-1.5">
                {evs.slice(0, 3).map((e) => (
                  <span
                    key={e.id}
                    className="rounded-full"
                    style={{ width: 5, height: 5, background: e.color }}
                  />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected day detail */}
      <div className="mt-6 border-t border-[var(--border)] pt-5">
        <p className="eyebrow mb-3 text-[var(--foreground-subtle)] capitalize">
          {selLabel}
        </p>
        {selEvents.length === 0 ? (
          <p className="text-sm text-[var(--foreground-muted)]">—</p>
        ) : (
          <ul className="space-y-4">
            {selEvents.map((e) => (
              <li key={e.id} className="flex gap-3">
                <span
                  aria-hidden
                  className="mt-1.5 shrink-0 rounded-full"
                  style={{ width: 10, height: 10, background: e.color, boxShadow: `0 0 10px ${e.color}` }}
                />
                <div>
                  <p className="display text-base leading-tight">{e.title}</p>
                  <p className="text-sm text-[var(--foreground-muted)] leading-relaxed mt-0.5">
                    {locale === "es" ? e.es : e.en}
                  </p>
                  <Link
                    href={e.action.href}
                    className="nav-link inline-flex items-center gap-2 mt-2 text-sm"
                    style={{ color: e.color }}
                  >
                    {locale === "es" ? e.action.es : e.action.en}
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
