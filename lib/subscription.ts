import { createClient } from "@/utils/supabase/server";

/**
 * Membership subscription state, read from Supabase
 * (cached locally from Stripe via the webhook handler).
 *
 * Use in Server Components and Server Actions to gate paid features.
 * Pair with `lib/entitlements.ts` for per-tool access checks.
 */

export type SubscriptionStatus = {
  isActive: boolean; // status is 'active' or 'trialing'
  isTrialing: boolean;
  plan: "monthly" | "annual" | null;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: Date | null;
  trialEnd: Date | null;
  rawStatus: string | null; // 'active', 'trialing', 'past_due', 'canceled', etc.
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
  const { data } = await supabase
    .from("subscriptions")
    .select(
      "plan, status, current_period_end, cancel_at_period_end, trial_end",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) return NO_SUBSCRIPTION;

  const isActive = data.status === "active" || data.status === "trialing";
  const isTrialing = data.status === "trialing";

  return {
    isActive,
    isTrialing,
    plan: data.plan as "monthly" | "annual" | null,
    cancelAtPeriodEnd: !!data.cancel_at_period_end,
    currentPeriodEnd: data.current_period_end
      ? new Date(data.current_period_end)
      : null,
    trialEnd: data.trial_end ? new Date(data.trial_end) : null,
    rawStatus: data.status,
  };
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
