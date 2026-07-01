/**
 * One-time: apply Jason's reviewed product URLs to ritual materials.
 *
 * Reads the CSV (product, product_url_PASTE_HERE). For each material across all
 * rituals whose name matches a product that has a URL, set that URL so it links
 * to originalbotanica.com. Blank URL = generic item we do not sell, leave as
 * plain text (untouched).
 *
 *   npx tsx scripts/apply-material-links.ts "<csv path>" --dry   # preview
 *   npx tsx scripts/apply-material-links.ts "<csv path>"          # apply
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
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      if (!(m[1] in process.env)) process.env[m[1]] = v;
    }
  } catch {}
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const csvPath = args.find((a) => !a.startsWith("--"));
if (!csvPath) {
  console.error("Pass the CSV path as the first argument.");
  process.exit(1);
}

// Minimal CSV parser (handles quoted fields with commas).
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let field = "", row: string[] = [], inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQ = false;
      else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c === "\r") { /* skip */ }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  const header = rows.shift()!;
  return rows
    .filter((r) => r.some((c) => c.trim()))
    .map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""])));
}

type Material = { name: string; url?: string | null; slug?: string | null };

async function main() {
  // A couple of CSV labels were annotated/generalized during the audit, so map
  // them to the exact material name they refer to.
  const ALIAS: Record<string, string> = {
    "sage (white sage leaves)": "sage",
    "Open Road incense": "Open Roads Resin Incense by Soul Sticks",
  };

  const csv = parseCsv(readFileSync(csvPath, "utf8"));
  const linkFor = new Map<string, string>(); // exact material name -> url
  for (const r of csv) {
    const raw = (r["product"] || "").trim();
    const name = ALIAS[raw] ?? raw;
    const url = (r["product_url_PASTE_HERE"] || "").trim();
    if (name && url) linkFor.set(name, url);
  }
  console.log(`${linkFor.size} products with a URL to apply.`);

  const { data, error } = await supabase.from("rituals").select("id, slug, materials");
  if (error) { console.error("Fetch error:", error.message); process.exit(1); }
  const rituals = (data ?? []) as { id: string; slug: string; materials: Material[] }[];

  let ritualsChanged = 0;
  let linksSet = 0;
  const matchedNames = new Set<string>();

  for (const r of rituals) {
    const mats = Array.isArray(r.materials) ? r.materials : [];
    let changed = false;
    const next = mats.map((m) => {
      const url = linkFor.get((m.name || "").trim());
      if (url && !m.url) {
        matchedNames.add((m.name || "").trim());
        linksSet++;
        changed = true;
        return { ...m, url };
      }
      if (url) matchedNames.add((m.name || "").trim());
      return m;
    });
    if (changed) {
      ritualsChanged++;
      if (!DRY) {
        const { error: upErr } = await supabase.from("rituals").update({ materials: next }).eq("id", r.id);
        if (upErr) console.warn(`  ! update failed ${r.slug}: ${upErr.message}`);
      }
    }
  }

  const unmatched = [...linkFor.keys()].filter((n) => !matchedNames.has(n));
  console.log(`${DRY ? "[DRY] would set" : "Set"} ${linksSet} material link(s) across ${ritualsChanged} ritual(s).`);
  console.log(`Products matched to at least one material: ${matchedNames.size}/${linkFor.size}`);
  if (unmatched.length) {
    console.log(`Products with NO matching material (name mismatch, check these ${unmatched.length}):`);
    for (const n of unmatched) console.log("   -", n);
  }
}

main();
