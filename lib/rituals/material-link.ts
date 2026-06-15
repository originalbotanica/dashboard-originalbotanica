import { COMMON_SUPPLIES } from "@/lib/rag/common-supplies";

/**
 * Resolve a store URL for every ritual material so the "What you need" list
 * is always shoppable: each product links back to originalbotanica.com.
 *
 * Most materials come from the ob_products table and already carry a full
 * url + slug. This helper guarantees a link even when they don't, so no
 * listed product is ever a dead end.
 */

const OB_BASE = "https://originalbotanica.com";

/** Normalize a name for matching against the curated common-supplies list. */
function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/** name (normalized) -> canonical product slug, from the common supplies. */
const SUPPLY_BY_NAME = new Map<string, string>(
  COMMON_SUPPLIES.map((s) => [norm(s.name), s.slug]),
);

export type LinkableMaterial = {
  name: string;
  url?: string | null;
  slug?: string | null;
};

/**
 * Best store URL for a material, in priority order:
 *   1. explicit url (from ob_products)
 *   2. product slug          -> originalbotanica.com/<slug>
 *   3. common-supply name hit -> its canonical slug
 *   4. store search           -> originalbotanica.com/search?query=<name>
 */
export function materialUrl(m: LinkableMaterial): string {
  const url = m.url?.trim();
  if (url) return /^https?:\/\//i.test(url) ? url : `${OB_BASE}/${url.replace(/^\//, "")}`;

  const slug = m.slug?.trim();
  if (slug) return `${OB_BASE}/${slug}`;

  const supplySlug = SUPPLY_BY_NAME.get(norm(m.name));
  if (supplySlug) return `${OB_BASE}/${supplySlug}`;

  return `${OB_BASE}/search?query=${encodeURIComponent(m.name)}`;
}
