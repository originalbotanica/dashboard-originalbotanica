import { Candle } from "./candle";
import type { OfferingType } from "@/app/ancestors/actions";

/**
 * The memorial candle with its offerings arranged beside it.
 *
 * Whatever has been set on the altar in the last seven days sits at the
 * candle's base: flowers and fresh water to the left, black coffee and
 * the stack of ancestor money to the right. The ancestor money is the
 * real product photographed at the botanica.
 *
 * `size="large"` is the memorial hero (and the landing target for the
 * offering ritual's fly-down — hence the #altar-scene id, only rendered
 * there so the id stays unique). `size="default"` is the small version
 * used on the ancestors altar hub cards.
 *
 * With no active offerings this renders exactly the lone candle.
 */

const IMG: Record<OfferingType, { src: string; side: "left" | "right" }> = {
  flowers: { src: "/offerings/flowers.webp", side: "left" },
  water: { src: "/offerings/water.webp", side: "left" },
  coffee: { src: "/offerings/coffee.webp", side: "right" },
  ancestor_money: { src: "/offerings/money.webp", side: "right" },
};

const SIZE_CLS: Record<"default" | "large", Record<OfferingType, string>> = {
  large: {
    flowers: "h-24 md:h-28 w-auto",
    water: "h-16 md:h-20 w-auto",
    coffee: "h-12 md:h-14 w-auto",
    ancestor_money: "h-10 md:h-12 w-auto",
  },
  default: {
    flowers: "h-12 w-auto",
    water: "h-9 w-auto",
    coffee: "h-7 w-auto",
    ancestor_money: "h-6 w-auto",
  },
};

const ORDER: OfferingType[] = ["flowers", "water", "coffee", "ancestor_money"];

export function CandleWithOfferings({
  lit,
  photoUrl,
  alt,
  offerings,
  size = "large",
}: {
  lit: boolean;
  photoUrl?: string | null;
  alt: string;
  offerings: OfferingType[];
  size?: "default" | "large";
}) {
  const active = ORDER.filter((t) => offerings.includes(t));
  const left = active.filter((t) => IMG[t].side === "left");
  const right = active.filter((t) => IMG[t].side === "right");
  const gap = size === "large" ? "gap-3 md:gap-5" : "gap-1.5";
  const itemGap = size === "large" ? "gap-2 md:gap-3" : "gap-1";

  return (
    <div
      id={size === "large" ? "altar-scene" : undefined}
      className={`flex items-end justify-center ${gap}`}
    >
      {left.length > 0 && (
        <div className={`flex items-end ${itemGap} pb-1`}>
          {left.map((t) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={t} src={IMG[t].src} alt="" aria-hidden className={SIZE_CLS[size][t]} />
          ))}
        </div>
      )}
      <Candle size={size} lit={lit} photoUrl={photoUrl} alt={alt} />
      {right.length > 0 && (
        <div className={`flex items-end ${itemGap} pb-1`}>
          {right.map((t) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={t} src={IMG[t].src} alt="" aria-hidden className={SIZE_CLS[size][t]} />
          ))}
        </div>
      )}
    </div>
  );
}
