import { CANDLE_ART_BASE } from "@/lib/altar/catalog";

/**
 * Burn-down geometry per candle photo, generated from the stage-image
 * pass (7/2026). cx = wax column center, top = fresh wax surface,
 * bot = bottom of the wax, all % of the photo. Candles absent here
 * (label-wrap jars, saints) render the static day-1 photo forever.
 *
 * Stage images live in the candle-art bucket as {slug}-d{2..7}.jpg and
 * {slug}-out.jpg. Day 1 is the original photo.
 */
export const BURN_GEOM: Record<string, { cx: number; top: number; bot: number }> = {
  "adam-eve": { cx: 48.8, top: 5.5, bot: 91.9 },
  "bayberry": { cx: 48.1, top: 12.3, bot: 92 },
  "better-business": { cx: 46.3, top: 12.7, bot: 92 },
  "bingo": { cx: 48.9, top: 11.3, bot: 91.9 },
  "birthday-blessings": { cx: 68, top: 10.8, bot: 93 },
  "black-cat": { cx: 46.7, top: 11.8, bot: 92 },
  "black-list": { cx: 49.9, top: 5.5, bot: 92 },
  "blockbreaker": { cx: 46.4, top: 13, bot: 78.5 },
  "buddha": { cx: 48.2, top: 13, bot: 91.9 },
  "chango-macho": { cx: 47.8, top: 8.6, bot: 92 },
  "chuparrosa": { cx: 47.3, top: 11.6, bot: 92 },
  "come-to-me": { cx: 48.8, top: 11.1, bot: 92 },
  "condition": { cx: 50.2, top: 9, bot: 92 },
  "court-case": { cx: 49.8, top: 6, bot: 91.9 },
  "domination": { cx: 54.2, top: 10.6, bot: 91.9 },
  "don-dinero": { cx: 49.7, top: 3.5, bot: 92 },
  "double-action-evil-eye": { cx: 47.6, top: 11.7, bot: 81.6 },
  "double-action-heart": { cx: 48.4, top: 11.3, bot: 55.6 },
  "double-action-money": { cx: 46.2, top: 9.6, bot: 47.8 },
  "elegua": { cx: 50, top: 12.8, bot: 92 },
  "fast-luck": { cx: 46.8, top: 13, bot: 92 },
  "fast-money": { cx: 65.9, top: 18, bot: 93 },
  "forgive-cleanse": { cx: 58.9, top: 5.4, bot: 93 },
  "fruit-of-life": { cx: 47.9, top: 12.8, bot: 81.1 },
  "go-away-evil": { cx: 40, top: 10.9, bot: 91.6 },
  "gregorio-hernandez": { cx: 43.7, top: 13, bot: 79.9 },
  "guided-spirits": { cx: 65.9, top: 20.6, bot: 93 },
  "healthy-ways": { cx: 65.9, top: 19.5, bot: 93 },
  "high-john": { cx: 46.4, top: 12.1, bot: 92 },
  "indian-house-blessing": { cx: 45.9, top: 12.3, bot: 91.9 },
  "indian-tobacco": { cx: 50.1, top: 3.2, bot: 92 },
  "jinx-removing": { cx: 50, top: 11.4, bot: 91.5 },
  "just-judge": { cx: 49.6, top: 10.6, bot: 92 },
  "law-stay-away": { cx: 47, top: 11.4, bot: 91.5 },
  "lords-prayer": { cx: 49.2, top: 13, bot: 80.3 },
  "lotto": { cx: 48.5, top: 12.4, bot: 91.9 },
  "love-drawing": { cx: 48.4, top: 13.2, bot: 91.9 },
  "love-spice": { cx: 63.9, top: 20, bot: 93 },
  "lucky-7-11": { cx: 46.5, top: 11.9, bot: 92 },
  "money-drawing": { cx: 50.3, top: 5.2, bot: 91.9 },
  "ochosi": { cx: 48.8, top: 12.1, bot: 90.9 },
  "open-road": { cx: 50, top: 3.7, bot: 92 },
  "peace": { cx: 48.6, top: 11.6, bot: 92 },
  "peace-in-the-home": { cx: 50, top: 11.6, bot: 92 },
  "psalm-23": { cx: 48.6, top: 11.6, bot: 92 },
  "remember-honor": { cx: 62.9, top: 7.8, bot: 93 },
  "remove-obstacles": { cx: 63, top: 19.3, bot: 93 },
  "reversible": { cx: 50.9, top: 5, bot: 92 },
  "ruda": { cx: 50.3, top: 3, bot: 92 },
  "run-devil-run": { cx: 47.2, top: 11.2, bot: 55 },
  "saint-alex": { cx: 54.3, top: 11.1, bot: 91.9 },
  "saint-clare": { cx: 48, top: 16.7, bot: 84.3 },
  "saint-lazarus": { cx: 48.6, top: 14.3, bot: 92 },
  "saint-michael": { cx: 48.2, top: 18, bot: 91.9 },
  "san-deshacedor": { cx: 47.4, top: 11.4, bot: 92 },
  "steady-work": { cx: 47.7, top: 11.8, bot: 91.7 },
  "success": { cx: 48.9, top: 11.1, bot: 92 },
  "uncrossing": { cx: 51.5, top: 14.6, bot: 93 },
  "unlock-my-path": { cx: 65.9, top: 5.9, bot: 93 },
  "white-candle": { cx: 50, top: 10, bot: 87.9 },
};

/** Which day of its seven-day burn a candle is in (1..7).
 *
 *  Derived from expires_at with the same ceil-rounding as the "X days
 *  left" label (daysLeft in catalog.ts), so the wax level and the label
 *  can never disagree: "6 days left" is always day-2 wax, on every
 *  candle. Falls back to lit_at when there is no expiry. */
export function burnDay(litAt: string, expiresAt?: string | null): number {
  if (expiresAt) {
    const ms = new Date(expiresAt).getTime() - Date.now();
    const left = Math.ceil(ms / 86_400_000); // mirrors daysLeft()
    return Math.min(7, Math.max(1, 8 - left));
  }
  const days = Math.floor((Date.now() - new Date(litAt).getTime()) / 86_400_000) + 1;
  return Math.min(7, Math.max(1, days));
}

/** Image URL for a candle at a given burn stage; null = use day-1 art. */
export function stagedImageUrl(slug: string, stage: number | "out"): string | null {
  if (!BURN_GEOM[slug]) return null;
  if (stage === "out") return `${CANDLE_ART_BASE}/${slug}-out.jpg?v=2`;
  if (stage < 2) return null;
  return `${CANDLE_ART_BASE}/${slug}-d${stage}.jpg?v=2`;
}

/** Flame anchor for a burning candle at a given day: on the wax line. */
export function burnFlamePos(slug: string, day: number): { x: number; y: number } | null {
  const g = BURN_GEOM[slug];
  if (!g || day < 2) return null;
  const level = g.top + ((g.bot - g.top) * (day - 1)) / 7;
  return { x: g.cx, y: Math.round(level * 10) / 10 };
}
