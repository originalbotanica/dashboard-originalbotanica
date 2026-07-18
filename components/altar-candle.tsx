import type { CSSProperties } from "react";
import { candleImageUrl, getCandleArt, getSaintCandle } from "@/lib/altar/catalog";
import { FLAME_POS } from "@/lib/altar/flame-pos";
import { burnDay, stagedImageUrl, burnFlamePos } from "@/lib/altar/burn-geom";
import { Candle } from "@/components/candle";

/**
 * A prepared prayer candle for the virtual altar.
 *
 * Prepared (catalog) candles and saint/Orisha candles are all tall, white-
 * background photo cutouts. We render every candle at the SAME fixed height
 * (width auto), so they stand uniformly side by side like real candles on a
 * shelf, regardless of how each source photo was framed. A burning flame sits
 * at the wick. Saints without a photo fall back to the themed glass candle.
 *
 * NOTE: the images are NOT lazy-loaded. With height set and width:auto, the
 * box is 0px wide until the image loads, so a lazy loader never sees it
 * intersect the viewport and never fetches it. Eager loading avoids that.
 *
 * `candleSlug` is the stored candle id (the candle_color column). Unknown
 * slugs fall back to a plain white candle so legacy rows still render.
 */

// Shared candle height (px); width follows each photo's aspect.
const H = { wall: 300, hero: 460 } as const;
// Flame width + distance of the flame base from the top of the image. The
// wick sits ~12% down from the top of every (consistently padded) cutout.
const FW = { wall: 14, hero: 21 } as const;
const FTOP = { wall: 36, hero: 55 } as const;

function Flame({
  size,
  slug,
  bright = false,
  posOverride,
}: {
  size: "wall" | "hero";
  slug?: string;
  bright?: boolean;
  /** Explicit anchor (burn-down stages seat the flame at the wax line). */
  posOverride?: { x: number; y: number } | null;
}) {
  // Measured wick position for this candle's photo (x% across, y% down);
  // photos without a measurement use the centered defaults.
  const pos = posOverride ?? (slug ? FLAME_POS[slug] : undefined);
  return (
    <span
      aria-hidden
      className={`altar-flame${bright ? " altar-flame-bright" : ""}`}
      style={
        {
          "--fw": `${FW[size]}px`,
          top: pos ? `${pos.y}%` : FTOP[size],
          ...(pos ? { "--fx": `${pos.x}%` } : {}),
        } as CSSProperties
      }
    >
      <span className="af-halo" />
      <span className="af-cast" />
      <span className="af-outer" />
      <span className="af-inner" />
    </span>
  );
}

export function AltarCandle({
  candleSlug,
  size = "wall",
  bright = false,
  litAt = null,
  expiresAt = null,
  burnedOut = false,
}: {
  candleSlug: string | null;
  size?: "wall" | "hero";
  /** A tended candle's flame is held: slightly larger halo, warmer light. */
  bright?: boolean;
  /** When set, the candle renders at its burn stage: the wax level drops
   *  each day and the flame rides it down. Absent = fresh day-1 art. */
  litAt?: string | null;
  /** Expiry timestamp: keeps the wax level in lockstep with the
   *  "X days left" label (same rounding). */
  expiresAt?: string | null;
  /** Expired candles show the emptied glass, flame out. */
  burnedOut?: boolean;
}) {
  const h = H[size];
  const saint = getSaintCandle(candleSlug);

  if (saint) {
    if (saint.photo) {
      return (
        <span
          className="relative inline-block"
          aria-label={saint.name}
          style={{ filter: `drop-shadow(0 0 18px ${saint.saintColor}99)` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={saint.photo}
            alt={saint.name}
            className="rounded-xl block"
            style={{ height: h, width: "auto" }}
          />
          <Flame size={size} bright={bright} />
        </span>
      );
    }
    // No photo — themed glass candle in the saint's color.
    return (
      <span
        className="inline-flex items-center justify-center"
        aria-label={saint.name}
        style={{ filter: `drop-shadow(0 0 22px ${saint.saintColor}aa)` }}
      >
        <Candle lit size={size === "hero" ? "large" : "default"} alt={saint.name} />
      </span>
    );
  }

  const art = getCandleArt(candleSlug);
  const slug = art ? candleSlug! : "white-candle";
  const name = art ? art.name : "Prayer candle";

  // Burn-down: pick the stage image + wax-line flame anchor for this
  // candle's age. Candles without stage art (label jars) stay day-1.
  let src = candleImageUrl(slug);
  let flamePos: { x: number; y: number } | null = null;
  let showFlame = true;
  if (burnedOut) {
    const outSrc = stagedImageUrl(slug, "out");
    if (outSrc) {
      src = outSrc;
      showFlame = false;
    }
  } else if (litAt) {
    const day = burnDay(litAt, expiresAt);
    const staged = stagedImageUrl(slug, day);
    if (staged) {
      src = staged;
      flamePos = burnFlamePos(slug, day);
    }
  }

  return (
    <span
      className="relative inline-block"
      aria-label={name}
      style={{
        filter: showFlame
          ? "drop-shadow(0 0 16px rgba(240, 176, 110, 0.45))"
          : "none",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={name}
        className="rounded-xl block"
        style={{ height: h, width: "auto", opacity: showFlame ? 1 : 0.8 }}
      />
      {showFlame && (
        <Flame size={size} slug={slug} bright={bright} posOverride={flamePos} />
      )}
    </span>
  );
}
