/**
 * Measured flame anchor per catalog candle photo. One rule everywhere:
 * THE FLAME SWALLOWS THE WICK. The anchor is the flame base, seated on
 * the exposed wick so the flame body covers the printed string. No bare
 * wick above any flame, glass candle or pullout pillar alike. x/y are %
 * of the photo dimensions, from the wick-detection pass (7/2026) with
 * hand-tuned outliers.
 */
export const FLAME_POS: Record<string, { x: number; y: number }> = {
  "adam-eve": { x: 50, y: 3.4 }, // hand-tuned from audit
  "bayberry": { x: 47.5, y: 7.1 },
  "better-business": { x: 48.6, y: 7.1 },
  "bingo": { x: 46, y: 6.9 },
  "birthday-blessings": { x: 69, y: 11.5 }, // hand-tuned: pullout, flame covers wick
  "black-cat": { x: 47, y: 6.8 },
  "black-list": { x: 49.5, y: 2.3 },
  "blockbreaker": { x: 48.5, y: 9.1 },
  "buddha": { x: 48.9, y: 7.3 },
  "chango-macho": { x: 44.5, y: 5.6 },
  "chuparrosa": { x: 50, y: 8.5 },
  "come-to-me": { x: 43.2, y: 6.6 },
  "condition": { x: 48.8, y: 5.7 },
  "court-case": { x: 49.5, y: 4.1 },
  "domination": { x: 43.5, y: 6.6 },
  "don-dinero": { x: 50, y: 3 }, // hand-tuned from audit
  "double-action-evil-eye": { x: 50, y: 8.6 },
  "double-action-heart": { x: 50.8, y: 6.7 },
  "double-action-money": { x: 45.1, y: 6 },
  "elegua": { x: 50, y: 9.6 },
  "fast-luck": { x: 47, y: 7.3 },
  "fast-money": { x: 67, y: 15 }, // hand-tuned: pullout, flame covers wick
  "forgive-cleanse": { x: 66, y: 5 }, // hand-tuned: pullout, flame covers wick
  "fruit-of-life": { x: 50, y: 9.6 },
  "go-away-evil": { x: 46, y: 6.6 },
  "gregorio-hernandez": { x: 45.5, y: 7.7 },
  "guided-spirits": { x: 63, y: 17 }, // hand-tuned: pullout, flame covers wick
  "healthy-ways": { x: 63.5, y: 17 }, // hand-tuned: pullout, flame covers wick
  "high-john": { x: 48.6, y: 7 },
  "indian-house-blessing": { x: 48.4, y: 7 },
  "indian-tobacco": { x: 49.6, y: 0 },
  "jinx-removing": { x: 45.7, y: 6.7 },
  "just-judge": { x: 46.6, y: 6.8 },
  "law-stay-away": { x: 48.6, y: 9.6 },
  "lords-prayer": { x: 50.3, y: 7.7 },
  "lotto": { x: 51.8, y: 7.3 },
  "love-drawing": { x: 50, y: 10 },
  "love-spice": { x: 64, y: 16.5 }, // hand-tuned: pullout, flame covers wick
  "lucky-7-11": { x: 44.9, y: 7.7 },
  "money-drawing": { x: 49.4, y: 2 },
  "ochosi": { x: 46.3, y: 6.9 },
  "open-road": { x: 49.2, y: 0.5 },
  "peace": { x: 55.8, y: 6.8 },
  "peace-in-the-home": { x: 50, y: 8.5 },
  "psalm-23": { x: 48.2, y: 6.8 },
  "remember-honor": { x: 68, y: 6 }, // hand-tuned: pullout, flame covers wick
  "remove-obstacles": { x: 65, y: 15.5 }, // hand-tuned: pullout, flame covers wick
  "reversible": { x: 52, y: 4.2 },
  "ruda": { x: 63.6, y: 3 }, // hand-tuned: pullout, flame covers wick
  "run-devil-run": { x: 47, y: 6.6 },
  "saint-alex": { x: 45.2, y: 6.8 },
  "saint-clare": { x: 50, y: 13.5 },
  "saint-lazarus": { x: 48.7, y: 8.2 },
  "saint-michael": { x: 49.5, y: 14.8 },
  "san-deshacedor": { x: 48.9, y: 6.6 },
  "steady-work": { x: 50, y: 8.7 },
  "success": { x: 47.2, y: 6.8 },
  "uncrossing": { x: 50, y: 10.5 }, // hand-tuned from audit
  "unlock-my-path": { x: 69, y: 12 }, // hand-tuned: pullout, flame covers wick
  "white-candle": { x: 48.7, y: 3.8 },
};
