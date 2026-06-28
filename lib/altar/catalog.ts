/**
 * Virtual altar catalog — pure, client-safe data.
 *
 * Mirrors the live altar.originalbotanica.com flow: choose a desire, then a
 * specific prepared candle for that desire. The 12 desires and their candles
 * match the live site one-for-one. Candle photos were copied from the live
 * altar into our own Supabase Storage (bucket: candle-art) so they never
 * depend on that site staying up.
 *
 * No server imports here, so this module is safe to use from client
 * components (the light-a-candle picker).
 */

const CANDLE_ART_BASE =
  "https://beeayiskwueqnugithaw.supabase.co/storage/v1/object/public/candle-art";

export function candleImageUrl(slug: string): string {
  // ?v bump busts the CDN/browser cache when the candle art is replaced
  // (the prepared candles were re-cut to tall white-background photos to
  // match the saint candles — bump this if they're regenerated again).
  return `${CANDLE_ART_BASE}/${slug}.jpg?v=2`;
}

export type CandleArt = {
  slug: string; // also the stored candle id and the image filename
  name: string;
  tagline: string;
  /** Saint/Orisha candles render as a themed glass candle (this color +
   *  animated flame) instead of a product photo. Set only for saint candles. */
  saintColor?: string;
  /** Default dedication suggested when lighting this saint candle. */
  saintIntention?: string;
  /** Real 7-day product photo (originalbotanica.com). When present, the saint
   *  candle shows this photo; otherwise it falls back to the themed glass. */
  photo?: string;
};


export type Desire = {
  slug: string;
  label: string;
  purpose: string; // maps to a ritual-library purpose for recommendations
  candles: CandleArt[];
};

export const DESIRES: Desire[] = [
  {
    slug: "money-wealth",
    label: "Money & Wealth",
    purpose: "money-drawing",
    candles: [
      { slug: "money-drawing", name: "Money Drawing Candle", tagline: "To draw money to you" },
      { slug: "better-business", name: "Better Business Candle", tagline: "To bring money to your business" },
      { slug: "ruda", name: "Ruda Candle", tagline: "For money owed" },
      { slug: "don-dinero", name: "Mr. Money (Don Dinero) Candle", tagline: "For freedom from money problems" },
      { slug: "fast-money", name: "Fast Money Candle", tagline: "For fast money" },
    ],
  },
  {
    slug: "love-attraction",
    label: "Love & Attraction",
    purpose: "love-drawing",
    candles: [
      { slug: "chuparrosa", name: "Chuparrosa Candle", tagline: "To attract your soulmate" },
      { slug: "love-spice", name: "Love Spice Candle", tagline: "To spice up your sex life" },
      { slug: "love-drawing", name: "Love Drawing (Amor) Candle", tagline: "To draw love to you" },
      { slug: "adam-eve", name: "Adam & Eve Candle", tagline: "To bring back a lost love" },
      { slug: "come-to-me", name: "Come to Me (Ven a Mi) Candle", tagline: "To attract a lover" },
    ],
  },
  {
    slug: "protection",
    label: "Protection",
    purpose: "protection",
    candles: [
      { slug: "indian-tobacco", name: "Indian Tobacco Candle", tagline: "Protection from evil" },
      { slug: "san-deshacedor", name: "San Deshacedor Candle", tagline: "Protection from enemies" },
      { slug: "saint-michael", name: "Saint Michael Candle", tagline: "To be protected by St. Michael" },
      { slug: "jinx-removing", name: "Jinx Removing Candle", tagline: "Protection from hexes, jinxes, and curses" },
      { slug: "guided-spirits", name: "Guided Spirits Protection Candle", tagline: "To be protected by your spirit guides" },
    ],
  },
  {
    slug: "open-road",
    label: "Open Road",
    purpose: "road-opening",
    candles: [
      { slug: "open-road", name: "Open Road Candle", tagline: "To open your road" },
      { slug: "elegua", name: "Elegua Candle", tagline: "To protect your path" },
      { slug: "saint-clare", name: "Saint Clare Candle", tagline: "To unlock your future" },
      { slug: "blockbreaker", name: "Blockbreaker Candle", tagline: "To remove a block" },
      { slug: "unlock-my-path", name: "Unlock My Path Candle", tagline: "To clear all obstacles" },
    ],
  },
  {
    slug: "luck-gambling",
    label: "Luck & Gambling",
    purpose: "gambling-luck",
    candles: [
      { slug: "fast-luck", name: "Fast Luck Candle", tagline: "For luck in gambling" },
      { slug: "lotto", name: "Lotto Candle", tagline: "To win the lottery" },
      { slug: "black-cat", name: "Black Cat Candle", tagline: "To break bad luck" },
      { slug: "lucky-7-11", name: "Lucky 7/11 Candle", tagline: "For winning ways" },
      { slug: "bingo", name: "Bingo Candle", tagline: "To win in bingo" },
    ],
  },
  {
    slug: "spiritual-cleansing",
    label: "Spiritual Cleansing",
    purpose: "cleansing",
    candles: [
      { slug: "psalm-23", name: "23rd Psalm Candle", tagline: "For spiritual cleansing and healing" },
      { slug: "indian-house-blessing", name: "Indian House Blessing Candle", tagline: "For house blessing and cleansing" },
      { slug: "run-devil-run", name: "Run Devil Run Candle", tagline: "For removing evil spirits and demons" },
      { slug: "forgive-cleanse", name: "Forgive, Burn & Cleanse Candle", tagline: "For realigning your chakras" },
      { slug: "lords-prayer", name: "Lord's Prayer Candle", tagline: "To petition the Lord to answer your prayers" },
    ],
  },
  {
    slug: "health",
    label: "Health",
    purpose: "healing",
    candles: [
      { slug: "saint-lazarus", name: "Saint Lazarus Candle", tagline: "For healing" },
      { slug: "gregorio-hernandez", name: "Dr. Gregorio Hernandez Candle", tagline: "For family health concerns" },
      { slug: "fruit-of-life", name: "Fruit of Life Candle", tagline: "For fertility and pregnancy" },
      { slug: "healthy-ways", name: "Healthy Ways Candle", tagline: "For good health" },
      { slug: "remove-obstacles", name: "Remove Obstacles Candle", tagline: "For weight loss" },
    ],
  },
  {
    slug: "go-away-evil",
    label: "Go Away Evil",
    purpose: "banishing",
    candles: [
      { slug: "go-away-evil", name: "Go Away Evil Candle", tagline: "To remove and banish evil" },
      { slug: "black-list", name: "Black List Candle", tagline: "To protect from enemies" },
      { slug: "saint-alex", name: "Saint Alex Candle", tagline: "To chase away evil spirits" },
      { slug: "uncrossing", name: "Uncrossing Candle", tagline: "To uncross evil" },
      { slug: "domination", name: "Domination Candle", tagline: "To dominate enemies" },
    ],
  },
  {
    slug: "success-prosperity",
    label: "Success & Prosperity",
    purpose: "manifestation",
    candles: [
      { slug: "success", name: "Success Candle", tagline: "For career and job success" },
      { slug: "bayberry", name: "Bayberry Candle", tagline: "For success in school" },
      { slug: "steady-work", name: "Steady Work Candle", tagline: "To find a job" },
      { slug: "buddha", name: "Buddha Candle", tagline: "For financial abundance" },
      { slug: "chango-macho", name: "Chango Macho Candle", tagline: "For luck and prosperity" },
    ],
  },
  {
    slug: "win-in-court",
    label: "Win in Court",
    purpose: "court-case",
    candles: [
      { slug: "court-case", name: "Court Case Candle", tagline: "To win your court case" },
      { slug: "law-stay-away", name: "Law Stay Away Candle", tagline: "To keep the law away" },
      { slug: "high-john", name: "High John the Conqueror Candle", tagline: "For the justice you deserve" },
      { slug: "ochosi", name: "Ochosi Orisha Candle", tagline: "For immigration problems" },
      { slug: "just-judge", name: "Just Judge Candle", tagline: "For favor from the judge" },
    ],
  },
  {
    slug: "reverse-magic",
    label: "Reverse Magic",
    purpose: "uncrossing",
    candles: [
      { slug: "reversible", name: "Reversible Multicolor Candle", tagline: "To reverse a hex, jinx, or curse" },
      { slug: "double-action-evil-eye", name: "Double Action Evil Eye Candle", tagline: "To reverse evil" },
      { slug: "double-action-money", name: "Double Action Money Candle", tagline: "To reverse money problems" },
      { slug: "double-action-heart", name: "Double Action Heart Candle", tagline: "To reverse love problems" },
      { slug: "condition", name: "Condition Candle", tagline: "To reverse a crossed condition" },
    ],
  },
  {
    slug: "peace",
    label: "Peace",
    purpose: "blessing-peace",
    candles: [
      { slug: "peace-in-the-home", name: "Peace In The Home Candle", tagline: "For peace in the home" },
      { slug: "peace", name: "Peace Candle", tagline: "For a peaceful relationship" },
      { slug: "remember-honor", name: "Remember, Burn & Honor Tribute Candle", tagline: "To remember and honor a loved one" },
      { slug: "white-candle", name: "White Candle", tagline: "For a tranquil life" },
      { slug: "birthday-blessings", name: "Birthday Blessings Candle", tagline: "For birthday health and happiness" },
    ],
  },
  {
    slug: "saints",
    label: "Saints & Orishas",
    purpose: "protection",
    candles: [
      { slug: "reyes", name: "Three Kings", tagline: "Blessings for the year ahead", saintColor: "#e8ac7c", saintIntention: "Blessings for the year ahead" },
      { slug: "candelaria", name: "La Candelaria · Oyá", tagline: "Courage through change", saintColor: "#b98cf0", saintIntention: "Honoring Oyá — courage through change", photo: "/saints/candelaria.png" },
      { slug: "san-antonio", name: "San Antonio · Eleguá", tagline: "Open the roads", saintColor: "#f0552f", saintIntention: "Honoring Eleguá — open my roads", photo: "/saints/san-antonio.png" },
      { slug: "san-juan", name: "San Juan Bautista", tagline: "Cleansing and renewal", saintColor: "#7bb6f2", saintIntention: "Cleansing and renewal on San Juan", photo: "/saints/san-juan.png" },
      { slug: "santiago", name: "Santiago · Oggún", tagline: "Strength for the work", saintColor: "#5aa06a", saintIntention: "Honoring Oggún — strength for the work", photo: "/saints/santiago.png" },
      { slug: "regla", name: "La Virgen de Regla · Yemayá", tagline: "Protection and healing", saintColor: "#3f7bd8", saintIntention: "Honoring Yemayá — protection and healing", photo: "/saints/regla.png" },
      { slug: "caridad", name: "La Caridad · Ochún", tagline: "Love and abundance", saintColor: "#e8c34a", saintIntention: "Honoring Ochún — love and abundance", photo: "/saints/caridad.png" },
      { slug: "mercedes", name: "Las Mercedes · Obatalá", tagline: "Peace and clarity", saintColor: "#efe7d6", saintIntention: "Honoring Obatalá — peace and clarity", photo: "/saints/mercedes.png" },
      { slug: "san-miguel", name: "San Miguel Arcángel", tagline: "Protection over you and your home", saintColor: "#7bb6f2", saintIntention: "San Miguel — protect me and mine", photo: "/saints/san-miguel.png" },
      { slug: "san-francisco", name: "San Francisco · Orula", tagline: "Wisdom and guidance", saintColor: "#cda94f", saintIntention: "Honoring Orula — wisdom and guidance", photo: "/saints/san-francisco.png" },
      { slug: "barbara", name: "Santa Bárbara · Changó", tagline: "Courage and victory", saintColor: "#f0552f", saintIntention: "Honoring Changó — courage and victory", photo: "/saints/barbara.png" },
      { slug: "lazaro", name: "San Lázaro · Babalú-Ayé", tagline: "Health and healing", saintColor: "#9b7bd0", saintIntention: "Honoring Babalú-Ayé — health and healing", photo: "/saints/lazaro.png" },
      { slug: "altagracia", name: "Virgen de Altagracia", tagline: "Protection and blessings", saintColor: "#5b8fd8", saintIntention: "Virgen de Altagracia — protection and blessings", photo: "/saints/altagracia.png" },
      { slug: "fatima", name: "Nuestra Señora de Fátima", tagline: "Peace and protection", saintColor: "#bcd4f0", saintIntention: "Our Lady of Fátima — peace and protection", photo: "/saints/fatima.png" },
      { slug: "sacred-heart", name: "Sacred Heart of Jesus", tagline: "Love, mercy, and healing", saintColor: "#f0552f", saintIntention: "Sacred Heart of Jesus — love, mercy, and healing", photo: "/saints/sacred-heart.png" },
      { slug: "perpetua", name: "Our Lady of Perpetual Help", tagline: "Help in urgent need", saintColor: "#6f8fd0", saintIntention: "Our Lady of Perpetual Help — help in urgent need", photo: "/saints/perpetua.png" },
      { slug: "carmen", name: "Virgen del Carmen", tagline: "Protection and safe passage", saintColor: "#b98a5e", saintIntention: "Virgen del Carmen — protection and safe passage", photo: "/saints/carmen.png" },
      { slug: "san-alejo", name: "San Alejo", tagline: "Keep enemies and harm away", saintColor: "#9b7bd0", saintIntention: "San Alejo — keep enemies and harm far from me", photo: "/saints/san-alejo.png" },
      { slug: "santa-ana", name: "Santa Ana", tagline: "For family, mothers, and fertility", saintColor: "#cdae5a", saintIntention: "Santa Ana — for family, mothers, and fertility", photo: "/saints/santa-ana.png" },
      { slug: "dolorosa", name: "Nuestra Señora de los Dolores", tagline: "Comfort in grief and hardship", saintColor: "#6f7bbf", saintIntention: "Our Lady of Sorrows — comfort in grief and hardship", photo: "/saints/dolorosa.png" },
      { slug: "guardian-angel", name: "Guardian Angel", tagline: "Watch over me", saintColor: "#bcd4f0", saintIntention: "My guardian angel — watch over me", photo: "/saints/guardian-angel.png" },
      { slug: "guadalupe", name: "Virgen de Guadalupe", tagline: "Protection and grace", saintColor: "#3fae8f", saintIntention: "Our Lady of Guadalupe — protection and grace for my family", photo: "/saints/guadalupe.png" },
      { slug: "santa-marta", name: "Santa Marta la Dominadora", tagline: "Peace and dominion at home", saintColor: "#3f8f5a", saintIntention: "Santa Marta la Dominadora — harmony and dominion over a hard situation", photo: "/saints/santa-marta.png" },
    ],
  },
];

/** Saint/Orisha candle by slug (the "saints" category), or undefined. */
export function getSaintCandle(slug: string | null): CandleArt | undefined {
  const art = slug ? CANDLE_INDEX.get(slug)?.candle : undefined;
  return art?.saintColor ? art : undefined;
}

export type Duration = { days: number; label: string };
export const DURATIONS: Duration[] = [
  { days: 7, label: "7 days" },
  { days: 14, label: "14 days" },
  { days: 30, label: "30 days" },
];

const CANDLE_INDEX = new Map<string, { candle: CandleArt; desire: Desire }>();
for (const d of DESIRES) for (const c of d.candles) CANDLE_INDEX.set(c.slug, { candle: c, desire: d });

export function getDesire(slug: string | null): Desire | undefined {
  return slug ? DESIRES.find((d) => d.slug === slug) : undefined;
}
export function getCandleArt(slug: string | null): CandleArt | undefined {
  return slug ? CANDLE_INDEX.get(slug)?.candle : undefined;
}
export function desireForCandle(slug: string | null): Desire | undefined {
  return slug ? CANDLE_INDEX.get(slug)?.desire : undefined;
}

/** Days remaining before a candle burns out (null if no expiry). */
export function daysLeft(expires_at: string | null): number | null {
  if (!expires_at) return null;
  const ms = new Date(expires_at).getTime() - Date.now();
  if (ms <= 0) return 0;
  return Math.ceil(ms / 86_400_000);
}
