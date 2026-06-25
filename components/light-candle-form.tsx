"use client";

import { useState } from "react";
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
    <form action={lightCandleAction} className="space-y-10">
      <input type="hidden" name="candle_type" value={desire.slug} />
      <input type="hidden" name="candle_color" value={candle.slug} />

      <div className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={candleImageUrl(candle.slug)}
          alt={candle.name}
          width={72}
          height={72}
          className="rounded-lg object-cover candle-glow"
          style={{ width: 72, height: 72 }}
        />
        <div className="flex-1">
          <p className="display text-lg leading-tight">{candle.name}</p>
          <p className="text-sm text-[var(--foreground-muted)]">{candle.tagline}</p>
        </div>
        <button
          type="button"
          onClick={() => setCandle(null)}
          className="nav-link text-[var(--accent)]"
        >
          Change
        </button>
      </div>

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

      <PendingSubmit
        label="Light the candle"
        pendingLabel="Lighting…"
        className="btn-primary inline-flex"
      />
    </form>
  );
}
