import type { CSSProperties } from "react";
import { candleImageUrl, getCandleArt, getSaintCandle } from "@/lib/altar/catalog";
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
 * `candleSlug` is the stored candle id (the candle_color column). Unknown
 * slugs fall back to a plain white candle so legacy rows still render.
 */

// Shared candle height (px); width follows each photo's aspect.
const H = { wall: 300, hero: 460 } as const;
// Flame width + distance of the flame base from the top of the image. The
// wick sits ~12% down from the top of every (consistently padded) cutout.
const FW = { wall: 14, hero: 21 } as const;
const FTOP = { wall: 36, hero: 55 } as const;

function Flame({ size }: { size: "wall" | "hero" }) {
  return (
    <span
      aria-hidden
      className="altar-flame"
      style={{ "--fw": `${FW[size]}px`, top: FTOP[size] } as CSSProperties}
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
}: {
  candleSlug: string | null;
  size?: "wall" | "hero";
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
            loading="lazy"
            className="rounded-xl block"
            style={{ height: h, width: "auto" }}
          />
          <Flame size={size} />
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

  return (
    <span
      className="relative inline-block"
      aria-label={name}
      style={{ filter: "drop-shadow(0 0 16px rgba(240, 176, 110, 0.45))" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={candleImageUrl(slug)}
        alt={name}
        loading="lazy"
        className="rounded-xl block"
        style={{ height: h, width: "auto" }}
      />
      <Flame size={size} />
    </span>
  );
}
