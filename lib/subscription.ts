import { createClient } from "@/utils/supabase/server";

/**
 * Membership subscription state, read from Supabase
 * (cached locally from Stripe via the webhook handler).
 *
 * Use in Server Components and Server Actions to gate paid features.
 * Pair with `lib/entitlements.ts` for per-tool access checks.
 *
 * Gift memberships: a redeemed gift sets `profiles.gift_member_until`. A user
 * whose gift date is in the future counts as an active member (plan "gift"),
 * even with no Stripe subscription. A real, active Stripe subscription always
 * takes precedence over a gift.
 */

export type SubscriptionStatus = {
  isActive: boolean; // status is 'active'/'trialing', or an unexpired gift
  isTrialing: boolean;
  plan: "monthly" | "annual" | "gift" | null;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: Date | null;
  trialEnd: Date | null;
  rawStatus: string | null; // 'active', 'trialing', 'past_due', 'canceled', 'gift', etc.
};

const NO_SUBSCRIPTION: SubscriptionStatus = {
  isActive: false,
  isTrialing: false,
  plan: null,
  cancelAtPeriodEnd: false,
  currentPeriodEnd: null,
  trialEnd: null,
  rawStatus: null,
};

/**
 * Look up the current subscription state for a given user.
 * Returns NO_SUBSCRIPTION shape if no row exists.
 */
export async function getSubscriptionStatus(
  userId: string,
): Promise<SubscriptionStatus> {
  const supabase = await createClient();

  const [subRes, profRes] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("plan, status, current_period_end, cancel_at_period_end, trial_end")
      .eq("user_id", userId)
      .maybeSingle(),
    // gift_member_until may not exist if the gifts migration hasn't run yet;
    // a missing column returns an error (not a throw), which we treat as "no gift".
    supabase
      .from("profiles")
      .select("gift_member_until")
      .eq("id", userId)
      .maybeSingle(),
  ]);

  const sub = subRes.data;
  const giftUntilRaw = (profRes.data as { gift_member_until?: string | null } | null)
    ?.gift_member_until;
  const giftUntil = giftUntilRaw ? new Date(giftUntilRaw) : null;
  const giftActive = !!giftUntil && giftUntil.getTime() > Date.now();

  // A live Stripe subscription wins.
  if (sub && (sub.status === "active" || sub.status === "trialing")) {
    const trialEnd = sub.trial_end ? new Date(sub.trial_end) : null;
    // Stripe can briefly report "trialing" after the trial date has passed
    // (webhook lag), and stale rows would otherwise show "trial ends today"
    // forever. Once trial_end is in the past, present it as a plain active
    // membership.
    const stillTrialing =
      sub.status === "trialing" &&
      (!trialEnd || trialEnd.getTime() > Date.now());
    return {
      isActive: true,
      isTrialing: stillTrialing,
      plan: sub.plan as "monthly" | "annual" | null,
      cancelAtPeriodEnd: !!sub.cancel_at_period_end,
      currentPeriodEnd: sub.current_period_end
        ? new Date(sub.current_period_end)
        : null,
      trialEnd,
      rawStatus: stillTrialing ? sub.status : "active",
    };
  }

  // Otherwise an unexpired gift grants access.
  if (giftActive) {
    return {
      isActive: true,
      isTrialing: false,
      plan: "gift",
      cancelAtPeriodEnd: true, // a gift always "ends" — it never renews
      currentPeriodEnd: giftUntil,
      trialEnd: null,
      rawStatus: "gift",
    };
  }

  // An inactive Stripe row (past_due / canceled) — surface its raw status.
  if (sub) {
    return {
      isActive: false,
      isTrialing: false,
      plan: sub.plan as "monthly" | "annual" | null,
      cancelAtPeriodEnd: !!sub.cancel_at_period_end,
      currentPeriodEnd: sub.current_period_end
        ? new Date(sub.current_period_end)
        : null,
      trialEnd: sub.trial_end ? new Date(sub.trial_end) : null,
      rawStatus: sub.status,
    };
  }

  return NO_SUBSCRIPTION;
}

/**
 * Convenience: how many days remain in the trial, rounded down.
 * Returns null if not trialing.
 */
export function trialDaysLeft(s: SubscriptionStatus): number | null {
  if (!s.isTrialing || !s.trialEnd) return null;
  const ms = s.trialEnd.getTime() - Date.now();
  if (ms <= 0) return 0;
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

/**
 * Convenience: how many days remain on an active gift, rounded down.
 * Returns null if the member isn't on a gift.
 */
export function giftDaysLeft(s: SubscriptionStatus): number | null {
  if (s.rawStatus !== "gift" || !s.currentPeriodEnd) return null;
  const ms = s.currentPeriodEnd.getTime() - Date.now();
  if (ms <= 0) return 0;
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}
