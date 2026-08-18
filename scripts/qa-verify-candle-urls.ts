/** Probe originalbotanica.com for each altar candle's real product page.
 *  Verified 200s only. Parallel pool so it finishes in minutes. */
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

const kebab = (s: string) =>
  s.toLowerCase().replace(/\(.*?\)/g, "").replace(/candle/g, "").replace(/[''.,&|·\/]/g, " ").replace(/[^a-z0-9 -]/g, "").trim().replace(/\s+/g, "-");

async function ok(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(6000) });
    return res.ok;
  } catch { return false; }
}

async function main() {
  const { data: products } = await admin.from("ob_products").select("name, url").limit(3000);
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const candles = DESIRES.flatMap((d) => d.candles);
  const results = new Map<string, string | null>();

  async function probe(c: (typeof candles)[0]) {
    const k = kebab(c.name);
    const cands = [
      `https://originalbotanica.com/${k}-7-day-prepared-candle`,
      `https://originalbotanica.com/${k}-14-day-prepared-candle`,
      `https://originalbotanica.com/${k}-multicolor-7-day-prayer-candle`,
      `https://originalbotanica.com/${k}-7-day-scented-candle`,
      `https://originalbotanica.com/${k}-7-day-candle`,
      `https://originalbotanica.com/${k}-candle`,
    ];
    const bare = norm(c.name).replace(/candle/g, "");
    const pm = products?.find((p) => /candle|vela/i.test(p.name) && !/book|oil|bath|incense|soap|spray/i.test(p.name) && bare.length > 4 && norm(p.name).includes(bare.slice(0, 12)));
    if (pm) cands.unshift(pm.url);
    for (const u of cands) {
      if (await ok(u)) { results.set(c.slug, u); return; }
    }
    results.set(c.slug, null);
  }

  const pool = 10;
  for (let i = 0; i < candles.length; i += pool) {
    await Promise.all(candles.slice(i, i + pool).map(probe));
    console.error(`...${Math.min(i + pool, candles.length)}/${candles.length}`);
  }

  let n = 0;
  for (const c of candles) {
    const u = results.get(c.slug);
    if (u) { n++; console.log(`  "${c.slug}": "${u}",`); }
    else console.log(`  // unverified: ${c.slug} (${c.name})`);
  }
  console.error(`verified ${n}/${candles.length}`);
}
main();
