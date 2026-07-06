/**
 * Scrub test junk from the live altars.
 *
 * QA found gibberish test entries burning on the community altar and the
 * ancestors altar ("sdasd", "xs", "ssd", "lihk", ...) next to real prayers.
 * This archives candles (archived_at) and unpublishes ancestors (is_public
 * false) whose dedication/name matches the known junk list or is obvious
 * keyboard-mash (single token, no spaces, only consonant runs or <=2 chars).
 *
 * Conservative on purpose: real dedications ("Mamá Carmen", "For my son")
 * contain spaces or vowels-with-structure and never match. Nothing is
 * deleted — candles are archived, ancestors made private.
 *
 * Usage:
 *   npx tsx scripts/scrub-test-data.ts          # dry run
 *   npx tsx scripts/scrub-test-data.ts --apply  # write changes
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

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
    /* rely on shell env */
  }
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

const APPLY = process.argv.includes("--apply");

// Exact junk seen in QA, plus a shape test for keyboard-mash.
const KNOWN_JUNK = new Set([
  "sdasd", "sdsad", "asd", "asdasd", "xs", "ssd", "sd", "lihk", "test", "testing",
  "asdf", "qwerty", "aaa", "zzz", "xxx",
]);

function isJunk(s: string | null | undefined): boolean {
  if (!s) return false;
  const t = s.trim().toLowerCase();
  if (KNOWN_JUNK.has(t)) return true;
  // Single short token, no spaces: junk if <=2 chars or has no vowel at all,
  // or is a consonant-free/vowel-free mash like "sdfgh".
  if (!t.includes(" ") && t.length <= 2) return true;
  if (!t.includes(" ") && t.length <= 6 && !/[aeiouáéíóúü]/i.test(t)) return true;
  return false;
}

async function main() {
  // Candles: check intention (the public line under the flame).
  const { data: candles, error: cErr } = await supabase
    .from("candles")
    .select("id, intention, is_public, lit_at")
    .is("archived_at", null);
  if (cErr) {
    console.error("candles fetch failed:", cErr.message);
    process.exit(1);
  }
  const junkCandles = (candles ?? []).filter((c) => isJunk(c.intention));

  // Ancestors: check the memorial name.
  const { data: ancestors, error: aErr } = await supabase
    .from("ancestors")
    .select("id, name, is_public");
  if (aErr) {
    console.error("ancestors fetch failed:", aErr.message);
    process.exit(1);
  }
  const junkAncestors = (ancestors ?? []).filter((a) => isJunk(a.name));

  console.log(`Candles to archive (${junkCandles.length}):`);
  for (const c of junkCandles)
    console.log(`  - "${c.intention}"  (public: ${c.is_public}, lit ${c.lit_at})`);
  console.log(`\nAncestor memorials to make private (${junkAncestors.length}):`);
  for (const a of junkAncestors) console.log(`  - "${a.name}"`);

  if (!APPLY) {
    console.log("\nDry run only — re-run with --apply to write.");
    return;
  }

  for (const c of junkCandles) {
    const { error } = await supabase
      .from("candles")
      .update({ archived_at: new Date().toISOString(), is_public: false })
      .eq("id", c.id);
    if (error) console.error(`  ! candle ${c.id}: ${error.message}`);
  }
  for (const a of junkAncestors) {
    const { error } = await supabase
      .from("ancestors")
      .update({ is_public: false })
      .eq("id", a.id);
    if (error) console.error(`  ! ancestor ${a.id}: ${error.message}`);
  }
  console.log("\nChanges applied.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
