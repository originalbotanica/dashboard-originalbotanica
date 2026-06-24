/**
 * Lightweight content screen for member-submitted text that can appear
 * publicly — the virtual altar's dedication/petition and the ancestor
 * memorial's name/dedication.
 *
 * Deliberately conservative. It blocks clear profanity and slurs only,
 * and is built NOT to flag the spiritual vocabulary that is normal and
 * welcome here (spirit, death, curse, hex, ritual, Orishas, etc.). It
 * matches whole words (after light leet-speak normalization) so it does
 * not trip on innocent substrings — e.g. "Scunthorpe" or "auspicious".
 *
 * This is a first line of defense, not a guarantee. Pair it with the
 * ability to extinguish/remove a candle or memorial if something slips
 * through.
 */

// Canonical (already-normalized) forms of disallowed words.
const BLOCKLIST = new Set([
  "fuck",
  "shit",
  "bitch",
  "cunt",
  "asshole",
  "bastard",
  "dickhead",
  "whore",
  "slut",
  "nigger",
  "nigga",
  "faggot",
  "fag",
  "retard",
  "kike",
  "spic",
  "chink",
  "wetback",
  "tranny",
  "gook",
]);

/** Normalize a single token: lowercase, undo common leet-speak, strip
 *  non-letters, and collapse 3+ repeated letters ("fuuuuck" -> "fuck"). */
function canonical(word: string): string {
  return word
    .toLowerCase()
    .replace(/[1!|]/g, "i")
    .replace(/0/g, "o")
    .replace(/3/g, "e")
    .replace(/[4@]/g, "a")
    .replace(/[5$]/g, "s")
    .replace(/7/g, "t")
    .replace(/[^a-z]/g, "")
    .replace(/(.)\1{2,}/g, "$1");
}

/** Returns true if any of the given texts contains disallowed language. */
export function containsProhibitedLanguage(
  ...texts: (string | null | undefined)[]
): boolean {
  const joined = texts.filter(Boolean).join(" ");
  if (!joined) return false;
  // Collapse spaced-out evasion ("f u c k" -> "fuck") by joining runs of
  // single letters. Multi-letter words (e.g. "a cleansing") are untouched.
  const deSpaced = joined.replace(
    /\b[a-z](?:\s+[a-z]\b)+/gi,
    (m) => m.replace(/\s+/g, ""),
  );
  return deSpaced.split(/\s+/).some((raw) => {
    const c = canonical(raw);
    if (!c) return false;
    if (BLOCKLIST.has(c)) return true;
    // Catch simple inflections: plurals and -er/-ed/-ing endings.
    const stem = c.replace(/(s|es|er|ers|ed|ing|in)$/, "");
    return BLOCKLIST.has(stem);
  });
}
