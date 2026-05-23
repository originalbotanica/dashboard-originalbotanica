import { getSubscriptionStatus } from "./subscription";

/**
 * Tool entitlements.
 *
 * In V1 the rule is simple: an active subscription (including trialing)
 * grants access to ALL tools. There are no tiers.
 *
 * This module exists so that when we DO introduce tiers, comps,
 * grandfathered access, or per-tool entitlements later, every gating
 * call site already goes through one function and we change the policy
 * in one place — not in twenty route handlers.
 */

export type Tool =
  | "tarot"
  | "astrology"
  | "altar"
  | "ancestors"
  | "rituals"
  | "shop_discount";

const ALL_TOOLS: Tool[] = [
  "tarot",
  "astrology",
  "altar",
  "ancestors",
  "rituals",
  "shop_discount",
];

/**
 * Does this user currently have access to a given tool?
 *
 * V1 policy: active sub → yes, everything. Otherwise: no.
 *
 * Future-proofing: when tiers/comps arrive, we'll consult the
 * `entitlements` Supabase table here in addition to subscription state.
 */
export async function hasToolAccess(
  userId: string,
  _tool: Tool,
): Promise<boolean> {
  const sub = await getSubscriptionStatus(userId);
  return sub.isActive;
}

/**
 * Return the full list of tools the user can currently access.
 * Empty array if no active subscription.
 */
export async function listEntitledTools(userId: string): Promise<Tool[]> {
  const sub = await getSubscriptionStatus(userId);
  if (!sub.isActive) return [];
  return [...ALL_TOOLS];
}
