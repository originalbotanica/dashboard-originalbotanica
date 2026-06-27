"use client";

import { useRef, useState, type CSSProperties } from "react";
import { lightCandleAction } from "@/app/altar/virtual/actions";
import { PendingSubmit } from "@/components/pending-submit";
import {
  DESIRES,
  DURATIONS,
  candleImageUrl,
  type Desire,
  type CandleArt,
} from "@/lib/altar/catalog";

/**
 * The light-a-candle picker, mirroring the live altar flow:
 *   1. choose a desire   2. choose a candle   3. write the dedication.
 */
export function LightCandleForm({
  initialIntention,
}: {
  initialIntention?: string;
}) {
  const [desire, setDesire] = useState<Desire | null>(null);
  const [candle, setCandle] = useState<CandleArt | null>(null);
  const [lit, setLit] = useState(false);
  // "armed" = the member has filled the details and pressed "Light the
  // candle"; now we send them up to tap the wick. The wick tap lights the
  // flame and then submits, so the order is: details -> light -> tap wick.
  const [armed, setArmed] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const candleRef = useRef<HTMLDivElement>(null);

  function armAndScroll() {
    const f = formRef.current;
    if (!f) return;
    // Make them fill the required dedication before lighting.
    if (!f.checkValidity()) {
      f.reportValidity();
      return;
    }
    setArmed(true);
    candleRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function lightAndPlace() {
    setLit(true);
    // Let the flame catch for a beat, then place the candle.
    setTimeout(() => formRef.current?.requestSubmit(), 650);
  }

  // Step 1 — choose a desire
  if (!desire) {
    return (
      <div>
        <p className="form-label mb-4">Choose your intention</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {DESIRES.map((d) => (
            <button
              key={d.slug}
              type="button"
              onClick={() => setDesire(d)}
              className="altar-choice"
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Step 2 — choose a candle for that desire
  if (!candle) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setDesire(null)}
          className="nav-link text-[var(--accent)] mb-6"
        >
          ← {desire.label}
        </button>
        <p className="form-label mb-4">Choose your candle</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {desire.candles.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => setCandle(c)}
              className="text-left rounded-xl border border-[var(--border-strong)] p-3 hover:border-[var(--accent)] hover:bg-[var(--surface)] transition-colors flex flex-col items-center text-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={candleImageUrl(c.slug)}
                alt={c.name}
                width={120}
                height={120}
                className="rounded-lg object-cover mb-3"
                style={{ width: 120, height: 120 }}
              />
              <span className="display text-sm leading-tight">{c.name}</span>
              <span className="text-xs text-[var(--foreground-subtle)] mt-1 leading-snug">
                {c.tagline}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Step 3 — dedication + petition + duration + public, then light it
  return (
    <form ref={formRef} action={lightCandleAction} className="space-y-10">
      <input type="hidden" name="candle_type" value={desire.slug} />
      <input type="hidden" name="candle_color" value={candle.slug} />

      {/* Candle preview. Write the dedication below first; "Light the candle"
          brings you back up here to tap the wick, which lights and places it. */}
      <div
        ref={candleRef}
        className="flex flex-col items-center text-center scroll-mt-24"
      >
        <span
          className="relative inline-block"
          style={{
            width: 164,
            filter: lit
              ? "drop-shadow(0 0 28px rgba(240, 176, 110, 0.55))"
              : "none",
            transition: "filter 1s ease",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={candleImageUrl(candle.slug)}
            alt={candle.name}
            className="rounded-xl block"
            style={{
              width: 164,
              height: "auto",
              opacity: lit ? 1 : 0.95,
              transition: "opacity .8s ease",
            }}
          />
          {lit && (
            <span
              aria-hidden
              className="altar-flame"
              style={{ "--fw": "13px", top: 19 } as CSSProperties}
            >
              <span className="af-halo" />
              <span className="af-cast" />
              <span className="af-outer" />
              <span className="af-inner" />
            </span>
          )}
          {armed && !lit && (
            <button
              type="button"
              onClick={lightAndPlace}
              aria-label="Tap the wick to light the candle"
              className="absolute left-1/2 -translate-x-1/2 rounded-full flex items-start justify-center"
              style={{
                top: 0,
                width: "60%",
                height: "26%",
                cursor: "pointer",
                background: "transparent",
              }}
            >
              <span
                aria-hidden
                className="block rounded-full animate-ping"
                style={{
                  marginTop: 8,
                  width: 18,
                  height: 18,
                  background: "rgba(240, 176, 110, 0.6)",
                }}
              />
            </button>
          )}
        </span>
        <p className="display text-lg leading-tight mt-5">{candle.name}</p>
        <p className="text-sm text-[var(--foreground-muted)]">{candle.tagline}</p>
        <p
          className={`invocation mt-3 ${
            armed && !lit
              ? "text-[var(--accent)] text-lg md:text-xl font-medium animate-pulse"
              : "text-[var(--foreground-muted)] text-sm"
          }`}
        >
          {lit
            ? "The flame is lit."
            : armed
              ? "↑ Tap the wick to light the candle."
              : "Write your dedication below, then light the candle."}
        </p>
        <button
          type="button"
          onClick={() => {
            setCandle(null);
            setLit(false);
            setArmed(false);
          }}
          className="nav-link text-[var(--accent)] mt-3"
        >
          Change candle
        </button>
      </div>

      <div className="space-y-10">
      <div>
        <label htmlFor="intention" className="form-label">
          Dedication
        </label>
        <input
          id="intention"
          name="intention"
          type="text"
          required
          maxLength={200}
          defaultValue={initialIntention}
          placeholder="For my mother's healing"
          className="form-input"
        />
        <p className="text-xs text-[var(--foreground-subtle)] mt-2">
          Shown beneath your candle. Keep it short.
        </p>
      </div>

      <div>
        <label htmlFor="petition" className="form-label">
          Your petition{" "}
          <span className="normal-case text-[var(--foreground-subtle)]">(optional)</span>
        </label>
        <textarea
          id="petition"
          name="petition"
          rows={5}
          maxLength={2000}
          placeholder="Speak your prayer here. What are you asking for, and for whom."
          className="form-input"
        />
      </div>

      <fieldset>
        <legend className="form-label mb-3">How long it burns</legend>
        <div className="flex flex-wrap gap-3">
          {DURATIONS.map((d, i) => (
            <label key={d.days} className="altar-choice altar-choice-sm">
              <input type="radio" name="days" value={d.days} defaultChecked={i === 0} />
              <span>{d.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex items-start gap-3 cursor-pointer">
        <input type="checkbox" name="is_public" defaultChecked className="mt-1" />
        <span className="text-[var(--foreground-muted)] leading-relaxed text-sm">
          Add my candle to the community altar, so others can see its flame and
          hold the intention with me. Uncheck to keep it private to your own altar.
        </span>
      </label>

      {lit ? (
        <PendingSubmit
          label="Lighting…"
          pendingLabel="Lighting…"
          className="btn-primary inline-flex"
        />
      ) : (
        <button
          type="button"
          onClick={armAndScroll}
          className="btn-primary inline-flex"
        >
          Light the candle
        </button>
      )}
      </div>
    </form>
  );
}
