import { createAdminClient } from "@/utils/supabase/admin";
import { giftTerm, addMonths } from "@/lib/gift";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Core gift-code redemption, shared by the /redeem form and the signup
 * auto-redeem (a gift recipient who creates their account mid-flow has
 * already typed their code — we don't make them do it twice).
 *
 * Applies both throttles (in-memory and the durable redeem_attempts
 * table), validates the code, extends profiles.gift_member_until, and
 * marks the gift redeemed. Never redirects; returns an error message or
 * null on success.
 */
export async function redeemCodeForUser(
  userId: string,
  code: string,
  ip: string,
): Promise<string | null> {
  const byUser = rateLimit(`redeem:user:${userId}`, 10, 10 * 60_000);
  const byIp = rateLimit(`redeem:ip:${ip}`, 20, 10 * 60_000);
  if (!byUser.ok || !byIp.ok) {
    return "Too many attempts. Please wait a few minutes and try again.";
  }

  const admin = createAdminClient();

  // Durable cross-instance throttle (best-effort; see redeem_attempts).
  let overLimit = false;
  try {
    const windowStart = new Date(Date.now() - 10 * 60_000).toISOString();
    await admin.from("redeem_attempts").insert({ user_id: userId, ip });
    const [byUserDb, byIpDb] = await Promise.all([
      admin
        .from("redeem_attempts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("attempted_at", windowStart),
      admin
        .from("redeem_attempts")
        .select("id", { count: "exact", head: true })
        .eq("ip", ip)
        .gte("attempted_at", windowStart),
    ]);
    overLimit = (byUserDb.count ?? 0) > 10 || (byIpDb.count ?? 0) > 20;
    await admin
      .from("redeem_attempts")
      .delete()
      .lt("attempted_at", new Date(Date.now() - 86_400_000).toISOString());
  } catch {
    /* table not present yet — in-memory limiter still stands */
  }
  if (overLimit) {
    return "Too many attempts. Please wait a few minutes and try again.";
  }

  const { data: gift } = await admin
    .from("gift_purchases")
    .select("id, term_months, status")
    .eq("code", code)
    .maybeSingle();

  if (!gift) {
    return "We couldn't find that code. Please check it and try again.";
  }
  if (gift.status === "redeemed") {
    return "This gift has already been redeemed.";
  }
  if (gift.status === "refunded" || gift.status === "canceled") {
    return "This gift is no longer valid. Please contact us if you think this is a mistake.";
  }
  if (gift.status !== "paid") {
    return "This gift isn't ready to redeem yet. If you just received it, try again in a moment.";
  }

  const term = giftTerm(gift.term_months);
  if (!term) {
    return "This gift has an unexpected length. Please contact us.";
  }

  // Extend from the later of "now" or any existing gift time remaining.
  const { data: prof } = await admin
    .from("profiles")
    .select("gift_member_until")
    .eq("id", userId)
    .maybeSingle();

  const now = new Date();
  const existing = prof?.gift_member_until
    ? new Date(prof.gift_member_until)
    : null;
  const base = existing && existing > now ? existing : now;
  const until = addMonths(base, gift.term_months);

  const { error: profErr } = await admin
    .from("profiles")
    .update({
      gift_member_until: until.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
  if (profErr) {
    console.error("redeem: profile update failed", profErr);
    return "Something went wrong applying your gift. Please try again.";
  }

  await admin
    .from("gift_purchases")
    .update({
      status: "redeemed",
      redeemed_by_user_id: userId,
      redeemed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", gift.id);

  return null;
}
