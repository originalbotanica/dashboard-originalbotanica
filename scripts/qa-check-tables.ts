import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

const env: Record<string, string> = {};
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^"|"$/g, "");
}
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  for (const table of ["redeem_attempts", "ancestor_offerings"]) {
    const { count, error } = await admin.from(table).select("*", { count: "exact", head: true });
    console.log(table + ":", error ? "MISSING or error → " + error.message : "EXISTS (rows: " + count + ")");
  }
}
main();
