import { candleImageUrl, getCandleArt } from "@/lib/altar/catalog";

/**
 * A prepared prayer candle for the virtual altar, shown as its product photo
 * (copied from the live altar into our candle-art storage). Mirrors the live
 * altar.originalbotanica.com candles instead of a generic CSS glass.
 *
 * `candleSlug` is the stored candle id (in the candle_color column). Unknown
 * slugs fall back to a plain white candle so legacy rows still render.
 */
export function AltarCandle({
  candleSlug,
  size = "wall",
}: {
  candleSlug: string | null;
  size?: "wall" | "hero";
}) {
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
