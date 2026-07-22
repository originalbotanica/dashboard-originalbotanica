import { Candle } from "./candle";
import type { OfferingType } from "@/app/ancestors/actions";

/**
 * The memorial candle with its offerings arranged beside it.
 *
 * Whatever has been set on the altar in the last seven days sits at the
 * candle's base: flowers and fresh water to the left, black coffee and
 * the stack of ancestor money to the right. The ancestor money is the
 * real product photographed at the botanica; the rest are painted to
 * sit in the same candlelight.
 *
 * With no active offerings this renders exactly the lone candle.
 */

const OFFERING_IMG: Record<
  OfferingType,
  { src: string; className: string; side: "left" | "right" }
> = {
  flowers: { src: "/offerings/flowers.webp", className: "h-24 md:h-28 w-auto", side: "left" },
  water: { src: "/offerings/water.webp", className: "h-16 md:h-20 w-auto", side: "left" },
  coffee: { src: "/offerings/coffee.webp", className: "h-12 md:h-14 w-auto", side: "right" },
  ancestor_money: { src: "/offerings/money.webp", className: "h-10 md:h-12 w-auto", side: "right" },
};

const ORDER: OfferingType[] = ["flowers", "water", "coffee", "ancestor_money"];

export function CandleWithOfferings({
  lit,
  photoUrl,
  alt,
  offerings,
}: {
  lit: boolean;
  photoUrl?: string | null;
  alt: string;
  offerings: OfferingType[];
}) {
  const active = ORDER.filter((t) => offerings.includes(t));
  const left = active.filter((t) => OFFERING_IMG[t].side === "left");
  const right = active.filter((t) => OFFERING_IMG[t].side === "right");

  return (
    // The id lets the offering ritual fly the chosen item down to land
    // beside this candle (see make-offering.tsx).
    <div id="altar-scene" className="flex items-end justify-center gap-3 md:gap-5">
      {left.length > 0 && (
        <div className="flex items-end gap-2 md:gap-3 pb-1">
          {left.map((t) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={t} src={OFFERING_IMG[t].src} alt="" aria-hidden className={OFFERING_IMG[t].className} />
          ))}
        </div>
      )}
      <Candle size="large" lit={lit} photoUrl={photoUrl} alt={alt} />
      {right.length > 0 && (
        <div className="flex items-end gap-2 md:gap-3 pb-1">
          {right.map((t) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={t} src={OFFERING_IMG[t].src} alt="" aria-hidden className={OFFERING_IMG[t].className} />
          ))}
        </div>
      )}
    </div>
  );
}
