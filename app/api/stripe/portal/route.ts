import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getStripe } from "@/lib/stripe";

/**
 * Create a Stripe Billing Portal Session.
 *
 * Members tap "Manage billing" in their account → we redirect them to
 * the Stripe-hosted portal where they can update payment method,
 * cancel, change plan, view invoices. Saves us building all that UI.
 *
 * The portal is configured in the Stripe dashboard
 * (Billing → Customer portal). Enable: cancel, update payment method,
 * update billing info, view invoices. Disable: switch between products.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!sub?.stripe_customer_id) {
    return NextResponse.json(
      { error: "No Stripe customer for this user" },
      { status: 404 },
    );
  }

  const stripe = getStripe();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://members.originalbotanica.com";

  const portal = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${siteUrl}/dashboard`,
  });

  return NextResponse.json({ url: portal.url });
}
