/**
 * Build the ritual library from the ingested blog archive.
 *
 * Reads ritual_posts (the 601 blog posts already embedded by rag-ingest.ts),
 * asks Claude to (1) decide whether each post genuinely describes a
 * performable ritual and (2) extract it into a structured entry grounded
 * strictly in the post, then upserts published rows into the rituals table.
 *
 * Nothing is invented: if the post does not lay out real, performable steps,
 * it is skipped rather than fabricated. Every entry links back to the source
 * post, and materials are the real OB products the post already links to.
 *
 * Required env (.env.local is loaded automatically):
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY
 *
 * Usage:
 *   npx tsx scripts/build-ritual-library.ts --limit=15 --dry   # sample, no writes
 *   npx tsx scripts/build-ritual-library.ts                     # full run, publish
 *   npx tsx scripts/build-ritual-library.ts --limit=50          # first 50, publish
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { PURPOSES, PURPOSE_SLUGS, getPurpose } from "../lib/rituals/purposes";
import { cleanText, cleanMaterial } from "../lib/rituals/clean";

// ---------- load .env.local ----------
function loadEnv() {
  try {
    const raw = readFileSync(join(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      let v = m[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (!(m[1] in process.env)) process.env[m[1]] = v;
    }
  } catch {
    // No .env.local; rely on shell env.
  }
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
if (!SUPABASE_URL || !SERVICE_KEY || !ANTHROPIC_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / ANTHROPIC_API_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});
const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });
const MODEL = "claude-sonnet-4-5";

const TRADITIONS = ["lucumi", "espiritismo", "hoodoo", "folk_catholic", "general"] as const;
const DIFFICULTIES = ["simple", "moderate", "advanced"] as const;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ---------- types ----------
type Post = {
  slug: string;
  url: string;
  title: string;
  description: string | null;
  keywords: string[] | null;
  body_excerpt: string;
  image_url: string | null;
  product_slugs: string[] | null;
};

type Extracted = {
  is_ritual: boolean;
  title: string;
  purpose: string;
  tradition: string;
  difficulty: string;
  summary: string;
  steps: string[];
  best_day_of_week: number | null;
  best_moon_phase: string | null;
  warnings: string | null;
};

// ---------- prompt ----------
function buildPrompt(post: Post): { system: string; user: string } {
  const purposeList = PURPOSES.map((p) => `- ${p.slug}: ${p.label} (${p.blurb})`).join("\n");

  const system = `You are the archivist for Original Botanica, a family-owned spiritual house in the Bronx since 1959. You are turning the house's blog posts into a curated ritual library.

YOUR JOB
Read one blog post. Decide if it genuinely teaches a performable ritual, spell, or working (with real, followable steps). If it does, extract it into structured form. If it is only an article, history, product description, horoscope, listicle, or general explanation with no concrete performable steps, mark is_ritual false.

ABSOLUTE RULES
- Extract only what is in the post. Never invent steps, materials, days, or claims the post does not make. If the steps are not actually spelled out in the post, set is_ritual to false.
- Faithful to the source. This is the house's real practice; do not embellish or modernize it.
- Voice: grounded, warm, plain. Short sentences. No em-dashes or en-dashes anywhere. No exclamation points. No emoji. Spanish words where the post uses them.
- This is reflective spiritual practice, never a guarantee. Do not promise outcomes.

PURPOSE (choose exactly one slug that best fits):
${purposeList}

TRADITION (choose one): lucumi, espiritismo, hoodoo, folk_catholic, general
DIFFICULTY (choose one): simple, moderate, advanced

OUTPUT
Return ONE JSON object, no prose, no code fences:
{
  "is_ritual": true|false,
  "title": "<short ritual title in the house's words, not the blog headline if the headline is clickbait>",
  "purpose": "<one slug from the list>",
  "tradition": "<one value>",
  "difficulty": "<one value>",
  "summary": "<1-2 sentences: what this ritual is for and when to use it>",
  "steps": ["<step 1>", "<step 2>", "..."],
  "best_day_of_week": <0-6 where 0=Sunday, or null if the post does not specify>,
  "best_moon_phase": "<new|waxing|full|waning or null if not specified>",
  "warnings": "<any caution the post gives, or null>"
}

If is_ritual is false, still return the object with is_ritual false and the other fields empty or null.`;

  const user = `BLOG POST
Title: ${post.title}
${post.description ? `Description: ${post.description}\n` : ""}URL: ${post.url}

BODY:
${post.body_excerpt.slice(0, 7000)}`;

  return { system, user };
}

function parseJSON(raw: string): Extracted | null {
  let t = raw.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) t = fence[1].trim();
  const a = t.indexOf("{");
  const b = t.lastIndexOf("}");
  if (a < 0 || b < 0) return null;
  try {
    return JSON.parse(t.slice(a, b + 1));
  } catch {
    return null;
  }
}

function stripDashes(s: string): string {
  return s
    ? s.replace(/[ \t]+[—–][ \t]+/g, ". ").replace(/[—–]/g, ", ")
    : s;
}

async function extract(post: Post): Promise<Extracted | null> {
  const { system, user } = buildPrompt(post);
  const maxAttempts = 4;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 1200,
        system,
        messages: [{ role: "user", content: user }],
      });
      const text = res.content.map((b) => (b.type === "text" ? b.text : "")).join("\n");
      return parseJSON(text);
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      if ((status === 429 || status === 529 || status === 500) && attempt < maxAttempts) {
        const wait = 1500 * attempt;
        console.log(`  rate-limited (${status}), waiting ${wait}ms`);
        await sleep(wait);
        continue;
      }
      console.warn(`  extract error for ${post.slug}:`, (err as Error).message);
      return null;
    }
  }
  return null;
}

// ---------- material lookup ----------
async function materialsFor(productSlugs: string[]): Promise<Array<{ name: string; url: string; slug: string }>> {
  if (!productSlugs || productSlugs.length === 0) return [];
  const { data } = await supabase
    .from("ob_products")
    .select("slug, url, name")
    .in("slug", productSlugs);
  // Product names arrive from the store feed and can carry HTML entities
  // or markdown; clean before storing so the library stays presentable.
  return (data ?? []).map((p: { slug: string; url: string; name: string }) =>
    cleanMaterial({ name: p.name, url: p.url, slug: p.slug }),
  ) as Array<{ name: string; url: string; slug: string }>;
}

function validExtract(e: Extracted): boolean {
  return (
    !!e &&
    e.is_ritual === true &&
    typeof e.title === "string" && e.title.trim().length > 0 &&
    PURPOSE_SLUGS.includes(e.purpose) &&
    (TRADITIONS as readonly string[]).includes(e.tradition) &&
    (DIFFICULTIES as readonly string[]).includes(e.difficulty) &&
    Array.isArray(e.steps) && e.steps.length >= 2
  );
}

// ---------- main ----------
async function main() {
  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? parseInt(limitArg.split("=")[1], 10) : undefined;
  const dry = process.argv.includes("--dry");
  // Incremental: only extract posts that do not already have a library entry.
  const newOnly = process.argv.includes("--new");

  console.log(`Loading ritual_posts${limit ? ` (limit ${limit})` : ""}...`);
  let q = supabase
    .from("ritual_posts")
    .select("slug, url, title, description, keywords, body_excerpt, image_url, product_slugs")
    .order("slug");
  if (limit) q = q.limit(limit);
  const { data: postsRaw, error } = await q;
  if (error) {
    console.error("Failed to read ritual_posts:", error.message);
    process.exit(1);
  }

  let posts = (postsRaw ?? []) as Post[];
  if (newOnly) {
    const { data: existing } = await supabase.from("rituals").select("slug");
    const have = new Set((existing ?? []).map((r: { slug: string }) => r.slug));
    const before = posts.length;
    posts = posts.filter((p) => !have.has(p.slug));
    console.log(`Incremental: ${posts.length} new of ${before} posts.`);
  }
  console.log(`Got ${posts.length} posts.\n`);

  let rituals = 0;
  let skipped = 0;
  let failed = 0;

  for (const post of posts) {
    const e = await extract(post);
    if (!e) {
      failed++;
      console.log(`FAIL   ${post.slug}`);
      await sleep(300);
      continue;
    }
    if (!validExtract(e)) {
      skipped++;
      console.log(`skip   ${post.slug} (not a ritual)`);
      await sleep(300);
      continue;
    }

    const purpose = getPurpose(e.purpose)!;
    const materials = await materialsFor(post.product_slugs ?? []);
    const steps = e.steps.map((s) => cleanText(stripDashes(s)));
    const row = {
      slug: post.slug,
      title_en: cleanText(stripDashes(e.title)),
      body_en: steps.join("\n\n"),
      summary: cleanText(stripDashes(e.summary || "")),
      steps,
      purpose: e.purpose,
      intention: purpose.intention,
      tradition: e.tradition,
      difficulty: e.difficulty,
      duration_minutes: null as number | null,
      best_day_of_week: typeof e.best_day_of_week === "number" ? e.best_day_of_week : null,
      best_moon_phase: e.best_moon_phase || null,
      materials,
      keywords: post.keywords ?? [],
      warnings: e.warnings ? cleanText(stripDashes(e.warnings)) : null,
      image_url: post.image_url,
      source_url: post.url,
      source_type: "blog",
      source_credit: "Original Botanica blog",
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (dry) {
      console.log(`\n--- ${post.slug} -> ${e.purpose} / ${e.tradition} / ${e.difficulty}`);
      console.log(`Title: ${row.title_en}`);
      console.log(`Summary: ${row.summary}`);
      console.log(`Steps (${steps.length}): ${steps.slice(0, 3).map((s) => s.slice(0, 70)).join(" | ")}${steps.length > 3 ? " ..." : ""}`);
      console.log(`Materials: ${materials.map((m) => m.name).join(", ") || "(none linked)"}`);
      rituals++;
    } else {
      const { error: upErr } = await supabase
        .from("rituals")
        .upsert(row, { onConflict: "slug" });
      if (upErr) {
        failed++;
        console.log(`DBFAIL ${post.slug}: ${upErr.message}`);
      } else {
        rituals++;
        console.log(`saved  ${post.slug} -> ${e.purpose}`);
      }
    }
    await sleep(400);
  }

  console.log(`\nDone. rituals=${rituals} skipped(non-ritual)=${skipped} failed=${failed}${dry ? "  [DRY RUN, nothing written]" : ""}`);
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
