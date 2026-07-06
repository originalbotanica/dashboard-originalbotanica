/**
 * Dedupe the ritual library and fix language mixing.
 *
 * Two problems from the blog ingest, both visible on the public shelves:
 *   1. The same working was ingested more than once (a text post and a
 *      YouTube post, or two blog posts covering the same ritual), so the
 *      shelf shows "Money Drawing Bath" twice and "Money Tree Ritual"
 *      three times.
 *   2. Spanish-language posts became their own rows with a Spanish title
 *      stored in title_en ("Baño Para Atraer Dinero"), so Spanish entries
 *      appear in the English listing instead of living on the English
 *      row's *_es fields.
 *
 * What this script does, per purpose shelf:
 *   - Groups candidate duplicates by normalized title, then asks Claude to
 *     confirm which entries genuinely describe the same working (grounded
 *     in title + summary; near-identical variants count, different
 *     workings that share a name do not).
 *   - Within a confirmed group, keeps the richest row (prefers a video
 *     source, then the longer summary/steps) and unpublishes the rest
 *     (published_at = null — nothing is deleted, easy to restore).
 *   - Detects rows whose title_en is actually Spanish. If a confirmed
 *     English twin exists, folds title/summary into the twin's empty
 *     *_es fields and unpublishes the Spanish row. If no twin exists, the
 *     row is left published and reported so translate-rituals.ts (or a
 *     manual pass) can give it a proper English title.
 *
 * Nothing is written unless --apply is passed. Always run the dry run
 * first and read the report.
 *
 * Required env (.env.local is loaded automatically):
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY
 *
 * Usage:
 *   npx tsx scripts/dedupe-rituals.ts                 # dry run, full report
 *   npx tsx scripts/dedupe-rituals.ts --purpose=money-drawing   # one shelf
 *   npx tsx scripts/dedupe-rituals.ts --apply         # write the changes
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

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
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / ANTHROPIC_API_KEY",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});
const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });
const MODEL = "claude-sonnet-4-5";

const APPLY = process.argv.includes("--apply");
const PURPOSE_ARG = process.argv
  .find((a) => a.startsWith("--purpose="))
  ?.split("=")[1];

type Row = {
  id: string;
  slug: string;
  title_en: string;
  title_es: string | null;
  summary: string | null;
  summary_es: string | null;
  steps: string[] | null;
  purpose: string | null;
  source_type: string | null;
  source_url: string | null;
};

// ---------- helpers ----------

function normTitle(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Token-set Jaccard similarity of two titles. */
function similarity(a: string, b: string): number {
  const ta = new Set(normTitle(a).split(" "));
  const tb = new Set(normTitle(b).split(" "));
  const inter = [...ta].filter((t) => tb.has(t)).length;
  const union = new Set([...ta, ...tb]).size;
  return union === 0 ? 0 : inter / union;
}

/** Cheap Spanish detector for titles; Claude re-checks anything flagged. */
function looksSpanish(title: string): boolean {
  if (/[áéíóúñü¿¡]/i.test(title)) return true;
  const words = normTitle(title).split(" ");
  const es = new Set([
    "para", "con", "del", "de", "la", "el", "los", "las", "una", "un",
    "atraer", "dinero", "suerte", "abundancia", "rituales",
    "bano", "limpieza", "proteccion", "amor", "vela", "velas",
  ]);
  const hits = words.filter((w) => es.has(w)).length;
  return hits >= 2;
}

/** Richness score: prefer video, then more content. */
function richness(r: Row): number {
  let score = 0;
  if (
    (r.source_type || "").toLowerCase().includes("video") ||
    (r.source_url || "").includes("youtu")
  )
    score += 100;
  score += Math.min((r.summary || "").length / 10, 40);
  score += Math.min((r.steps?.length || 0) * 5, 40);
  if (r.title_es) score += 10;
  return score;
}

async function askClaude(prompt: string): Promise<string> {
  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
  });
  const block = msg.content[0];
  return block.type === "text" ? block.text : "";
}

/**
 * Given a cluster of similar entries, ask Claude which are the same working.
 * Returns groups of ids that are duplicates of each other.
 */
async function confirmDuplicates(cluster: Row[]): Promise<string[][]> {
  const listing = cluster
    .map(
      (r, i) =>
        `${i + 1}. id=${r.id}\n   title: ${r.title_en}\n   summary: ${(r.summary || "").slice(0, 300)}`,
    )
    .join("\n");
  const raw = await askClaude(
    `These entries come from one shelf of a ritual library and have similar titles. ` +
      `Group the ones that describe THE SAME working (same method, same purpose — a video version and a text version of one ritual count as the same; ` +
      `two genuinely different rituals that share a name do not). ` +
      `Reply with JSON only: an array of arrays of ids, one inner array per duplicate group of 2+ entries. ` +
      `Entries that are unique should not appear. Example: [["id1","id2"],["id3","id4","id5"]]\n\n${listing}`,
  );
  try {
    const m = raw.match(/\[[\s\S]*\]/);
    return m ? (JSON.parse(m[0]) as string[][]) : [];
  } catch {
    return [];
  }
}

// ---------- main ----------

async function main() {
  let q = supabase
    .from("rituals")
    .select(
      "id, slug, title_en, title_es, summary, summary_es, steps, purpose, source_type, source_url",
    )
    .not("published_at", "is", null)
    .order("purpose")
    .order("title_en");
  if (PURPOSE_ARG) q = q.eq("purpose", PURPOSE_ARG);
  const { data, error } = await q;
  if (error) {
    console.error("Fetch failed:", error.message);
    process.exit(1);
  }
  const rows = (data ?? []) as Row[];
  console.log(
    `${rows.length} published rituals${PURPOSE_ARG ? ` in ${PURPOSE_ARG}` : ""}.\n`,
  );

  const byPurpose = new Map<string, Row[]>();
  for (const r of rows) {
    const p = r.purpose || "(none)";
    byPurpose.set(p, [...(byPurpose.get(p) || []), r]);
  }

  let unpublishCount = 0;
  let mergeCount = 0;
  const spanishOrphans: Row[] = [];

  for (const [purpose, shelf] of byPurpose) {
    // 1. Cluster by title similarity within the shelf.
    const clusters: Row[][] = [];
    const assigned = new Set<string>();
    for (const r of shelf) {
      if (assigned.has(r.id)) continue;
      const cluster = [r];
      assigned.add(r.id);
      for (const other of shelf) {
        if (assigned.has(other.id)) continue;
        if (similarity(r.title_en, other.title_en) >= 0.6) {
          cluster.push(other);
          assigned.add(other.id);
        }
      }
      clusters.push(cluster);
    }

    const multi = clusters.filter((c) => c.length > 1);
    if (multi.length)
      console.log(`— ${purpose}: ${multi.length} duplicate cluster(s)`);

    // 2. Confirm duplicates with Claude, keep the richest, unpublish the rest.
    for (const cluster of multi) {
      const groups = await confirmDuplicates(cluster);
      for (const group of groups) {
        const members = cluster.filter((r) => group.includes(r.id));
        if (members.length < 2) continue;
        members.sort((a, b) => richness(b) - richness(a));
        const keep = members[0];
        const drop = members.slice(1);
        console.log(`   keep   ${keep.title_en}  (${keep.slug})`);
        for (const d of drop) {
          console.log(`   retire ${d.title_en}  (${d.slug})`);
          unpublishCount++;
          if (APPLY) {
            const { error: e } = await supabase
              .from("rituals")
              .update({ published_at: null })
              .eq("id", d.id);
            if (e) console.error(`   ! failed: ${e.message}`);
          }
        }
      }
    }

    // 3. Spanish-titled rows: fold into an English twin when one exists.
    for (const r of shelf) {
      if (!looksSpanish(r.title_en)) continue;
      // Best English candidates on the same shelf (skip other Spanish rows).
      const candidates = shelf
        .filter((o) => o.id !== r.id && !looksSpanish(o.title_en))
        .map((o) => ({
          o,
          sim: similarity(r.summary || r.title_en, o.summary || o.title_en),
        }))
        .sort((a, b) => b.sim - a.sim)
        .slice(0, 3);
      if (!candidates.length) {
        spanishOrphans.push(r);
        continue;
      }
      const listing = candidates
        .map(
          (c, i) =>
            `${i + 1}. id=${c.o.id} title: ${c.o.title_en}\n   summary: ${(c.o.summary || "").slice(0, 300)}`,
        )
        .join("\n");
      const raw = await askClaude(
        `A ritual library entry is in Spanish:\n  title: ${r.title_en}\n  summary: ${(r.summary || "").slice(0, 300)}\n\n` +
          `Is it the same working as one of these English entries? Reply with JSON only: {"match": "<id>"} or {"match": null}.\n\n${listing}`,
      );
      let matchId: string | null = null;
      try {
        matchId =
          (JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] || "{}") as {
            match?: string | null;
          }).match ?? null;
      } catch {
        /* no match */
      }
      const twin = candidates.find((c) => c.o.id === matchId)?.o;
      if (!twin) {
        spanishOrphans.push(r);
        continue;
      }
      console.log(
        `   fold   "${r.title_en}" → es fields of "${twin.title_en}"`,
      );
      mergeCount++;
      if (APPLY) {
        const updates: Record<string, unknown> = {};
        if (!twin.title_es) updates.title_es = r.title_en;
        if (!twin.summary_es && r.summary) updates.summary_es = r.summary;
        if (Object.keys(updates).length) {
          const { error: e1 } = await supabase
            .from("rituals")
            .update(updates)
            .eq("id", twin.id);
          if (e1) console.error(`   ! fold failed: ${e1.message}`);
        }
        const { error: e2 } = await supabase
          .from("rituals")
          .update({ published_at: null })
          .eq("id", r.id);
        if (e2) console.error(`   ! retire failed: ${e2.message}`);
      }
    }
  }

  console.log(
    `\nSummary: retire ${unpublishCount} duplicate(s), fold ${mergeCount} Spanish row(s) into English twins.`,
  );
  if (spanishOrphans.length) {
    console.log(
      `\n${spanishOrphans.length} Spanish-titled entries have no English twin (left published; give them English titles via a translate pass):`,
    );
    for (const r of spanishOrphans) console.log(`   - ${r.title_en}  (${r.slug})`);
  }
  console.log(
    APPLY ? "\nChanges applied." : "\nDry run only — re-run with --apply to write.",
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
