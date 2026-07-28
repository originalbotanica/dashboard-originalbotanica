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
    .from("member_feedback")
    .select("created_at, page, message, user_id")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) { console.log("ERROR:", error.message); return; }
  if (!data || data.length === 0) { console.log("No feedback entries yet."); return; }
  const { data: users } = await admin.auth.admin.listUsers({ perPage: 200 });
  const emailById = new Map((users?.users ?? []).map((u) => [u.id, u.email]));
  for (const f of data) {
    console.log(`\n— ${new Date(f.created_at).toLocaleString()} · ${emailById.get(f.user_id) ?? f.user_id}`);
    console.log(`  page: ${f.page}`);
    console.log(`  ${f.message}`);
  }
  console.log(`\n(${data.length} total)`);
}
main();
