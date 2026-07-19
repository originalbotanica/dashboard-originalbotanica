"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { normalizeGiftCode, giftTerm, addMonths } from "@/lib/gift";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Redeem a gift code for the signed-in member.
 *
 * Grants membership by extending profiles.gift_member_until by the gift's term
 * (stacking on top of any time already remaining), and marks the gift redeemed.
 * On any problem it redirects back to /redeem with an ?error message.
 */
export async function redeemGift(formData: FormData) {
  const rawCode = String(formData.get("code") || "");
  const code = normalizeGiftCode(rawCode);

  const errorUrl = (msg: string) =>
    `/redeem?code=${encodeURIComponent(rawCode)}&error=${encodeURIComponent(msg)}`;

  if (!code) redirect(errorUrl("Please enter your gift code."));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Must be signed in to attach the gift to an account.
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/redeem?code=${code}`)}`);
  }

  // Throttle redemption attempts to make code guessing impractical, keyed on
  // both the account and the source IP (so cycling accounts doesn't help).
  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0].trim() ||
    hdrs.get("x-real-ip")?.trim() ||
    "unknown";
  const byUser = rateLimit(`redeem:user:${user.id}`, 10, 10 * 60_000);
  const byIp = rateLimit(`redeem:ip:${ip}`, 20, 10 * 60_000);
  if (!byUser.ok || !byIp.ok) {
    redirect(
      errorUrl("Too many attempts. Please wait a few minutes and try again."),
    );
  }

  const admin = createAdminClient();

  // Durable cross-instance throttle: the in-memory limiter above is
  // per-serverless-instance, so an attacker spread across instances could
  // slip past it. Every attempt is also logged to a small table and counted
  // over a 10-minute window. Best-effort: if the table is missing the
  // redemption still works (the in-memory limiter still applies).
  let overLimit = false;
  try {
    const windowStart = new Date(Date.now() - 10 * 60_000).toISOString();
    await admin.from("redeem_attempts").insert({ user_id: user.id, ip });
    const [byUserDb, byIpDb] = await Promise.all([
      admin
        .from("redeem_attempts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("attempted_at", windowStart),
      admin
        .from("redeem_attempts")
        .select("id", { count: "exact", head: true })
        .eq("ip", ip)
        .gte("attempted_at", windowStart),
    ]);
    overLimit = (byUserDb.count ?? 0) > 10 || (byIpDb.count ?? 0) > 20;
    // Opportunistic cleanup so the log can't grow without bound.
    await admin
      .from("redeem_attempts")
      .delete()
      .lt("attempted_at", new Date(Date.now() - 86_400_000).toISOString());
  } catch {
    /* table not present yet — in-memory limiter still stands */
  }
  if (overLimit) {
    redirect(
      errorUrl("Too many attempts. Please wait a few minutes and try again."),
    );
  }
  const { data: gift } = await admin
    .from("gift_purchases")
    .select("id, term_months, status")
    .eq("code", code)
    .maybeSingle();

  if (!gift) {
    redirect(errorUrl("We couldn't find that code. Please check it and try again."));
  }
  if (gift.status === "redeemed") {
    redirect(errorUrl("This gift has already been redeemed."));
  }
  if (gift.status === "refunded" || gift.status === "canceled") {
    redirect(
      errorUrl("This gift is no longer valid. Please contact us if you think this is a mistake."),
    );
  }
  if (gift.status !== "paid") {
    redirect(
      errorUrl("This gift isn't ready to redeem yet. If you just received it, try again in a moment."),
    );
  }

  const term = giftTerm(gift.term_months);
  if (!term) {
    redirect(errorUrl("This gift has an unexpected length. Please contact us."));
  }

  // Extend from the later of "now" or any existing gift time remaining.
  const { data: prof } = await admin
    .from("profiles")
    .select("gift_member_until")
    .eq("id", user.id)
    .maybeSingle();

  const now = new Date();
  const existing = prof?.gift_member_until ? new Date(prof.gift_member_until) : null;
  const base = existing && existing > now ? existing : now;
  const until = addMonths(base, gift.term_months);

  const { error: profErr } = await admin
    .from("profiles")
    .update({ gift_member_until: until.toISOString(), updated_at: new Date().toISOString() })
    .eq("id", user.id);
  if (profErr) {
    console.error("redeem: profile update failed", profErr);
    redirect(errorUrl("Something went wrong applying your gift. Please try again."));
  }

  await admin
    .from("gift_purchases")
    .update({
      status: "redeemed",
      redeemed_by_user_id: user.id,
      redeemed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", gift.id);

  redirect("/dashboard?gift=welcome");
}
