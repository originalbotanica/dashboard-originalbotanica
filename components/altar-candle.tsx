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
  const px = size === "hero" ? 208 : 132;

  return (
    <span className="inline-block" aria-hidden={art ? undefined : true}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={candleImageUrl(slug)}
        alt={name}
        width={px}
        height={px}
        loading="lazy"
        className="rounded-xl object-cover candle-glow"
        style={{ width: px, height: px }}
      />
    </span>
  );
}
