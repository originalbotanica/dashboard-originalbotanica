import { DESIRES, type CandleArt, type Desire } from "@/lib/altar/catalog";

/**
 * The astrologer's candle of the day — the bridge between the daily
 * reading and the altar. The reading names a focus (money, love,
 * protection...); this maps it to the altar's desire shelf and picks one
 * candle for the day, rotating deterministically so the whole day agrees
 * with itself (and repeat visits show the same candle).
 */
const FOCUS_DESIRE: Record<string, string> = {
  love: "love-attraction",
  work: "success-prosperity",
  money: "money-wealth",
  spirit: "spiritual-cleansing",
  body: "health",
  mind: "peace",
  home: "peace",
  protection: "protection",
  release: "reverse-magic",
  roads: "open-road",
  gratitude: "peace",
};

export function dailyCandle(
  focus: string,
  dateISO: string,
): { candle: CandleArt; desire: Desire } | null {
  const desireSlug = FOCUS_DESIRE[focus] ?? "protection";
  const desire = DESIRES.find((d) => d.slug === desireSlug);
  if (!desire || desire.candles.length === 0) return null;
  // Stable per-(day, focus) rotation through the shelf.
  const seed = `${dateISO}:${focus}`;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const candle = desire.candles[Math.abs(h) % desire.candles.length];
  return { candle, desire };
}
