/**
 * The ritual library's purpose taxonomy.
 *
 * These are the folk categories members browse by, the shelves of the
 * library. They are richer than the rituals.intention database enum (which
 * groups broadly: money, cleansing, etc.), so each purpose maps to one
 * intention value while keeping its own folk identity on the shelf. For
 * example, money-drawing and gambling-luck both store intention "money" but
 * live as separate shelves.
 *
 * `aliases` feed the extraction pipeline: when Claude reads a post, these
 * help it choose the right purpose. The list is also the single source of
 * truth for the browse UI order.
 *
 * Edit freely. Add, rename, reorder. The pipeline and the UI both read from
 * here, so the library follows whatever you set.
 */

/** Valid values of the rituals.intention CHECK constraint in the schema. */
export type Intention =
  | "love"
  | "money"
  | "protection"
  | "cleansing"
  | "road_opening"
  | "healing"
  | "justice"
  | "banishing"
  | "reconciliation"
  | "ancestor_work"
  | "spirit_work";

export type Purpose = {
  /** URL slug and stable id, e.g. "money-drawing". */
  slug: string;
  /** Shelf label, e.g. "Money Drawing". */
  label: string;
  /** One line for the shelf card and the category page intro. */
  blurb: string;
  /** Which rituals.intention value rows in this purpose store. */
  intention: Intention;
  /** Words that signal this purpose, used to guide extraction. */
  aliases: string[];
  /** Hero/card image from the OB CloudFront CDN (path after the domain). */
  image: string;
};

export const PURPOSES: Purpose[] = [
  {
    slug: "money-drawing",
    label: "Money Drawing",
    blurb: "Draw money, prosperity, and steady income toward you.",
    intention: "money",
    aliases: ["money", "prosperity", "wealth", "abundance", "money drawing", "fast luck money", "attract money", "business"],
    image: "/herbs-roots_2022-09-13-200156_sxob.png",
  },
  {
    slug: "gambling-luck",
    label: "Gambling & Luck",
    blurb: "Lady Luck at your side, for games, numbers, and the lucky hand.",
    intention: "money",
    aliases: ["gambling", "luck", "lucky", "lottery", "numbers", "casino", "fast luck", "lucky hand", "win"],
    image: "/spiritual-candles.png",
  },
  {
    slug: "manifestation",
    label: "Manifestation & Intention",
    blurb: "Set intentions and call your desires into being.",
    intention: "spirit_work",
    aliases: ["manifestation", "manifest", "intention", "law of attraction", "full moon", "new moon", "vision", "goals", "portal", "affirmation"],
    image: "/transforms/Blog/_thumbnail/Tarot-Reading.jpg",
  },
  {
    slug: "road-opening",
    label: "Road Opening",
    blurb: "Clear the blocks and open the way forward.",
    intention: "road_opening",
    aliases: ["road opener", "road opening", "abre camino", "open roads", "remove obstacles", "new opportunities", "doors"],
    image: "/cta-spiritual-services.jpg",
  },
  {
    slug: "love-drawing",
    label: "Love & Attraction",
    blurb: "Draw love, deepen attraction, sweeten a connection.",
    intention: "love",
    aliases: ["love", "attraction", "romance", "come to me", "sweetening", "passion", "marriage", "soulmate"],
    image: "/spiritual-baths-washes.png",
  },
  {
    slug: "reconciliation",
    label: "Reconciliation",
    blurb: "Mend what broke and call a loved one back.",
    intention: "reconciliation",
    aliases: ["reconcile", "reconciliation", "return lover", "come back", "mend", "forgiveness", "reunite"],
    image: "/transforms/_miscImage/virtual-candle-altar.jpg",
  },
  {
    slug: "protection",
    label: "Protection",
    blurb: "Shield yourself, your home, and the ones you love.",
    intention: "protection",
    aliases: ["protection", "protect", "shield", "evil eye", "mal de ojo", "ward", "defense", "safe", "guard"],
    image: "/incense-smudges-resins.png",
  },
  {
    slug: "uncrossing",
    label: "Uncrossing & Reversal",
    blurb: "Lift a crossed condition and send it back where it came from.",
    intention: "cleansing",
    aliases: ["uncrossing", "crossed", "jinx", "hex", "curse", "reversal", "reverse", "send back", "break a hex"],
    image: "/spiritual-baths-washes.png",
  },
  {
    slug: "cleansing",
    label: "Spiritual Cleansing",
    blurb: "Clear heavy energy from your body, your spirit, your space.",
    intention: "cleansing",
    aliases: ["cleansing", "limpieza", "spiritual bath", "despojo", "cleanse", "purify", "clear energy", "smoke"],
    image: "/incense-smudges-resins.png",
  },
  {
    slug: "banishing",
    label: "Banishing & Cut and Clear",
    blurb: "Cut ties, banish what harms you, and clear the air for good.",
    intention: "banishing",
    aliases: ["banishing", "banish", "cut and clear", "get rid", "send away", "drive away", "break up", "stop"],
    image: "/herbs-roots_2022-09-13-200156_sxob.png",
  },
  {
    slug: "court-case",
    label: "Court Case & Justice",
    blurb: "For fairness in court, justice, and winning your case.",
    intention: "justice",
    aliases: ["court", "court case", "justice", "legal", "law", "judge", "win case", "vindication"],
    image: "/cta-spiritual-services.jpg",
  },
  {
    slug: "healing",
    label: "Healing & Wellness",
    blurb: "Support healing of body, mind, and spirit.",
    intention: "healing",
    aliases: ["healing", "health", "wellness", "recovery", "comfort", "grief", "peace of mind", "strength"],
    image: "/spiritual-candles.png",
  },
  {
    slug: "blessing-peace",
    label: "Blessing & Peace",
    blurb: "Bless a home, find peace, and invite good spirit in.",
    intention: "spirit_work",
    aliases: ["blessing", "bless", "peace", "home blessing", "harmony", "tranquility", "good spirit", "faith"],
    image: "/transforms/_miscImage/virtual-candle-altar.jpg",
  },
  {
    slug: "ancestor-work",
    label: "Ancestor & Spirit Work",
    blurb: "Honor the dead, work with your guides, tend the spirits.",
    intention: "ancestor_work",
    aliases: ["ancestor", "ancestors", "egun", "muertos", "spirit guide", "boveda", "espiritismo", "offering", "the dead"],
    image: "/spiritual-candles.png",
  },
];

const BY_SLUG = new Map(PURPOSES.map((p) => [p.slug, p]));

export function getPurpose(slug: string): Purpose | undefined {
  return BY_SLUG.get(slug);
}

export function isPurposeSlug(slug: string): boolean {
  return BY_SLUG.has(slug);
}

/** The slugs, in shelf order. Handy for the pipeline's allowed-values list. */
export const PURPOSE_SLUGS: string[] = PURPOSES.map((p) => p.slug);

/** OB CloudFront base; prepend to a Purpose.image to get a full URL. */
export const OB_CDN = "https://dlkhclkmyx18n.cloudfront.net";

/** Spanish shelf labels and blurbs, keyed by slug. */
const PURPOSE_ES: Record<string, { label: string; blurb: string }> = {
  "money-drawing": { label: "Atraer Dinero", blurb: "Atrae dinero, prosperidad e ingresos estables hacia ti." },
  "gambling-luck": { label: "Juego y Suerte", blurb: "La suerte de tu lado, para juegos, números y la mano ganadora." },
  "manifestation": { label: "Manifestación e Intención", blurb: "Fija intenciones y llama tus deseos a la existencia." },
  "road-opening": { label: "Abre Caminos", blurb: "Despeja los bloqueos y abre el camino hacia adelante." },
  "love-drawing": { label: "Amor y Atracción", blurb: "Atrae el amor, profundiza la atracción, endulza una conexión." },
  "reconciliation": { label: "Reconciliación", blurb: "Repara lo que se rompió y llama de vuelta a un ser querido." },
  "protection": { label: "Protección", blurb: "Protégete a ti, a tu hogar y a quienes amas." },
  "uncrossing": { label: "Descruce y Reversión", blurb: "Levanta una condición cruzada y devuélvela de donde vino." },
  "cleansing": { label: "Limpieza Espiritual", blurb: "Despeja la energía pesada de tu cuerpo, tu espíritu y tu espacio." },
  "banishing": { label: "Destierro y Corte", blurb: "Corta lazos, destierra lo que te daña y despeja el aire para siempre." },
  "court-case": { label: "Casos de Corte y Justicia", blurb: "Para la justicia en la corte y para ganar tu caso." },
  "healing": { label: "Sanación y Bienestar", blurb: "Apoya la sanación del cuerpo, la mente y el espíritu." },
  "blessing-peace": { label: "Bendición y Paz", blurb: "Bendice un hogar, encuentra la paz e invita al buen espíritu." },
  "ancestor-work": { label: "Ancestros y Espíritus", blurb: "Honra a los muertos, trabaja con tus guías, atiende a los espíritus." },
};

/** Locale-aware shelf label. Falls back to the English label. */
export function purposeLabel(p: Purpose, locale: "en" | "es"): string {
  return locale === "es" ? PURPOSE_ES[p.slug]?.label ?? p.label : p.label;
}

/** Locale-aware shelf blurb. Falls back to the English blurb. */
export function purposeBlurb(p: Purpose, locale: "en" | "es"): string {
  return locale === "es" ? PURPOSE_ES[p.slug]?.blurb ?? p.blurb : p.blurb;
}
