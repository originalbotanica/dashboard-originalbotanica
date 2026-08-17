"use client";

/**
 * "The counter" — ask what you need, the house suggests a candle.
 *
 * The digital version of asking at the register: a member types
 * "I need to find a new job" and gets one or two candles from the real
 * shelf, each with a plain-spoken why, a Light-this-candle button that
 * opens the lighting flow with the candle chosen and their own words as
 * the starting intention, and a quiet link to the real candle at the
 * store (members get 20% off).
 */

import { useState } from "react";
import { candleImageUrl } from "@/lib/altar/catalog";
import { useLocale } from "./locale-provider";

type Pick = { slug: string; name: string; tagline: string; why: string };

const STR = {
  en: {
    eyebrow: "Ask at the counter",
    lead: "Whatever you're carrying, there's a candle for it. Share what's on your heart, and we'll help you choose.",
    ph: "I need to find a new job...",
    go: "Ask",
    thinking: "Choosing from the shelf...",
    light: "Light this candle",
    store: "Get the real candle · members save 20%",
    err: "The counter is busy right now. Please try again in a moment.",
  },
  es: {
    eyebrow: "Pregunta en el mostrador",
    lead: "Sea lo que sea que cargas, hay una vela para eso. Cuéntanos qué llevas en el corazón y te ayudamos a elegir.",
    ph: "Necesito encontrar un nuevo trabajo...",
    go: "Preguntar",
    thinking: "Eligiendo de la repisa...",
    light: "Enciende esta vela",
    store: "Consigue la vela real · miembros ahorran 20%",
    err: "El mostrador está ocupado. Intenta de nuevo en un momento.",
  },
};

export function CandleCounter() {
  const locale = useLocale();
  const t = STR[locale];
  const [need, setNeed] = useState("");
  const [picks, setPicks] = useState<Pick[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function ask() {
    const q = need.trim();
    if (q.length < 3 || busy) return;
    setBusy(true);
    setError(false);
    setPicks(null);
    try {
      const res = await fetch("/api/altar/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ need: q }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { picks: Pick[] };
      setPicks(data.picks);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto text-center">
      <p className="eyebrow mb-2">{t.eyebrow}</p>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-5">{t.lead}</p>
      <form
        className="flex gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          ask();
        }}
      >
        <input
          type="text"
          value={need}
          onChange={(e) => setNeed(e.target.value)}
          placeholder={t.ph}
          maxLength={300}
          className="form-input flex-1"
        />
        <button
          type="submit"
          disabled={busy || need.trim().length < 3}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ whiteSpace: "nowrap" }}
        >
          {t.go}
        </button>
      </form>

      {busy && (
        <p className="text-sm text-[var(--foreground-subtle)] italic mt-5">{t.thinking}</p>
      )}
      {error && <p className="form-error mt-5">{t.err}</p>}

      {picks && (
        <div className={`grid gap-4 mt-8 text-left ${picks.length > 1 ? "sm:grid-cols-2" : "max-w-sm mx-auto"}`}>
          {picks.map((p) => (
            <div
              key={p.slug}
              className="border border-[var(--border)] rounded-xl p-5 bg-[var(--surface)] flex flex-col items-center text-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={candleImageUrl(p.slug)}
                alt={p.name}
                className="h-40 w-auto rounded-lg mb-4"
              />
              <p className="display text-lg mb-1">{p.name}</p>
              <p className="sublabel text-xs mb-3">{p.tagline}</p>
              <p className="text-sm text-[var(--foreground-muted)] leading-relaxed mb-4">
                {p.why}
              </p>
              <a
                href={`/altar/virtual/new?candle=${encodeURIComponent(p.slug)}&intention=${encodeURIComponent(need.trim())}`}
                className="btn-primary text-sm mb-2"
              >
                {t.light}
              </a>
              <a
                href={`https://originalbotanica.com/search?q=${encodeURIComponent(p.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link text-xs text-[var(--foreground-subtle)] hover:text-[var(--accent)]"
              >
                {t.store}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
