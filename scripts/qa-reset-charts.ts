import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";
const env: Record<string, string> = {};
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^"|"$/g, "");
}
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

/**
 * Clear cached natal charts so they regenerate with the daylight-saving
 * fix. Charts are derived data — the source of truth is birth date/time/
 * place on the profile, which is untouched. Each member's chart rebuilds
 * on their next visit to the astrology page.
 */
async function main() {
  const { data: before } = await admin
    .from("profiles")
    .select("id, email")
    .not("chart_data", "is", null);
  console.log(`clearing ${before?.length ?? 0} cached charts...`);

  for (const p of before ?? []) {
    const { error } = await admin
      .from("profiles")
      .update({
        chart_data: null,
        chart_generated_at: null,
        rising_sign: null,
        moon_sign: null,
      })
      .eq("id", p.id);
    console.log(`  ${p.email ?? p.id}: ${error ? "ERR " + error.message : "cleared"}`);
  }
  console.log("\nDone. Charts rebuild on next visit, with the correct UTC offset.");
}
main();
