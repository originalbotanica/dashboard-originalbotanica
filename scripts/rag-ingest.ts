/**
 * RAG ingestion script for Original Botanica blog + product catalog.
 *
 * What it does:
 *   1. Pulls all product URLs from OB.com product sitemaps (~3,400 SKUs).
 *      For each, fetches name + image and upserts into ob_products.
 *   2. Pulls all blog post URLs from OB.com blog sitemaps (~600 posts).
 *      For each, fetches the HTML, extracts title/description/keywords/body
 *      and the product slugs the post links to, embeds with Voyage AI,
 *      and upserts into ritual_posts.
 *
 * Run once initially, then periodically via cron to pick up new posts.
 *
 * Required env vars (in .env.local or shell):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   VOYAGE_API_KEY
 *
 * Usage:
 *   npx tsx scripts/rag-ingest.ts                # full ingest
 *   npx tsx scripts/rag-ingest.ts --products     # products only
 *   npx tsx scripts/rag-ingest.ts --blog         # blog only
 *   npx tsx scripts/rag-ingest.ts --limit 20     # cap how many to process
 */

import { createClient } from "@supabase/supabase-js";

// ---------- config ----------
const PRODUCT_SITEMAPS = [
  "https://originalbotanica.com/sitemaps-1-product-physicalProducts-1-sitemap-p1.xml",
  "https://originalbotanica.com/sitemaps-1-product-physicalProducts-1-sitemap-p2.xml",
  "https://originalbotanica.com/sitemaps-1-product-physicalProducts-1-sitemap-p3.xml",
  "https://originalbotanica.com/sitemaps-1-product-physicalProducts-1-sitemap-p4.xml",
  "https://originalbotanica.com/sitemaps-1-product-physicalProducts-1-sitemap-p5.xml",
  "https://originalbotanica.com/sitemaps-1-product-physicalProducts-1-sitemap-p6.xml",
  "https://originalbotanica.com/sitemaps-1-product-physicalProducts-1-sitemap-p7.xml",
];

const BLOG_SITEMAPS = [
  "https://originalbotanica.com/sitemaps-1-section-blog-1-sitemap-p1.xml",
  "https://originalbotanica.com/sitemaps-1-section-blog-1-sitemap-p2.xml",
];

const USER_AGENT = "Mozilla/5.0 (Original Botanica Astrology RAG Ingest)";
const VOYAGE_MODEL = "voyage-3.5"; // 1024 dim
const VOYAGE_DIM = 1024;
const EMBED_BATCH_SIZE = 16; // Voyage allows up to 128 per call
const FETCH_CONCURRENCY = 2; // OB.com rate-limits; keep it gentle
const FETCH_RETRIES = 5; // retries on rate-limit (503/429)
const RATE_LIMIT_STATUSES = new Set([429, 503, 502, 504]);
const MAX_BACKOFF_MS = 8000;

// ---------- env ----------
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const VOYAGE_KEY = process.env.VOYAGE_API_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// ---------- helpers ----------
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Fetch that survives OB.com's rate limiting. The site returns 503/429 under
 * rapid load (the cause of the original 600→45 blog drop). On a rate-limit
 * status we honor Retry-After when present, otherwise back off exponentially
 * with jitter, up to FETCH_RETRIES times. Returns the final Response (which may
 * still be non-OK) or null if a network error persisted through every attempt.
 */
async function politeFetch(url: string): Promise<Response | null> {
  let lastErr: unknown = null;
  for (let attempt = 0; attempt <= FETCH_RETRIES; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
      if (res.ok || !RATE_LIMIT_STATUSES.has(res.status)) return res;
      // Rate-limited: wait and retry (unless we're out of attempts).
      if (attempt === FETCH_RETRIES) return res;
      const retryAfter = parseInt(res.headers.get("retry-after") || "0", 10);
      const wait = retryAfter > 0
        ? retryAfter * 1000
        : Math.min(MAX_BACKOFF_MS, 600 * 2 ** attempt) + Math.random() * 400;
      await sleep(wait);
    } catch (e) {
      lastErr = e;
      if (attempt === FETCH_RETRIES) break;
      await sleep(Math.min(MAX_BACKOFF_MS, 600 * 2 ** attempt) + Math.random() * 400);
    }
  }
  if (lastErr) console.warn("fetch error:", url, (lastErr as Error).message);
  return null;
}

async function fetchUrls(sitemapUrl: string): Promise<string[]> {
  const res = await fetch(sitemapUrl, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`sitemap ${sitemapUrl} → ${res.status}`);
  const xml = await res.text();
  const locs: string[] = [];
  const re = /<loc>([^<]+)<\/loc>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) locs.push(m[1]);
  return locs;
}

function slugFromUrl(u: string): string {
  // e.g. https://originalbotanica.com/road-opener-oil → "road-opener-oil"
  // e.g. https://originalbotanica.com/blog/make-mojo-bag → "make-mojo-bag"
  try {
    const url = new URL(u);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] ?? "";
  } catch {
    return "";
  }
}

function isProductUrl(u: string): boolean {
  // OB.com product URLs are single-segment paths off the root, e.g.
  // /road-opener-oil. Filter out blog, category, system pages.
  try {
    const url = new URL(u);
    if (url.hostname !== "originalbotanica.com") return false;
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length !== 1) return false;
    const blocked = new Set([
      "blog", "account", "cart", "checkout", "search", "sitemap",
      "about-our-store", "shop", "shop-by-desire", "shop-by-product",
      "shop-by-service", "terms", "privacy",
    ]);
    if (blocked.has(parts[0])) return false;
    return true;
  } catch {
    return false;
  }
}

function meta(html: string, attr: "property" | "name", key: string): string | null {
  const re = new RegExp(
    `<meta[^>]*${attr}=["']${key}["'][^>]*content=["']([^"']*)["']`,
    "i",
  );
  const m = html.match(re);
  if (m) return decodeEntities(m[1]);
  const re2 = new RegExp(
    `<meta[^>]*content=["']([^"']*)["'][^>]*${attr}=["']${key}["']`,
    "i",
  );
  const m2 = html.match(re2);
  return m2 ? decodeEntities(m2[1]) : null;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function extractTitle(html: string): string {
  return (
    meta(html, "property", "og:title") ||
    html.match(/<title>([^<]+)<\/title>/)?.[1] ||
    ""
  ).trim();
}

function extractBody(html: string): string {
  // Strategy: find the FIRST <article ...> in the page (the post body wrapper),
  // capture everything until the first </article> that's NOT immediately
  // followed by another inline article. Fallback to <main>...</main>.
  // Regex can't handle nested tags reliably, so we take the slice between the
  // first <article> opening and the LAST </main> closing — that captures the
  // whole post body including all nested divs.
  let raw = "";
  const articleStart = html.search(/<article[^>]*>/i);
  const mainEnd = html.search(/<\/main>/i);
  if (articleStart >= 0 && mainEnd > articleStart) {
    raw = html.slice(articleStart, mainEnd);
  } else {
    const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    raw = mainMatch ? mainMatch[1] : html;
  }

  // Strip script / style / related-posts cards / nav / footer / header
  raw = raw
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<article[^>]*class="post-card[\s\S]*?<\/article>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ");

  // Strip all remaining tags
  const text = raw
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
  return text.slice(0, 8000);
}

function extractProductSlugs(html: string, knownSlugs: Set<string>): string[] {
  const found = new Set<string>();
  const re = /href=["'](https:\/\/originalbotanica\.com\/[^"'#?]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const url = m[1];
    if (!isProductUrl(url)) continue;
    const slug = slugFromUrl(url);
    if (slug && knownSlugs.has(slug)) found.add(slug);
  }
  return [...found];
}

function extractKeywords(html: string): string[] {
  const raw = meta(html, "name", "keywords");
  if (!raw) return [];
  return raw.split(",").map((k) => k.trim()).filter(Boolean);
}

async function withConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, i: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function run() {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await worker(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: limit }, run));
  return results;
}

async function embedBatch(texts: string[]): Promise<number[][]> {
  if (!VOYAGE_KEY) throw new Error("VOYAGE_API_KEY missing");
  const res = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VOYAGE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: texts,
      model: VOYAGE_MODEL,
      input_type: "document",
      output_dimension: VOYAGE_DIM,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Voyage embed failed (${res.status}): ${text.slice(0, 300)}`);
  }
  const json: { data: Array<{ embedding: number[] }> } = await res.json();
  return json.data.map((d) => d.embedding);
}

// ---------- product ingest ----------
async function ingestProducts(limit?: number, offset = 0): Promise<Set<string>> {
  console.log("[products] gathering URLs from sitemaps...");
  const allUrls: string[] = [];
  for (const sm of PRODUCT_SITEMAPS) {
    const urls = await fetchUrls(sm);
    allUrls.push(...urls);
  }
  console.log(`[products] ${allUrls.length} URLs in sitemaps`);

  // Filter to product URLs (single-segment paths)
  const productUrls = allUrls.filter(isProductUrl);
  console.log(`[products] ${productUrls.length} look like product pages`);

  const sliceEnd = limit ? offset + limit : undefined;
  const subset = productUrls.slice(offset, sliceEnd);
  console.log(`[products] processing slice ${offset}..${offset + subset.length}`);

  let done = 0;
  let inserted = 0;
  let skipped404 = 0;
  let skippedOther = 0;
  let dbErrors = 0;
  await withConcurrency(subset, FETCH_CONCURRENCY, async (url) => {
    try {
      const slug = slugFromUrl(url);
      if (!slug) {
        skippedOther++;
        return;
      }
      const res = await politeFetch(url);
      if (!res || !res.ok) {
        if (res?.status === 404) skipped404++;
        else skippedOther++;
        return;
      }
      const html = await res.text();
      const name =
        extractTitle(html).replace(/\s*\|\s*Original Botanica.*$/i, "").trim() ||
        slug;
      const image = meta(html, "property", "og:image");
      const { error } = await supabase
        .from("ob_products")
        .upsert(
          {
            slug,
            url,
            name,
            image_url: image,
            last_seen_at: new Date().toISOString(),
          },
          { onConflict: "slug" },
        );
      if (error) {
        dbErrors++;
        console.warn("db fail:", slug, error.message);
      } else {
        inserted++;
      }
    } catch (err) {
      skippedOther++;
      console.warn("product fail:", url, (err as Error).message);
    } finally {
      done++;
      if (done % 100 === 0) {
        console.log(`[products] ${done}/${subset.length} (in=${inserted} 404=${skipped404} other=${skippedOther} db=${dbErrors})`);
      }
    }
  });
  console.log(`[products] final: in=${inserted} 404=${skipped404} other=${skippedOther} db=${dbErrors}`);

  console.log(`[products] done: ${done} processed`);
  const { data } = await supabase.from("ob_products").select("slug");
  return new Set((data ?? []).map((r: { slug: string }) => r.slug));
}

// ---------- blog ingest ----------
async function ingestBlog(knownProductSlugs: Set<string>, limit?: number, offset = 0) {
  console.log("[blog] gathering URLs from sitemaps...");
  const allUrls: string[] = [];
  for (const sm of BLOG_SITEMAPS) {
    const urls = await fetchUrls(sm);
    allUrls.push(...urls);
  }
  console.log(`[blog] ${allUrls.length} URLs in sitemaps`);

  const sliceEnd = limit ? offset + limit : undefined;
  const subset = allUrls.slice(offset, sliceEnd);
  console.log(`[blog] processing slice ${offset}..${offset + subset.length}`);

  type ParsedPost = {
    slug: string;
    url: string;
    title: string;
    description: string | null;
    keywords: string[];
    body_excerpt: string;
    image_url: string | null;
    product_slugs: string[];
  };

  console.log("[blog] fetching and parsing posts...");
  const posts: ParsedPost[] = [];
  let fetched = 0;
  const drops = { fetch: 0, noTitle: 0, shortBody: 0, noSlug: 0, error: 0 };
  await withConcurrency(subset, FETCH_CONCURRENCY, async (url) => {
    try {
      const slug = slugFromUrl(url);
      if (!slug) {
        drops.noSlug++;
        return;
      }
      const res = await politeFetch(url);
      if (!res || !res.ok) {
        drops.fetch++;
        console.warn(`[blog] fetch drop (${res ? res.status : "network"}):`, url);
        return;
      }
      const html = await res.text();
      const title = extractTitle(html);
      if (!title) {
        drops.noTitle++;
        console.warn("[blog] no-title drop:", url);
        return;
      }
      const body = extractBody(html);
      if (body.length < 200) {
        drops.shortBody++;
        console.warn(`[blog] short-body drop (${body.length} chars):`, url);
        return;
      }
      posts.push({
        slug,
        url,
        title,
        description: meta(html, "property", "og:description") ||
                     meta(html, "name", "description"),
        keywords: extractKeywords(html),
        body_excerpt: body,
        image_url: meta(html, "property", "og:image"),
        product_slugs: extractProductSlugs(html, knownProductSlugs),
      });
    } catch (err) {
      drops.error++;
      console.warn("post fail:", url, (err as Error).message);
    } finally {
      fetched++;
      if (fetched % 25 === 0) console.log(`[blog] fetched ${fetched}/${subset.length}`);
    }
  });
  console.log(`[blog] parsed ${posts.length} valid posts`);
  console.log(
    `[blog] drops → fetch:${drops.fetch} noTitle:${drops.noTitle} ` +
    `shortBody:${drops.shortBody} noSlug:${drops.noSlug} error:${drops.error}`,
  );

  console.log("[blog] embedding in batches of " + EMBED_BATCH_SIZE + "...");
  for (let i = 0; i < posts.length; i += EMBED_BATCH_SIZE) {
    const batch = posts.slice(i, i + EMBED_BATCH_SIZE);
    const inputs = batch.map(
      (p) => `${p.title}\n\n${p.description || ""}\n\n${p.body_excerpt}`,
    );
    const embeddings = await embedBatch(inputs);
    const rows = batch.map((p, j) => ({
      slug: p.slug,
      url: p.url,
      title: p.title,
      description: p.description,
      keywords: p.keywords,
      body_excerpt: p.body_excerpt,
      image_url: p.image_url,
      embedding: embeddings[j],
      product_slugs: p.product_slugs,
      last_fetched_at: new Date().toISOString(),
    }));
    const { error } = await supabase
      .from("ritual_posts")
      .upsert(rows, { onConflict: "slug" });
    if (error) console.warn("blog upsert fail:", error.message);
    console.log(`[blog] embedded ${Math.min(i + EMBED_BATCH_SIZE, posts.length)}/${posts.length}`);
  }
  console.log("[blog] done");
}

// ---------- main ----------
async function main() {
  const args = new Set(process.argv.slice(2));
  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  const offsetArg = process.argv.find((a) => a.startsWith("--offset="));
  const limit = limitArg ? parseInt(limitArg.split("=")[1], 10) : undefined;
  const offset = offsetArg ? parseInt(offsetArg.split("=")[1], 10) : 0;
  const runProducts = !args.has("--blog");
  const runBlog = !args.has("--products");

  let knownSlugs = new Set<string>();
  if (runProducts) {
    knownSlugs = await ingestProducts(limit, offset);
  } else {
    const { data } = await supabase.from("ob_products").select("slug");
    knownSlugs = new Set((data ?? []).map((r: { slug: string }) => r.slug));
  }

  if (runBlog) {
    if (!VOYAGE_KEY) {
      console.error("VOYAGE_API_KEY required for blog ingest");
      process.exit(1);
    }
    await ingestBlog(knownSlugs, limit, offset);
  }
  console.log("[done]");
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
