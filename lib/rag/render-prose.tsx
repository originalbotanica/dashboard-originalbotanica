/**
 * Render reading prose with inline product links.
 *
 * Claude is instructed to wrap real Original Botanica product references in
 * the tokens [[Display Name|product-slug]]. This module parses those tokens
 * and turns them into <a> links pointing at originalbotanica.com.
 *
 * Safety: if the slug isn't in the validated product catalog (e.g. Claude
 * hallucinated one), we render the display name as plain text. Generic
 * supplies that Claude wrote without markup (a brown candle, parchment)
 * pass through untouched.
 */

import { Fragment } from "react";

export type ProductLookup = {
  /** slug → { url, name } */
  byslug: Map<string, { url: string; name: string }>;
};

type Token =
  | { type: "text"; text: string }
  | { type: "link"; name: string; slug: string }
  | { type: "bold"; text: string };

/**
 * Parse a prose string into a sequence of text, product-link, and bold tokens.
 *
 * Recognized patterns:
 *   - Product link: [[Display Name|product-slug]]
 *   - Bold:         **text**
 *
 * Tolerant of two Claude output quirks on links:
 *   - Single closing bracket: [[Name|slug]
 *   - Single opening bracket:  [Name|slug]]
 *
 * Bold is supported because the Astrologer chat occasionally generates
 * markdown bold for emphasis (e.g. **RIGHT NOW: MAY 2026**). Without this
 * we'd render the literal asterisks.
 *
 * The pipe character + slug shape (alphanumerics, hyphens, underscores)
 * is required for links, so normal bracketed text like [note] or [[footnote]]
 * is not matched (no pipe → no match).
 */
export function parseProse(prose: string): Token[] {
  const tokens: Token[] = [];
  // Combined regex matches either a link or a bold span. Whichever capture
  // groups are populated tell us which pattern hit.
  const re =
    /\[\[?([^|\]\[]+)\|([a-z0-9_-]+)\]\]?|\*\*([^*\n]+)\*\*/gi;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(prose))) {
    if (m.index > lastIndex) {
      tokens.push({ type: "text", text: prose.slice(lastIndex, m.index) });
    }
    if (m[1] !== undefined && m[2] !== undefined) {
      tokens.push({
        type: "link",
        name: m[1].trim(),
        slug: m[2].trim().toLowerCase(),
      });
    } else if (m[3] !== undefined) {
      tokens.push({ type: "bold", text: m[3].trim() });
    }
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < prose.length) {
    tokens.push({ type: "text", text: prose.slice(lastIndex) });
  }
  return tokens;
}

/**
 * Render a single line of prose. Use this for headings, single paragraphs,
 * sentence-level fields.
 *
 * When `optimisticBaseUrl` is provided, slugs not present in the lookup
 * are still rendered as links (pointing at `${optimisticBaseUrl}/${slug}`).
 * Use this in contexts where we can't validate the product against a
 * server-side catalog at render time (e.g. the streaming chat). Trust that
 * Claude follows the catalog in 99% of cases; broken links are rare and
 * the prompt forbids inventing slugs.
 */
export function ProseLine({
  text,
  lookup,
  optimisticBaseUrl,
}: {
  text: string;
  lookup: ProductLookup;
  optimisticBaseUrl?: string;
}) {
  const tokens = parseProse(text);
  return (
    <>
      {tokens.map((t, i) => {
        if (t.type === "text") return <Fragment key={i}>{t.text}</Fragment>;
        if (t.type === "bold") {
          return (
            <strong key={i} className="text-foreground font-semibold">
              {t.text}
            </strong>
          );
        }
        const product = lookup.byslug.get(t.slug);
        if (product) {
          return (
            <a
              key={i}
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent-strong underline decoration-accent/40 hover:decoration-accent underline-offset-2 transition-colors"
            >
              {t.name}
            </a>
          );
        }
        if (optimisticBaseUrl) {
          const cleanBase = optimisticBaseUrl.replace(/\/$/, "");
          return (
            <a
              key={i}
              href={`${cleanBase}/${t.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent-strong underline decoration-accent/40 hover:decoration-accent underline-offset-2 transition-colors"
            >
              {t.name}
            </a>
          );
        }
        // Strict mode + unknown slug → plain text, no broken link.
        return <Fragment key={i}>{t.name}</Fragment>;
      })}
    </>
  );
}

/**
 * Render multi-paragraph prose. Splits on blank lines and wraps each
 * paragraph in <p>. Use this for the long-form fields (opening,
 * dynamics.body, ritual.what, etc.).
 */
export function ProseBlock({
  text,
  lookup,
  className = "",
  optimisticBaseUrl,
}: {
  text: string;
  lookup: ProductLookup;
  className?: string;
  optimisticBaseUrl?: string;
}) {
  const paragraphs = text.split(/\n\n+/);
  return (
    <>
      {paragraphs.map((p, i) => (
        <p key={i} className={className}>
          <ProseLine
            text={p}
            lookup={lookup}
            optimisticBaseUrl={optimisticBaseUrl}
          />
        </p>
      ))}
    </>
  );
}

/**
 * Build a ProductLookup from an array of product rows (typically the
 * result of getProductCards). Slugs are case-normalized to lowercase.
 */
export function buildProductLookup(
  products: Array<{ slug: string; url: string; name: string }>,
): ProductLookup {
  const byslug = new Map<string, { url: string; name: string }>();
  for (const p of products) {
    byslug.set(p.slug.toLowerCase(), { url: p.url, name: p.name });
  }
  return { byslug };
}
