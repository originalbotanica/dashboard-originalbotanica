"use client";

import { useRef, useState, type CSSProperties } from "react";
import { Candle } from "@/components/candle";
import { lightCandleAction } from "@/app/altar/virtual/actions";
import { PendingSubmit } from "@/components/pending-submit";
import { DURATIONS } from "@/lib/altar/catalog";
import { t, type Locale } from "@/lib/i18n/dictionary";

/**
 * Light a saint / Orisha candle. One candle, themed in the saint's color —
 * no desire picker. The member writes the dedication first, presses "Place it
 * on the altar", which sends them up to tap the wick; tapping the wick lights
 * the flame and places the candle. (Matches the ancestor + altar flows.)
 */

// The candle photos are trimmed to the candle on their original white studio
// background (see scripts/cutout_saints.py) and shown in a simple white frame.
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
  const [armed, setArmed] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const candleRef = useRef<HTMLDivElement>(null);
  const glow = lit ? `drop-shadow(0 0 34px ${color}aa)` : "none";

  function armAndScroll() {
    const f = formRef.current;
    if (!f) return;
    if (!f.checkValidity()) {
      f.reportValidity();
      return;
    }
    setArmed(true);
    candleRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function lightAndPlace() {
    setLit(true);
    setTimeout(() => formRef.current?.requestSubmit(), 650);
  }

  const Wick = ({ style }: { style: CSSProperties }) =>
    armed && !lit ? (
      <button
        type="button"
        onClick={lightAndPlace}
        aria-label={t(locale, "saint.tapHint")}
        className="absolute left-1/2 -translate-x-1/2 rounded-full flex items-start justify-center"
        style={{ cursor: "pointer", background: "transparent", ...style }}
      >
        <span
          aria-hidden
          className="block rounded-full animate-ping"
          style={{ marginTop: 8, width: 18, height: 18, background: `${color}aa` }}
        />
      </button>
    ) : null;

  return (
    <div className="flex flex-col items-center">
      <div ref={candleRef} className="scroll-mt-24 flex flex-col items-center">
        {photo ? (
          <div
            className="relative"
            style={{ filter: glow, transition: "filter 1s ease", width: CANDLE_W }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo}
              alt={name}
              className="rounded-xl block"
              style={{
                width: "100%",
                height: "auto",
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
            <Wick style={{ top: 0, width: "62%", height: "22%" }} />
          </div>
        ) : (
          <div
            className="relative"
            style={{ filter: glow, transition: "filter 1s ease" }}
          >
            <Candle size="large" lit={lit} alt={name} />
            <Wick style={{ top: -16, width: 96, height: 110 }} />
          </div>
        )}

        <p
          className={`invocation mt-6 text-center max-w-sm leading-relaxed ${
            armed && !lit
              ? "text-lg md:text-xl font-medium animate-pulse"
              : ""
          }`}
          style={{
            color: lit || (armed && !lit) ? color : "var(--foreground-muted)",
            transition: "color .6s ease",
          }}
        >
          {lit
            ? t(locale, "saint.litHint")
            : armed
              ? "↑ " + t(locale, "saint.tapHint")
              : t(locale, "saint.fillFirst")}
        </p>
      </div>

      <form
        ref={formRef}
        action={lightCandleAction}
        className="w-full max-w-md mt-10 space-y-8"
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

        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" name="is_public" defaultChecked className="mt-1" />
            <span className="text-[var(--foreground-muted)] leading-relaxed text-sm">
              {t(locale, "saint.public")}
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer pl-7">
            <input type="checkbox" name="petition_public" className="mt-1" />
            <span className="text-[var(--foreground-muted)] leading-relaxed text-sm">
              {t(locale, "saint.petitionPublic")}
            </span>
          </label>
        </div>

        {lit ? (
          <PendingSubmit
            label={t(locale, "saint.place")}
            pendingLabel="…"
            className="btn-primary inline-flex"
          />
        ) : (
          <button
            type="button"
            onClick={armAndScroll}
            className="btn-primary inline-flex"
          >
            {t(locale, "saint.place")}
          </button>
        )}
      </form>
    </div>
  );
}
