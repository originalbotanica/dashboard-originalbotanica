"use client";

import { useCallback, useEffect, useState } from "react";
import { t, type Locale } from "@/lib/i18n/dictionary";
import type { ChartReading } from "@/lib/astrology/chart-reading";

/**
 * The written natal-chart reading, fetched client-side from
 * /api/chart-reading. The hub page warms the cache in the background, so
 * this is normally an instant cache hit; the one-time first generation
 * (~30s) shows the patient loading line. Fetching client-side (rather than
 * streaming via Suspense) sidesteps a prod issue where the streamed chunk
 * arrived after hydration and the swap never applied, stranding the
 * loading state forever.
 */
export function ChartReadingSection({ locale }: { locale: Locale }) {
  const [reading, setReading] = useState<ChartReading | null>(null);
  const [state, setState] = useState<"loading" | "done" | "error">("loading");

  const load = useCallback(() => {
    setState("loading");
    fetch("/api/chart-reading")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((j) => {
        if (j?.reading) {
          setReading(j.reading as ChartReading);
          setState("done");
        } else {
          setState("error");
        }
      })
      .catch(() => setState("error"));
  }, []);

  useEffect(load, [load]);

  if (state === "loading") {
    return (
      <p className="invocation text-[var(--foreground-muted)] animate-pulse">
        {t(locale, "chart.readingLoading")}
      </p>
    );
  }

  if (state === "error" || !reading) {
    return (
      <div>
        <p className="text-[var(--foreground-muted)] text-sm">
          {t(locale, "chart.readingFail")}
        </p>
        <button
          type="button"
          onClick={load}
          className="btn-ghost inline-flex mt-4 text-sm"
        >
          {t(locale, "chart.readingRetry")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <p className="invocation text-lg text-[var(--foreground-muted)] leading-relaxed">
        {reading.opening}
      </p>
      {reading.sections.map((s) => (
        <div key={s.title}>
          <h2 className="display text-xl mb-2">{s.title}</h2>
          <p className="text-[var(--foreground-muted)] leading-relaxed">{s.body}</p>
        </div>
      ))}
      <p className="invocation text-[var(--foreground-muted)] leading-relaxed border-l-2 border-[var(--accent)] pl-4 py-1">
        {reading.closing}
      </p>
    </div>
  );
}
