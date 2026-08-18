/**
 * Match altar catalog candles to real store products (ob_products) so the
 * "get the real candle" link can go straight to the product page.
 * Prints a slug -> url map for review; nothing is written.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { DESIRES } from "../lib/altar/catalog";

const raw = readFileSync(join(process.cwd(), ".env.local"), "utf8");
for (const line of raw.split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) process.env[m[1]] ??= m[2].trim().replace(/^["']|["']$/g, "");
}
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const norm = (s: string) =>
  s.toLowerCase().replace(/\(.*?\)/g, "").replace(/candle|7 day|7-day|prepared|vela/g, "").replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();

async function main() {
  const { data: products, error } = await admin.from("ob_products").select("name, url").limit(3000);
  if (error) throw error;
  const candles = DESIRES.flatMap((d) => d.candles);
  let hit = 0;
  const lines: string[] = [];
  for (const c of candles) {
    const cn = norm(c.name);
    const exact = products!.filter((p) => norm(p.name) === cn);
    const partial = exact.length ? exact : products!.filter((p) => {
      const pn = norm(p.name);
      return (pn.includes(cn) || cn.includes(pn)) && pn.length > 3 && /candle|vela/i.test(p.name);
    });
    if (partial.length) {
      hit++;
      lines.push(`  "${c.slug}": "${partial[0].url}", // ${partial[0].name}`);
    } else {
      lines.push(`  // NO MATCH: ${c.slug} (${c.name})`);
    }
  }
  console.log(`matched ${hit}/${candles.length}`);
  console.log(lines.join("\n"));
}
main();
