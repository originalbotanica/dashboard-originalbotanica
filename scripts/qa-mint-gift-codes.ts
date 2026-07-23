import { readFileSync } from "fs";
import { randomInt } from "crypto";
import { createClient } from "@supabase/supabase-js";

const env: Record<string, string> = {};
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^"|"$/g, "");
}
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
function part(): string {
  return Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
}

async function main() {
  const codes: string[] = [];
  for (let i = 0; i < 10; i++) {
    const code = `OB-GIFT-${part()}-${part()}`;
    const { error } = await admin.from("gift_purchases").insert({
      code,
      term_months: 3,
      amount_cents: 0,
      currency: "usd",
      purchaser_email: "jason@originalbotanica.com",
      gift_message: "Tester access — round 2",
      status: "paid",
      delivered_at: new Date().toISOString(),
    });
    if (error) { console.error(code, error.message); continue; }
    codes.push(code);
  }
  console.log(codes.join("\n"));
}
main();
