import type { CSSProperties } from "react";
import { candleImageUrl, getCandleArt, getSaintCandle } from "@/lib/altar/catalog";
import { Candle } from "@/components/candle";

/**
 * A prepared prayer candle for the virtual altar.
 *
 * Prepared (catalog) candles show as their product photo. Saint / Orisha
 * candles have no product photo — they render as a themed glass candle with
 * an animated flame and a halo in the saint's color.
 *
 * `candleSlug` is the stored candle id (the candle_color column). Unknown
 * slugs fall back to a plain white candle so legacy rows still render.
 */
export function AltarCandle({
  candleSlug,
  size = "wall",
}: {
  candleSlug: string | null;
  size?: "wall" | "hero";
}) {
  const saint = getSaintCandle(candleSlug);
  if (saint) {
    const px = size === "hero" ? 208 : 132;
    // Real product photo when we have one; otherwise the themed glass candle.
    if (saint.photo) {
      // Saint photos carry more white margin around the candle than the
      // prepared-candle cutouts, so render them wider to match the prepared
      // candles' visible size on the altar (Jason's preference: the larger).
      const w = size === "hero" ? 213 : 132;
      const fw = size === "hero" ? 25 : 16;
      const ftop = size === "hero" ? 61 : 38;
      return (
        <span
          className="relative inline-block"
          aria-label={saint.name}
          style={{ filter: `drop-shadow(0 0 18px ${saint.saintColor}99)`, width: w }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={saint.photo}
            alt={saint.name}
            loading="lazy"
            className="rounded-xl block"
            style={{ width: w, height: "auto" }}
          />
          <span
            aria-hidden
            className="altar-flame"
            style={{ "--fw": `${fw}px`, top: ftop } as CSSProperties}
          >
            <span className="af-halo" />
            <span className="af-cast" />
            <span className="af-outer" />
            <span className="af-inner" />
          </span>
        </span>
      );
    }
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
  // Prepared candles are now tall white-background cutouts like the saints,
  // so render them with the same width and flame position for a uniform altar.
  const w = size === "hero" ? 168 : 104;
  const fw = size === "hero" ? 20 : 13;
  const ftop = size === "hero" ? 48 : 30;

  return (
    <span
      className="relative inline-block"
      aria-label={name}
      style={{ filter: "drop-shadow(0 0 16px rgba(240, 176, 110, 0.45))", width: w }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={candleImageUrl(slug)}
        alt={name}
        loading="lazy"
        className="rounded-xl block"
        style={{ width: w, height: "auto" }}
      />
      <span
        aria-hidden
        className="altar-flame"
        style={{ "--fw": `${fw}px`, top: ftop } as CSSProperties}
      >
        <span className="af-halo" />
        <span className="af-cast" />
        <span className="af-outer" />
        <span className="af-inner" />
      </span>
    </span>
  );
}
