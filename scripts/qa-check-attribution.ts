import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";
const env: Record<string, string> = {};
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^"|"$/g, "");
}
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
async function main() {
  const a = await admin.from("profiles").select("attribution, attributed_at").limit(1);
  console.log("profiles.attribution column:", a.error ? "MISSING → " + a.error.message : "EXISTS");
  const b = await admin.from("google_ads_conversions").select("*", { count: "exact", head: true });
  console.log("google_ads_conversions table:", b.error ? "MISSING → " + b.error.message : `EXISTS (${b.count} rows)`);
}
main();
