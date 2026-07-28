import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";
const env: Record<string, string> = {};
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^"|"$/g, "");
}
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
async function main() {
  // Insert a 'fruit' row with a nonexistent memorial: if the CHECK constraint
  // still lacks 'fruit' we get a check violation (SQL not run); if we get a
  // foreign-key violation instead, the check passed (SQL was run).
  const { error } = await admin.from("ancestor_offerings").insert({
    ancestor_id: "00000000-0000-0000-0000-000000000000",
    user_id: null,
    offering_type: "fruit",
  });
  console.log(error?.message ?? "unexpectedly inserted");
}
main();
