import { createClient } from "@/utils/supabase/server";

/**
 * Retrieval-Augmented Generation helper.
 *
 * Given a natural-language query (the user's intention, the reading topic,
 * the situation being addressed), embed it with Voyage and find the top
 * matching blog posts from Original Botanica's library. Return them as
 * structured context Claude can use to ground rituals in real OB content.
 *
 * Failure mode is graceful: if anything errors (missing API key, network,
 * empty corpus), we return an empty array and the reading proceeds with
 * generic instructions. RAG augments; it should never block a reading.
 */

const VOYAGE_MODEL = "voyage-3.5";
const VOYAGE_DIM = 1024;
const DEFAULT_MATCH_COUNT = 3;

export type RetrievedRitual = {
  slug: string;
  url: string;
  title: string;
  description: string | null;
  body_excerpt: string;
  image_url: string | null;
  product_slugs: string[];
  similarity: number;
};

export type ProductCard = {
  slug: string;
  url: string;
  name: string;
  image_url: string | null;
};

/**
 * Embed a query string. Returns null on any failure.
 */
async function embedQuery(text: string): Promise<number[] | null> {
  const key = process.env.VOYAGE_API_KEY;
  if (!key) {
    console.warn("[RAG] VOYAGE_API_KEY missing in runtime env");
    return null;
  }
  try {
    const res = await fetch("https://api.voyageai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: [text],
        model: VOYAGE_MODEL,
        input_type: "query",
        output_dimension: VOYAGE_DIM,
      }),
    });
    if (!res.ok) {
      const errBody = await res.text();
      console.warn("[RAG] Voyage embed failed:", res.status, errBody.slice(0, 200));
      return null;
    }
    const json: { data: Array<{ embedding: number[] }> } = await res.json();
    return json.data[0]?.embedding ?? null;
  } catch (err) {
    console.warn("[RAG] Voyage embed error:", (err as Error).message);
    return null;
  }
}

/**
 * Find the top N ritual posts matching a free-text query.
 */
export async function retrieveRituals(
  query: string,
  matchCount: number = DEFAULT_MATCH_COUNT,
): Promise<RetrievedRitual[]> {
  if (!query.trim()) return [];

  console.log(`[RAG] retrieveRituals query: "${query.slice(0, 80)}"`);
  const embedding = await embedQuery(query);
  if (!embedding) {
    console.warn("[RAG] No embedding returned, skipping retrieval");
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("match_ritual_posts", {
    query_embedding: embedding,
    match_count: matchCount,
  });
  if (error) {
    console.warn("[RAG] match_ritual_posts error:", error.message);
    return [];
  }
  const results = (data ?? []) as RetrievedRitual[];
  console.log(`[RAG] retrieved ${results.length} rituals`);
  return results;
}

/**
 * Look up product card data (name, image, url) for a list of slugs.
 * Used to render product cards on reading pages.
 */
export async function getProductCards(slugs: string[]): Promise<ProductCard[]> {
  if (slugs.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ob_products")
    .select("slug, url, name, image_url")
    .in("slug", slugs);
  if (error) {
    console.warn("getProductCards error:", error.message);
    return [];
  }
  // Preserve the input order for predictable rendering
  const map = new Map<string, ProductCard>(
    (data ?? []).map((p: ProductCard) => [p.slug, p]),
  );
  return slugs.map((s) => map.get(s)).filter(Boolean) as ProductCard[];
}

/**
 * Format retrieved rituals into a compact text block suitable for
 * injecting into a system prompt. Each ritual gets title, source URL,
 * description, and a body excerpt capped to keep prompt size predictable.
 */
export function formatRitualsForPrompt(rituals: RetrievedRitual[]): string {
  if (rituals.length === 0) return "";
  return rituals
    .map((r, i) => {
      const excerpt = r.body_excerpt.slice(0, 1200);
      const productList = r.product_slugs.length
        ? `\nProducts mentioned (available at originalbotanica.com): ${r.product_slugs.join(", ")}`
        : "";
      return `RITUAL ${i + 1}: ${r.title}
Source: ${r.url}
${r.description ? r.description + "\n" : ""}
${excerpt}${productList}`;
    })
    .join("\n\n---\n\n");
}

/**
 * Source attribution shape we persist with each reading so we can render
 * "drawn from" links on the reading page. JSON-serializable.
 */
export type RetrievedSource = {
  slug: string;
  url: string;
  title: string;
};

/**
 * Extract the metadata we want to persist alongside a generated reading.
 * Returns:
 *   - product_slugs: deduped union of all product slugs the retrieved
 *     posts reference, in retrieval-score order (most relevant first).
 *   - sources: minimal attribution data for rendering "drawn from" links.
 */
export function metadataFromRituals(rituals: RetrievedRitual[]): {
  product_slugs: string[];
  sources: RetrievedSource[];
} {
  const seen = new Set<string>();
  const product_slugs: string[] = [];
  const sources: RetrievedSource[] = [];
  for (const r of rituals) {
    sources.push({ slug: r.slug, url: r.url, title: r.title });
    for (const s of r.product_slugs) {
      if (!seen.has(s)) {
        seen.add(s);
        product_slugs.push(s);
      }
    }
  }
  return { product_slugs, sources };
}
