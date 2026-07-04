/**
 * Text hygiene for ritual content.
 *
 * Source data arrives from scraped blog HTML and the store's product feed,
 * both of which can leak HTML entities (&#039;, &amp;) and raw markdown
 * links ("[Dragon's Blood Incense Powder](https://...)") into stored text.
 * Every read path routes through these helpers so members never see
 * encoding artifacts, regardless of what an older pipeline run stored.
 */

import type { RitualMaterial } from "./queries";

const NAMED_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&quot;": '"',
  "&apos;": "'",
  "&nbsp;": " ",
  "&lt;": "<",
  "&gt;": ">",
  "&eacute;": "é",
  "&aacute;": "á",
  "&iacute;": "í",
  "&oacute;": "ó",
  "&uacute;": "ú",
  "&ntilde;": "ñ",
  "&Eacute;": "É",
  "&Ntilde;": "Ñ",
};

/** Decode numeric (&#039; / &#x27;) and common named HTML entities. */
export function decodeEntities(s: string): string {
  if (!s || s.indexOf("&") === -1) return s;
  let out = s.replace(/&#(\d+);/g, (_, code) =>
    String.fromCodePoint(Number(code)),
  );
  out = out.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
    String.fromCodePoint(parseInt(hex, 16)),
  );
  for (const [entity, char] of Object.entries(NAMED_ENTITIES)) {
    out = out.split(entity).join(char);
  }
  // Second pass catches double-encoded values like &amp;#039;
  if (/&#\d+;|&#x[0-9a-fA-F]+;/.test(out)) {
    out = out
      .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
      .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
        String.fromCodePoint(parseInt(hex, 16)),
      );
  }
  return out;
}

const MD_LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

/** Replace inline markdown links with their visible text. */
export function stripMarkdownLinks(s: string): string {
  return s ? s.replace(MD_LINK, "$1") : s;
}

/** Clean a prose field: decode entities, drop markdown link syntax. */
export function cleanText(s: string): string;
export function cleanText(s: string | null): string | null;
export function cleanText(s: string | null): string | null {
  if (s == null) return s;
  return stripMarkdownLinks(decodeEntities(s)).replace(/[ \t]{2,}/g, " ").trim();
}

/**
 * Clean one material. A name stored as a full markdown link becomes the
 * link's text, and its URL is kept if the material didn't already have one,
 * so the product stays shoppable.
 */
export function cleanMaterial(m: RitualMaterial): RitualMaterial {
  let name = decodeEntities(m.name ?? "");
  let url = m.url ?? null;
  const full = name.match(/^\s*\[([^\]]+)\]\(([^)\s]+)\)\s*$/);
  if (full) {
    name = full[1].trim();
    if (!url) url = full[2];
  } else {
    name = stripMarkdownLinks(name);
  }
  return { ...m, name: name.trim(), url };
}

/** Clean the fields shown on ritual cards (lists, shelves, search). */
export function cleanCardFields<
  T extends {
    title_en: string;
    title_es?: string | null;
    summary?: string | null;
    summary_es?: string | null;
  },
>(card: T): T {
  return {
    ...card,
    title_en: cleanText(card.title_en),
    title_es: card.title_es != null ? cleanText(card.title_es) : card.title_es,
    summary: card.summary != null ? cleanText(card.summary) : card.summary,
    summary_es:
      card.summary_es != null ? cleanText(card.summary_es) : card.summary_es,
  };
}
