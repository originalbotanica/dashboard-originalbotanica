/**
 * One-time (idempotent) translation of the ritual library into Spanish.
 *
 * For every published ritual missing a Spanish title, asks Claude to translate
 * title / summary / steps / warnings into natural Latin American Spanish and
 * writes title_es, summary_es, steps_es, warnings_es.
 *
 * Required env (.env.local is loaded automatically):
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY
 *
 * Usage:
 *   npx tsx scripts/translate-rituals.ts --count      # how many remain
 *   npx tsx scripts/translate-rituals.ts --limit 5    # translate 5 (a test)
 *   npx tsx scripts/translate-rituals.ts              # translate all remaining
 *   npx tsx scripts/translate-rituals.ts --force      # re-translate even if done
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

function loadEnv() {
  try {
    const raw = readFileSync(join(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      let v = m[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      if (!(m[1] in process.env)) process.env[m[1]] = v;
    }
  } catch {}
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
if (!SUPABASE_URL || !SERVICE_KEY || !ANTHROPIC_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / ANTHROPIC_API_KEY");
  process.exit(1);
}

const MODEL = "claude-sonnet-4-5";
const CONCURRENCY = 4;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });

const args = process.argv.slice(2);
const COUNT_ONLY = args.includes("--count");
const FORCE = args.includes("--force");
const limitIdx = args.indexOf("--limit");
const LIMIT = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : Infinity;

type Row = {
  id: string;
  title_en: string;
  summary: string | null;
  steps: unknown;
  warnings: string | null;
};

function stripDashes(s: string): string {
  return s.replace(/\s*[—–]\s*/g, ". ").replace(/\s+-\s+/g, ", ");
}

async function translate(row: Row): Promise<{
  title_es: string;
  summary_es: string | null;
  steps_es: string[];
  warnings_es: string | null;
} | null> {
  const steps = Array.isArray(row.steps) ? (row.steps as string[]) : [];
  const payload = {
    title: row.title_en,
    summary: row.summary ?? null,
    steps,
    warnings: row.warnings ?? null,
  };

  const system = `You translate spiritual ritual content for Original Botanica, a family-owned botanica in the Bronx, from English into warm, natural Latin American Spanish.

Rules:
- Preserve meaning, tone, and the warm, reverent, instructional voice.
- Keep proper nouns and tradition terms intact: Orisha names, saint names, despojo, limpieza, Florida Water, etc.
- Preserve EXACTLY any [[Display Name|product-slug]] markup if present (do not translate the slug).
- Do NOT use em-dashes or en-dashes. Use periods or commas.
- Translate every step in the steps array, keeping the same order and count.
- If a field is null, return null for it. Return steps as an array (empty if input is empty).
- Return ONLY a JSON object: {"title": "...", "summary": "..."|null, "steps": ["..."], "warnings": "..."|null}. No commentary, no code fences.`;

  const res = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system,
    messages: [{ role: "user", content: JSON.stringify(payload) }],
  });
  let text = res.content.map((b) => (b.type === "text" ? b.text : "")).join("\n").trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) text = fence[1].trim();
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first < 0 || last < 0) return null;
  let parsed: { title?: string; summary?: string | null; steps?: string[]; warnings?: string | null };
  try {
    parsed = JSON.parse(text.slice(first, last + 1));
  } catch {
    return null;
  }
  if (!parsed.title) return null;
  return {
    title_es: stripDashes(parsed.title),
    summary_es: parsed.summary ? stripDashes(parsed.summary) : null,
    steps_es: Array.isArray(parsed.steps) ? parsed.steps.map(stripDashes) : [],
    warnings_es: parsed.warnings ? stripDashes(parsed.warnings) : null,
  };
}

async function main() {
  let q = supabase
    .from("rituals")
    .select("id, title_en, summary, steps, warnings, title_es")
    .not("published_at", "is", null)
    .order("title_en");
  if (!FORCE) q = q.is("title_es", null);

  const { data, error } = await q;
  if (error) {
    console.error("Fetch error:", error.message);
    process.exit(1);
  }
  const rows = (data || []) as (Row & { title_es: string | null })[];
  console.log(`${rows.length} published ritual(s) ${FORCE ? "to (re)translate" : "missing Spanish"}.`);
  if (COUNT_ONLY) return;

  const todo = rows.slice(0, LIMIT);
  let done = 0;
  let failed = 0;

  for (let i = 0; i < todo.length; i += CONCURRENCY) {
    const batch = todo.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async (row) => {
        try {
          let out = null;
          for (let attempt = 0; attempt < 4 && !out; attempt++) {
            try {
              out = await translate(row);
            } catch (e: unknown) {
              const status = (e as { status?: number })?.status;
              if (status === 429 || status === 529 || status === 503) {
                await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
              } else throw e;
            }
          }
          if (!out) { failed++; console.warn(`  ! parse/translate failed: ${row.title_en}`); return; }
          const { error: upErr } = await supabase
            .from("rituals")
            .update({
              title_es: out.title_es,
              summary_es: out.summary_es,
              steps_es: out.steps_es,
              warnings_es: out.warnings_es,
            })
            .eq("id", row.id);
          if (upErr) { failed++; console.warn(`  ! update failed: ${row.title_en} (${upErr.message})`); return; }
          done++;
          if (done % 10 === 0 || done === todo.length) console.log(`  ${done}/${todo.length} translated`);
        } catch (e) {
          failed++;
          console.warn(`  ! error: ${row.title_en} (${e instanceof Error ? e.message : e})`);
        }
      }),
    );
  }
  console.log(`Done. Translated ${done}, failed ${failed}.`);
}

main();
