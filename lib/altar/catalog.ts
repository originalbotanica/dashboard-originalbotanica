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
  return `${CANDLE_ART_BASE}/${slug}.jpg`;
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

const OB_PRODUCT_IMG =
  "https://dlkhclkmyx18n.cloudfront.net/transforms/products/_productImage";

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
      { slug: "candelaria", name: "La Candelaria · Oyá", tagline: "Courage through change", saintColor: "#b98cf0", saintIntention: "Honoring Oyá — courage through change", photo: `${OB_PRODUCT_IMG}/7ds2060__44657.jpg` },
      { slug: "san-antonio", name: "San Antonio · Eleguá", tagline: "Open the roads", saintColor: "#f0552f", saintIntention: "Honoring Eleguá — open my roads", photo: `${OB_PRODUCT_IMG}/7ds2035__21361.jpg` },
      { slug: "san-juan", name: "San Juan Bautista", tagline: "Cleansing and renewal", saintColor: "#7bb6f2", saintIntention: "Cleansing and renewal on San Juan", photo: `${OB_PRODUCT_IMG}/stjohn_7day__59430.jpg` },
      { slug: "santiago", name: "Santiago · Oggún", tagline: "Strength for the work", saintColor: "#5aa06a", saintIntention: "Honoring Oggún — strength for the work", photo: `${OB_PRODUCT_IMG}/santiagowhite_7day__03218.jpg` },
      { slug: "regla", name: "La Virgen de Regla · Yemayá", tagline: "Protection and healing", saintColor: "#3f7bd8", saintIntention: "Honoring Yemayá — protection and healing", photo: `${OB_PRODUCT_IMG}/yemaya-orisha-7-day-candle.jpg` },
      { slug: "caridad", name: "La Caridad · Ochún", tagline: "Love and abundance", saintColor: "#e8c34a", saintIntention: "Honoring Ochún — love and abundance", photo: `${OB_PRODUCT_IMG}/7ds2065__84976.1414689245.1280.1280__30505.jpg` },
      { slug: "mercedes", name: "Las Mercedes · Obatalá", tagline: "Peace and clarity", saintColor: "#efe7d6", saintIntention: "Honoring Obatalá — peace and clarity", photo: `${OB_PRODUCT_IMG}/mercedes_7day__10148.jpg` },
      { slug: "san-miguel", name: "San Miguel Arcángel", tagline: "Protection over you and your home", saintColor: "#7bb6f2", saintIntention: "San Miguel — protect me and mine", photo: `${OB_PRODUCT_IMG}/candle-saint-michael-white-7-day.jpg` },
      { slug: "san-francisco", name: "San Francisco · Orula", tagline: "Wisdom and guidance", saintColor: "#cda94f", saintIntention: "Honoring Orula — wisdom and guidance", photo: `${OB_PRODUCT_IMG}/stfrancis_7day__52566.jpg` },
      { slug: "barbara", name: "Santa Bárbara · Changó", tagline: "Courage and victory", saintColor: "#f0552f", saintIntention: "Honoring Changó — courage and victory", photo: `${OB_PRODUCT_IMG}/7ds2050__63108.jpg` },
      { slug: "lazaro", name: "San Lázaro · Babalú-Ayé", tagline: "Health and healing", saintColor: "#9b7bd0", saintIntention: "Honoring Babalú-Ayé — health and healing", photo: `${OB_PRODUCT_IMG}/lazarus_7day__43554.jpg` },
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
