import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getStripe, priceIdFor, type PlanKey } from "@/lib/stripe";

/**
 * Create a Stripe Checkout Session for the membership.
 *
 * Body: { plan: 'monthly' | 'annual' }
 *
 * Flow:
 *   1. User clicks "Start trial" on the marketing page
 *   2. Frontend posts to this route
 *   3. We look up (or create) the Stripe customer for this user
 *   4. We create a Checkout Session with a 7-day trial on the chosen plan
 *   5. We attach the user's Supabase ID as metadata so the webhook
 *      handler can match the resulting subscription to a profile.
 *   6. We return the Checkout URL; frontend redirects to it.
 *
 * If the user is not signed in, we 401 and let the frontend prompt them
 * to create an account first. (Signup → Checkout is one continuous flow.)
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const plan: PlanKey = body.plan === "annual" ? "annual" : "monthly";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const stripe = getStripe();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://members.originalbotanica.com";

  // Look up the user's existing Stripe customer ID, if any.
  const { data: existingSub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  let customerId = existingSub?.stripe_customer_id ?? undefined;

  // Create a customer if we don't have one yet.
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceIdFor(plan), quantity: 1 }],
    subscription_data: {
      trial_period_days: 7,
      metadata: { supabase_user_id: user.id },
    },
    metadata: { supabase_user_id: user.id, plan },
    success_url: `${siteUrl}/dashboard?welcome=1`,
    cancel_url: `${siteUrl}/?canceled=1`,
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
