/**
 * Clear all cached written chart readings so they regenerate in the
 * revised astrologer voice (Aug 5 prompt change). The chart MATH
 * (profiles.chart_data) is untouched; only the prose is cleared.
 * Readings regenerate automatically when a member next visits.
 *
 * Usage: npx tsx scripts/qa-clear-chart-readings.ts
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const raw = readFileSync(join(process.cwd(), ".env.local"), "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
      v = v.slice(1, -1);
    process.env[m[1]] ??= v;
  }
}
loadEnv();

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function main() {
  const { count: before } = await admin
    .from("chart_readings")
    .select("*", { count: "exact", head: true });
  const { error } = await admin
    .from("chart_readings")
    .delete()
    .not("user_id", "is", null);
  if (error) {
    console.error("delete failed:", error.message);
    process.exit(1);
  }
  const { count: after } = await admin
    .from("chart_readings")
    .select("*", { count: "exact", head: true });
  console.log(`chart_readings cleared: ${before ?? "?"} -> ${after ?? "?"}`);
}

main();
