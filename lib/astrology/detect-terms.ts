/**
 * Find glossary terms inside a run of reading prose so the UI can make
 * them tappable. Pure string work, safe on server or client.
 *
 * Rules:
 * - Case-sensitive on capitalized names (planets, signs) so "the sun was
 *   warm" never lights up but "your Sun" does. Lowercase aliases
 *   (retrograde, transit, trine...) match case-insensitively.
 * - "4th house" / "casa 4" matches houses 1-12.
 * - Only the FIRST occurrence of each term per text block becomes a
 *   segment; repeats stay plain so prose doesn't turn into a link farm.
 */
import { GLOSSARY } from "./glossary";

export type TermSegment =
  | { type: "text"; text: string }
  | { type: "term"; text: string; termKey: string }
  | { type: "house"; text: string; house: number };

type Locale = "en" | "es";

type CompiledAlias = { alias: string; key: string; caseSensitive: boolean };

const compiled: Record<Locale, CompiledAlias[]> = { en: [], es: [] };
for (const locale of ["en", "es"] as const) {
  for (const g of GLOSSARY) {
    for (const alias of g.aliases[locale]) {
      compiled[locale].push({
        alias,
        key: g.key,
        // Capitalized aliases are proper nouns: match exactly.
        caseSensitive: alias[0] === alias[0].toUpperCase(),
      });
    }
  }
  // Longest first so "Rising sign" wins over "Rising".
  compiled[locale].sort((a, b) => b.alias.length - a.alias.length);
}

const HOUSE_RE: Record<Locale, RegExp> = {
  en: /\b(1[0-2]|[1-9])(st|nd|rd|th) house\b/g,
  es: /\bcasa (1[0-2]|[1-9])\b/g,
};

const WORD = /[A-Za-zÀ-ÿ0-9]/;

/** Split prose into plain text and tappable term segments.
 *  Locale "auto" matches both languages' aliases: readings may be in
 *  either language and the card localizes itself at tap time. */
export function detectTerms(text: string, locale: Locale | "auto" = "auto"): TermSegment[] {
  type Hit = { start: number; end: number; seg: TermSegment };
  const hits: Hit[] = [];
  const seen = new Set<string>();
  const locales: Locale[] = locale === "auto" ? ["en", "es"] : [locale];
  const aliasList =
    locale === "auto"
      ? [...compiled.en, ...compiled.es].sort((a, b) => b.alias.length - a.alias.length)
      : compiled[locale];

  // Houses first (they contain digits; no overlap with name aliases).
  for (const loc of locales) {
  HOUSE_RE[loc].lastIndex = 0;
  let hm: RegExpExecArray | null;
  while ((hm = HOUSE_RE[loc].exec(text))) {
    const n = parseInt(hm[1], 10);
    const id = `house-${n}`;
    if (seen.has(id)) continue;
    seen.add(id);
    hits.push({
      start: hm.index,
      end: hm.index + hm[0].length,
      seg: { type: "house", text: hm[0], house: n },
    });
  }
  }

  for (const { alias, key, caseSensitive } of aliasList) {
    if (seen.has(key)) continue;
    const haystack = caseSensitive ? text : text.toLowerCase();
    const needle = caseSensitive ? alias : alias.toLowerCase();
    let from = 0;
    while (from <= haystack.length - needle.length) {
      const i = haystack.indexOf(needle, from);
      if (i === -1) break;
      const before = text[i - 1];
      const after = text[i + needle.length];
      const wordBounded =
        (!before || !WORD.test(before)) && (!after || !WORD.test(after));
      const overlaps = hits.some((h) => i < h.end && i + needle.length > h.start);
      if (wordBounded && !overlaps) {
        seen.add(key);
        hits.push({
          start: i,
          end: i + needle.length,
          seg: { type: "term", text: text.slice(i, i + needle.length), termKey: key },
        });
        break;
      }
      from = i + 1;
    }
  }

  if (hits.length === 0) return [{ type: "text", text }];

  hits.sort((a, b) => a.start - b.start);
  const out: TermSegment[] = [];
  let cursor = 0;
  for (const h of hits) {
    if (h.start > cursor) out.push({ type: "text", text: text.slice(cursor, h.start) });
    out.push(h.seg);
    cursor = h.end;
  }
  if (cursor < text.length) out.push({ type: "text", text: text.slice(cursor) });
  return out;
}
