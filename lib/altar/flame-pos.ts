/**
 * Measured flame anchor per catalog candle photo. The anchor is where the
 * flame's BASE sits: at the top surface of the wax (the fill line of a
 * glass candle, or the top of a bare pillar), horizontally centered on the
 * wax body's extent. Never on an empty glass. x/y are % of the photo's
 * width/height.
 *
 * Pullout pillars (posed beside their glass) show a long printed wick
 * string; per Jason those anchor ON the wick where it leaves the wax, so
 * the flame body covers the string instead of leaving it dangling above.
 */
export const FLAME_POS: Record<string, { x: number; y: number }> = {
  "adam-eve": { x: 50.0, y: 5.5 },
  "bayberry": { x: 50.0, y: 12.4 },
  "better-business": { x: 50.0, y: 12.7 },
  "bingo": { x: 50.0, y: 11.4 },
  "birthday-blessings": { x: 69, y: 11.5 }, // hand-tuned: pullout, flame covers wick
  "black-cat": { x: 50.0, y: 11.9 },
  "black-list": { x: 49.5, y: 5.5 },
  "blockbreaker": { x: 50.0, y: 13.0 },
  "buddha": { x: 50.0, y: 13.0 },
  "chango-macho": { x: 50.0, y: 8.7 },
  "chuparrosa": { x: 50.0, y: 11.7 },
  "come-to-me": { x: 50.0, y: 11.2 },
  "condition": { x: 50, y: 9 }, // hand-tuned: measurer caught the photo edge
  "court-case": { x: 49.5, y: 6.0 },
  "domination": { x: 50.0, y: 10.7 },
  "don-dinero": { x: 50.0, y: 3.5 },
  "double-action-evil-eye": { x: 50.0, y: 11.8 },
  "double-action-heart": { x: 50.0, y: 11.4 },
  "double-action-money": { x: 50.0, y: 9.7 },
  "elegua": { x: 50.0, y: 12.8 },
  "fast-luck": { x: 50.0, y: 13.0 },
  "fast-money": { x: 67, y: 15 }, // hand-tuned: pullout, flame covers wick
  "forgive-cleanse": { x: 66, y: 5 }, // hand-tuned: pullout, flame covers wick
  "fruit-of-life": { x: 50.0, y: 12.8 },
  "go-away-evil": { x: 50.0, y: 10.9 },
  "gregorio-hernandez": { x: 50.0, y: 13.0 },
  "guided-spirits": { x: 63, y: 17 }, // hand-tuned: pullout, flame covers wick
  "healthy-ways": { x: 63.5, y: 17 }, // hand-tuned: pullout, flame covers wick
  "high-john": { x: 50.0, y: 12.2 },
  "indian-house-blessing": { x: 50.0, y: 12.4 },
  "indian-tobacco": { x: 49.6, y: 3.2 },
  "jinx-removing": { x: 50.0, y: 11.5 },
  "just-judge": { x: 50.0, y: 10.7 },
  "law-stay-away": { x: 50.0, y: 11.4 },
  "lords-prayer": { x: 50.0, y: 13.0 },
  "lotto": { x: 50.0, y: 12.4 },
  "love-drawing": { x: 50.0, y: 13.2 },
  "love-spice": { x: 64, y: 16.5 }, // hand-tuned: pullout, flame covers wick
  "lucky-7-11": { x: 50.0, y: 11.9 },
  "money-drawing": { x: 49.4, y: 5.2 },
  "ochosi": { x: 50.0, y: 12.2 },
  "open-road": { x: 49.2, y: 3.7 },
  "peace": { x: 50.0, y: 11.7 },
  "peace-in-the-home": { x: 50.0, y: 11.7 },
  "psalm-23": { x: 50.0, y: 11.7 },
  "remember-honor": { x: 68, y: 6 }, // hand-tuned: pullout, flame covers wick
  "remove-obstacles": { x: 65, y: 15.5 }, // hand-tuned: pullout, flame covers wick
  "reversible": { x: 50.0, y: 5.0 },
  "ruda": { x: 63.6, y: 3.0 },
  "run-devil-run": { x: 50.0, y: 11.2 },
  "saint-alex": { x: 50.0, y: 11.2 },
  "saint-clare": { x: 50.0, y: 16.7 },
  "saint-lazarus": { x: 50.0, y: 14.4 },
  "saint-michael": { x: 49.5, y: 18 }, // hand-measured: red 7-day photo (swapped from green)
  "san-deshacedor": { x: 50.0, y: 11.4 },
  "steady-work": { x: 50.0, y: 11.9 },
  "success": { x: 50.0, y: 11.2 },
  "uncrossing": { x: 50, y: 11 }, // hand-tuned: white seven-knob pillar
  "unlock-my-path": { x: 69, y: 12 }, // hand-tuned: pullout, flame covers wick
  "white-candle": { x: 50, y: 10 }, // hand-tuned: photo is white-on-white
};
