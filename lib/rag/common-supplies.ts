/**
 * Curated list of Original Botanica catalog "ritual basics" that should
 * always be available to Claude for inline linking, regardless of which
 * blog posts the retrieval step happened to surface.
 *
 * These are the supplies that show up in 90% of rituals: candles by color,
 * parchment paper, Florida Water, sea salt, the most common herbs and oils.
 *
 * To add a supply:
 *   1. Find the canonical slug in Supabase (ob_products table)
 *   2. Add a row below with the natural language phrase Claude should use
 *      and the slug to link to
 *
 * Each row is rendered into the system prompt as a hint so Claude knows
 * which generic-sounding supplies are actually in OB's catalog.
 */

export type CommonSupply = {
  /** Natural-language name Claude should use in the prose */
  name: string;
  /** Canonical slug in ob_products */
  slug: string;
};

export const COMMON_SUPPLIES: CommonSupply[] = [
  // 7-day PLAIN candles by color — used when the ritual is "light a candle"
  // or "burn a candle" with no carving or writing involved.
  { name: "black candle", slug: "7-day-plain-candle-black" },
  { name: "white candle", slug: "7-day-plain-candle-white" },
  { name: "red candle", slug: "7-day-plain-candle-red" },
  { name: "pink candle", slug: "7-day-plain-candle-pink" },
  { name: "blue candle", slug: "7-day-plain-candle-blue" },
  { name: "green candle", slug: "7-day-plain-candle-green" },
  { name: "gold candle", slug: "7-day-plain-candle-gold" },
  { name: "yellow candle", slug: "7-day-plain-candle-yellow" },
  { name: "orange candle", slug: "7-day-plain-candle-orange" },
  { name: "brown candle", slug: "7-day-plain-candle-brown" },
  { name: "gray candle", slug: "7-day-plain-candle-gray" },
  { name: "7-color candle", slug: "7-day-plain-candle-7-color" },

  // 7-day PULLOUT candles by color — used when the ritual says to carve,
  // inscribe, dress, or write on the candle. Pullout candles can be removed
  // from the glass to be worked on.
  { name: "black pullout candle", slug: "7-day-pullout-candle-black" },
  { name: "white pullout candle", slug: "7-day-pullout-candle-white" },
  { name: "red pullout candle", slug: "7-day-pullout-candle-red" },
  { name: "pink pullout candle", slug: "7-day-pullout-candle-pink" },
  { name: "blue pullout candle", slug: "7-day-pullout-candle-blue" },
  { name: "green pullout candle", slug: "7-day-pullout-candle-green" },
  { name: "gold pullout candle", slug: "7-day-pullout-candle-gold" },
  { name: "yellow pullout candle", slug: "7-day-pullout-candle-yellow" },
  { name: "orange pullout candle", slug: "7-day-pullout-candle-orange" },
  { name: "brown pullout candle", slug: "7-day-pullout-candle-brown" },
  { name: "purple pullout candle", slug: "7-day-pullout-candle-purple" },
  { name: "grey pullout candle", slug: "7-day-pullout-candle-grey" },

  // Sacred waters
  { name: "Florida Water", slug: "florida-water-cologne" },
  { name: "Holy Water", slug: "holy-water" },
  { name: "Kananga Water", slug: "kananga-water-cologne" },

  // Paper, salt
  { name: "parchment paper", slug: "sheepskin-parchment-paper" },
  { name: "sea salt", slug: "sea-bath-salt" },

  // Common oils
  { name: "Come To Me Oil", slug: "come-to-me-magical-oil" },
  { name: "Attraction Oil", slug: "attraction-magical-oil" },
  { name: "Dismissal Oil", slug: "dismissal-magical-oil" },

  // Common herbs, flowers, resins
  { name: "rue", slug: "rue-herb" },
  { name: "basil", slug: "basil-herb" },
  { name: "hyssop", slug: "hyssop-herb" },
  { name: "bay leaves", slug: "bay-leaves" },
  { name: "sage leaves", slug: "sage-leaves" },
  { name: "lavender", slug: "lavender-flowers" },
  { name: "rosemary", slug: "rosemary-leaves" },
  { name: "rose petals", slug: "rose-buds-petals" },
  { name: "cinnamon sticks", slug: "cinnamon-sticks" },
  { name: "cinnamon powder", slug: "cinnamon-powder" },
  { name: "Dragon's Blood resin", slug: "dragons-blood-resin" },

  // Smoke and ceremony
  { name: "palo santo", slug: "palo-santo-smudge-stick" },
  { name: "white sage smudge stick", slug: "white-sage-smudge-stick" },
  { name: "charcoal tablets", slug: "3-kings-charcoal-rolls-33mm" },

  // Offerings and folk staples
  { name: "honey", slug: "honey-miel-de-abeja" },
  { name: "cascarilla", slug: "cascarilla" },

  // Mojo bags — appear in 100+ posts across the archive
  { name: "luck mojo bag", slug: "blessed-luck-mojo-bag-brujeria-resguardo" },
  { name: "protection mojo bag", slug: "blessed-protection-mojo-bag-brujeria-resguardo" },
  { name: "go away evil mojo bag", slug: "blessed-go-away-evil-mojo-bag-brujeria-resguardo" },
  { name: "health mojo bag", slug: "blessed-health-mojo-bag-brujeria-resguardo" },
  { name: "love mojo bag", slug: "blessed-love-mojo-bag-brujeria-resguardo" },
  { name: "spellbreaker mojo bag", slug: "blessed-spellbreaker-mojo-bag-brujeria-resguardo" },

  // Prepared carved candles — these are the dressed candles Claude often prescribes
  { name: "destroy evil candle", slug: "destroy-evil-hand-carved-prepared-candle" },
  { name: "against odds candle", slug: "against-odds-carved-prepared-candle" },

  // Stones and crystals — most-referenced in the archive
  { name: "clear quartz", slug: "clear-quartz-tumbled-stone" },
  { name: "amethyst", slug: "amethyst-tumbled-stone" },
  { name: "amethyst points", slug: "amethyst-points" },
  { name: "black tourmaline", slug: "black-tourmaline-tumbled-stone" },
  { name: "black obsidian", slug: "black-obsidian-tumbled-stone" },
  { name: "citrine", slug: "citrine-tumbled-stone" },
  { name: "aventurine", slug: "aventurine-tumbled-stone" },
  { name: "carnelian", slug: "carnelian-tumbled-stone" },
  { name: "desert rose", slug: "desert-rose" },

  // Roots, flowers, and additional herbs
  { name: "chamomile flowers", slug: "chamomile-flowers" },
  { name: "calendula flowers", slug: "calendula-flowers" },
  { name: "angelica root", slug: "angelica-root" },
  { name: "Devil's Shoestring root", slug: "devils-shoestring-root" },
  { name: "cloves", slug: "cloves-herb" },

  // Specialty oils
  { name: "Cinnamon Oil", slug: "cinnamon-essential-oil" },
  { name: "Cedarwood Oil", slug: "cedarwood-essential-oil" },
  { name: "Break Up Oil", slug: "break-up-magical-oil" },
  { name: "Blessed Oil", slug: "blessed-magical-oil" },
  { name: "Dragon's Blood Oil", slug: "dragons-blood-magical-oil" },

  // Sacred waters and folk staples
  { name: "Bay Rum", slug: "bay-rum" },
  { name: "black salt", slug: "black-salt-bath-salt" },

  // Smudge variants
  { name: "black sage smudge", slug: "black-sage-mugwort-smudge-stick-9" },
  { name: "blue sage smudge", slug: "blue-sage-smudge-stick" },

  // Altar staples
  { name: "cowrie shells", slug: "cowrie-shells" },
  { name: "altar bell", slug: "altar-bell" },
  { name: "ancestor money", slug: "ancestor-money" },
  { name: "3 Kings incense", slug: "3-kings-incense" },

  // Added from the ritual-material enrichment pass (2026-06): exact catalog
  // matches for named supplies the source posts/videos didn't link directly,
  // so they resolve to a real product page instead of a store search.
  { name: "Yemaya oil", slug: "yemaya-magical-oil" },
  { name: "lucky hand root", slug: "lucky-hand-root" },
  { name: "Yemaya perfume", slug: "yemaya-perfume" },
  { name: "lucky hand sachet powder", slug: "lucky-hand-sachet-powder" },
  { name: "Go Away Evil Floor Wash", slug: "go-away-evil-floor-wash" },
  { name: "Go Away Evil sachet powder", slug: "go-away-evil-sachet-powder" },
  { name: "High John the Conqueror soap", slug: "high-john-the-conqueror-soap" },
  { name: "Open Road sachet powder", slug: "open-road-sachet-powder" },
  { name: "Peace water", slug: "peace-water-spiritual-waters" },
  { name: "sage oil", slug: "sage-essential-oil" },
  { name: "patchouli root", slug: "patchouli-root" },
  { name: "fast luck soap", slug: "fast-luck-soap" },
  { name: "Black Cat sachet powder", slug: "black-cat-sachet-powder" },
  { name: "Go Away Evil Bath & Floor Wash", slug: "go-away-evil-bath-floor-wash" },
  { name: "Saint Barbara Oil", slug: "saint-barbara-magical-oil" },
  { name: "Good Luck Herb Bath", slug: "good-luck-herb-bath" },
  { name: "Oshun 7 Day Orisha Candle", slug: "oshun-7-day-orisha-candle" },
  { name: "Ogun 7 Day Orisha Candle", slug: "ogun-7-day-orisha-candle" },
  { name: "white rose water", slug: "white-rose-water-spiritual-waters" },
  { name: "Saint Martha Oil", slug: "saint-martha-magical-oil" },
  { name: "Good Luck Oil", slug: "good-luck-magical-oil" },
  { name: "Success Custom Big Al Candle", slug: "success-custom-big-al-prayer-candle" },
  { name: "Healing sachet powder", slug: "healing-sachet-powder" },
  { name: "Money Drawing floor wash", slug: "money-drawing-floor-wash" },
  { name: "7 African Powers floor wash", slug: "7-african-powers-floor-wash" },
  { name: "Jinx Removing floor wash", slug: "jinx-removing-floor-wash" },
  { name: "Rose Bath & Floor Wash", slug: "rose-bath-floor-wash" },
  { name: "rose perfume", slug: "rose-perfume" },
  { name: "rose cologne", slug: "rose-cologne" },
  { name: "Uncrossing Herb Bath", slug: "uncrossing-herb-bath" },
  { name: "High John the Conqueror Sachet Powder", slug: "high-john-sachet-powder" },
  { name: "Elegua floor wash", slug: "elegua-floor-wash" },
  { name: "Elegua cologne", slug: "elegua-cologne" },
  { name: "Open Road Soap", slug: "open-roads-soap" },
  { name: "Love sachet powder", slug: "love-sachet-powder" },
  { name: "Love cologne", slug: "love-cologne" },
  { name: "Peace Big Al Bath & Floor Wash", slug: "peace-big-al-bath-floor-wash" },
];

/** Just the slugs, for product card lookup. */
export const COMMON_SUPPLY_SLUGS: string[] = COMMON_SUPPLIES.map((s) => s.slug);

/**
 * Format the common supplies into a prompt block.
 * Goes after the retrieved archive in the system prompt so Claude can
 * reference these for any ritual, not just retrieved ones.
 */
export function formatCommonSuppliesForPrompt(): string {
  const lines = COMMON_SUPPLIES.map((s) => `  - ${s.name}: ${s.slug}`).join("\n");
  return `ORIGINAL BOTANICA COMMON SUPPLIES (always available for inline linking)
When you reference any of these basic ritual supplies in your response, wrap the natural phrase in [[Display Name|slug]] format using the slugs listed here.

WRAP EVERY INSTANCE: If a supply appears more than once in your response (e.g. "sea salt" mentioned in step 2 and again in step 5), wrap EACH instance. Do not wrap only the first occurrence. The reader needs the link at every reference.

CANDLE TYPE RULES (important):
- When the ritual simply lights or burns a candle (no carving, no inscribing, no writing on the candle, no dressing the wax directly), use the PLAIN candle slug for that color. The display name should be the natural phrase ("black candle", "white candle", etc.). Example: [[black candle|7-day-plain-candle-black]].
- When the ritual involves CARVING, INSCRIBING, WRITING ON, or DRESSING the wax of the candle, use the PULLOUT candle slug for that color (pullout candles can be removed from their glass for working). The display name should still read naturally to the user as just "black candle" or "white candle" — keep the prose clean. Example: [[black candle|7-day-pullout-candle-black]].
- The user does not need to know the difference; the link target carries the right product.

${lines}`;
}
