import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";
const env: Record<string, string> = {};
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^"|"$/g, "");
}
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
async function main() {
  const { data, error } = await admin
    .from("profiles")
    .select("email, birth_date, birth_time, birth_place, sun_sign, moon_sign, rising_sign, chart_data")
    .not("chart_data", "is", null)
    .limit(20);
  if (error) { console.log("ERR", error.message); return; }
  console.log("charts stored:", data?.length ?? 0);
  let mocked = 0;
  for (const p of data ?? []) {
    const cd = p.chart_data as { isMocked?: boolean } | null;
    if (cd?.isMocked) mocked++;
    console.log(
      `${p.email ?? "?"} | born ${p.birth_date} ${p.birth_time ?? "(no time)"} ${p.birth_place ?? ""}`,
    );
    console.log(
      `   sun ${p.sun_sign} · moon ${p.moon_sign} · rising ${p.rising_sign} · MOCKED=${cd?.isMocked}`,
    );
  }
  console.log(`\n>>> ${mocked} of ${data?.length ?? 0} charts are MOCK (fabricated) data.`);
}
main();
