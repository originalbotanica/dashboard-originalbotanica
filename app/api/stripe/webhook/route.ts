import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/utils/supabase/admin";
import { fulfillGiftPaid } from "@/lib/gift-fulfill";

/**
 * Stripe webhook handler.
 *
 * Mirrors Stripe subscription state into our local Postgres so the rest
 * of the app can read membership status without round-tripping to Stripe
 * on every page load.
 *
 * Configure the webhook in the Stripe dashboard with:
 *   URL:      https://members.originalbotanica.com/api/stripe/webhook
 *   Events:   checkout.session.completed
 *             customer.subscription.created
 *             customer.subscription.updated
 *             customer.subscription.deleted
 *             invoice.payment_failed
 */

// Stripe needs the raw request body to verify the webhook signature.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const sig = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return new NextResponse("Webhook not configured", { status: 400 });
  }

  const rawBody = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("Webhook signature verification failed:", msg);
    return new NextResponse(`Webhook signature error: ${msg}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Gift purchase (one-time payment) — fulfill and email.
        const giftId = session.metadata?.gift_id ?? null;
        if (giftId) {
          const paymentIntentId =
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : (session.payment_intent?.id ?? null);
          await fulfillGiftPaid(giftId, paymentIntentId);
          break;
        }

        // Membership subscription checkout.
        const userId = session.metadata?.supabase_user_id ?? null;
        const subscriptionId = session.subscription as string | null;
        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          await upsertSubscription(sub, userId);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await upsertSubscription(sub);
        break;
      }

      case "invoice.payment_failed": {
        // Stripe handles smart retries automatically.
        // TODO Phase 4: send a "your payment failed" Resend email here.
        const invoice = event.data.object as Stripe.Invoice;
        console.log(
          "Invoice payment failed:",
          invoice.id,
          "subscription:",
          (invoice as unknown as { subscription?: string }).subscription,
        );
        break;
      }

      default:
        // Unhandled event types are fine — we ignore them.
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error(`Webhook handler error for ${event.type}:`, err);
    return new NextResponse(`Webhook handler error: ${msg}`, { status: 500 });
  }
}

/**
 * Upsert a row into public.subscriptions from a Stripe Subscription object.
 *
 * One sub per user — keyed on user_id. We resolve user_id from the
 * subscription's metadata (set when we create the Checkout Session) or
 * by falling back to the explicit userId hint passed in from
 * checkout.session.completed.
 */
async function upsertSubscription(
  sub: Stripe.Subscription,
  userIdHint?: string | null,
) {
  const supabase = createAdminClient();

  const userId = userIdHint || sub.metadata?.supabase_user_id || null;
  if (!userId) {
    console.error(
      "upsertSubscription: no user_id found in metadata or hint for sub",
      sub.id,
    );
    return;
  }

  const priceId = sub.items?.data?.[0]?.price?.id ?? null;
  // Plan is derived from which price the customer subscribed to.
  let plan: "monthly" | "annual" | null = null;
  if (priceId && priceId === process.env.STRIPE_PRICE_MONTHLY) plan = "monthly";
  if (priceId && priceId === process.env.STRIPE_PRICE_ANNUAL) plan = "annual";

  const sub_any = sub as unknown as {
    current_period_end?: number;
    trial_end?: number | null;
    pause_collection?: unknown;
  };

  const { error } = await supabase
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,
        stripe_customer_id:
          typeof sub.customer === "string" ? sub.customer : sub.customer?.id,
        stripe_subscription_id: sub.id,
        stripe_price_id: priceId,
        plan,
        status: sub.status,
        trial_end: sub_any.trial_end
          ? new Date(sub_any.trial_end * 1000).toISOString()
          : null,
        current_period_end: sub_any.current_period_end
          ? new Date(sub_any.current_period_end * 1000).toISOString()
          : null,
        cancel_at_period_end: sub.cancel_at_period_end || false,
        paused: !!sub_any.pause_collection,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

  if (error) {
    console.error("subscriptions upsert error:", error);
  }
}
