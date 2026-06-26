"use client";

import { useState } from "react";
import { Candle } from "@/components/candle";
import { lightCandleAction } from "@/app/altar/virtual/actions";
import { PendingSubmit } from "@/components/pending-submit";
import { DURATIONS } from "@/lib/altar/catalog";
import { t, type Locale } from "@/lib/i18n/dictionary";

/**
 * Light a saint / Orisha candle. One candle, themed in the saint's color —
 * no desire picker. The member taps the wick to light it (the flame ignites
 * and burns), then writes a dedication and places it on the altar.
 */

// The candle photos are cut out of their white studio background (see
// scripts/cutout_saints.py), so they show just the candle in its glass on the
// altar's black — no box, no haze.
const CANDLE_W = "min(38vw, 146px)";
export function SaintCandleLighter({
  slug,
  name,
  color,
  intention,
  photo,
  locale,
}: {
  slug: string;
  name: string;
  color: string;
  intention: string;
  photo?: string;
  locale: Locale;
}) {
  const [lit, setLit] = useState(false);
  const glow = lit ? `drop-shadow(0 0 34px ${color}aa)` : "none";

  return (
    <div className="flex flex-col items-center">
      {photo ? (
        <div
          className="relative"
          style={{ filter: glow, transition: "filter 1s ease", width: CANDLE_W }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo}
            alt={name}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              opacity: lit ? 1 : 0.96,
              transition: "opacity .8s ease",
            }}
          />
          {lit && (
            <span
              aria-hidden
              className="absolute left-1/2 -translate-x-1/2"
              style={{ top: -14 }}
            >
              <span className="saint-flame" style={{ width: 20, height: 40 }} />
            </span>
          )}
          {!lit && (
            <button
              type="button"
              onClick={() => setLit(true)}
              aria-label={t(locale, "saint.tapHint")}
              className="absolute left-1/2 -translate-x-1/2 rounded-full"
              style={{ top: 0, width: "62%", height: "22%", cursor: "pointer", background: "transparent" }}
            />
          )}
        </div>
      ) : (
        <div
          className="relative"
          style={{ filter: glow, transition: "filter 1s ease" }}
        >
          <Candle size="large" lit={lit} alt={name} />
          {!lit && (
            <button
              type="button"
              onClick={() => setLit(true)}
              aria-label={t(locale, "saint.tapHint")}
              className="absolute left-1/2 -translate-x-1/2 rounded-full"
              style={{ top: -16, width: 96, height: 110, cursor: "pointer", background: "transparent" }}
            />
          )}
        </div>
      )}

      <p
        className="invocation text-[var(--foreground-muted)] mt-6 text-center max-w-sm leading-relaxed"
        style={{ color: lit ? color : undefined, transition: "color .6s ease" }}
      >
        {lit ? t(locale, "saint.litHint") : t(locale, "saint.tapHint")}
      </p>

      <form
        action={lightCandleAction}
        className="w-full max-w-md mt-10 space-y-8"
        style={{
          opacity: lit ? 1 : 0.4,
          pointerEvents: lit ? "auto" : "none",
          transition: "opacity .6s ease",
        }}
      >
        <input type="hidden" name="candle_type" value="saints" />
        <input type="hidden" name="candle_color" value={slug} />

        <div>
          <label htmlFor="intention" className="form-label">
            {t(locale, "saint.dedication")}
          </label>
          <input
            id="intention"
            name="intention"
            type="text"
            required
            maxLength={200}
            defaultValue={intention}
            className="form-input"
          />
        </div>

        <div>
          <label htmlFor="petition" className="form-label">
            {t(locale, "saint.petition")}{" "}
            <span className="normal-case text-[var(--foreground-subtle)]">
              {t(locale, "saint.optional")}
            </span>
          </label>
          <textarea
            id="petition"
            name="petition"
            rows={4}
            maxLength={2000}
            placeholder={t(locale, "saint.petitionPlaceholder")}
            className="form-input"
          />
        </div>

        <fieldset>
          <legend className="form-label mb-3">{t(locale, "saint.duration")}</legend>
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
            {t(locale, "saint.public")}
          </span>
        </label>

        <PendingSubmit
          label={t(locale, "saint.place")}
          pendingLabel="…"
          className="btn-primary inline-flex"
          disabled={!lit}
        />
      </form>
    </div>
  );
}
