import Stripe from "stripe";

/**
 * Server-side Stripe client.
 *
 * The membership has a SINGLE product with two prices:
 *   - $24.99 / month  (STRIPE_PRICE_MONTHLY)
 *   - $199.00 / year  (STRIPE_PRICE_ANNUAL, ~33% savings vs monthly)
 *
 * Both prices have a 7-day free trial configured on the price object
 * in the Stripe dashboard.
 *
 * Env vars (set in Vercel):
 *   STRIPE_SECRET_KEY        sk_test_... in dev, sk_live_... in prod
 *   STRIPE_PRICE_MONTHLY     price_... id for the $24.99/mo plan
 *   STRIPE_PRICE_ANNUAL      price_... id for the $199/yr plan
 *   STRIPE_WEBHOOK_SECRET    whsec_... for verifying webhook signatures
 *   NEXT_PUBLIC_SITE_URL     fully-qualified site URL, used for redirects
 */

let cached: Stripe | null = null;

export function getStripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY env var not set");
  cached = new Stripe(key, {
    // Let the library pick the version pinned to the installed SDK.
    // Pinning explicitly causes TS friction across version bumps.
    typescript: true,
  });
  return cached;
}

export const PRICE_MONTHLY = process.env.STRIPE_PRICE_MONTHLY || "";
export const PRICE_ANNUAL = process.env.STRIPE_PRICE_ANNUAL || "";

export type PlanKey = "monthly" | "annual";

export function priceIdFor(plan: PlanKey): string {
  return plan === "annual" ? PRICE_ANNUAL : PRICE_MONTHLY;
}

/**
 * Human-readable plan name for emails, receipts, account UI.
 */
export function planLabel(plan: PlanKey | null): string {
  if (plan === "annual") return "Annual ($199/year)";
  if (plan === "monthly") return "Monthly ($24.99/month)";
  return "No active plan";
}
