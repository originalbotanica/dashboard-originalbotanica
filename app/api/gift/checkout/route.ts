import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { giftTerm, generateGiftCode, termLabel } from "@/lib/gift";
import { rateLimit, clientIp } from "@/lib/rate-limit";

/**
 * Create a one-time Stripe Checkout Session for a gift membership.
 *
 * A gift is NOT a subscription — it's a single payment for a fixed term. The
 * buyer need not be signed in. We record a pending gift_purchases row with a
 * freshly minted code, then hand off to Stripe Checkout. The webhook marks it
 * paid and sends the emails.
 *
 * Body: {
 *   months: 3 | 6 | 12,
 *   buyerEmail: string,
 *   recipientEmail: string,
 *   recipientName?: string,
 *   message?: string,
 *   deliverOn?: "YYYY-MM-DD"   // optional scheduled delivery
 * }
 */
export async function POST(request: Request) {
  // Anonymous endpoint that writes a DB row and creates a Stripe session per
  // call — throttle per IP to blunt spam. Generous enough for real buyers.
  const limit = rateLimit(`gift-checkout:${clientIp(request)}`, 10, 10 * 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  const body = await request.json().catch(() => ({}));

  const term = giftTerm(Number(body.months));
  if (!term) {
    return NextResponse.json({ error: "Please choose a gift length." }, { status: 400 });
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const buyerEmail = String(body.buyerEmail || "").trim().toLowerCase();
  const recipientEmail = String(body.recipientEmail || "").trim().toLowerCase();
  if (!emailRe.test(buyerEmail)) {
    return NextResponse.json({ error: "Please enter your email." }, { status: 400 });
  }
  if (!emailRe.test(recipientEmail)) {
    return NextResponse.json(
      { error: "Please enter the recipient's email." },
      { status: 400 },
    );
  }

  const recipientName = body.recipientName ? String(body.recipientName).slice(0, 120) : null;
  const message = body.message ? String(body.message).slice(0, 1000) : null;

  let deliverOn: string | null = null;
  if (body.deliverOn && /^\d{4}-\d{2}-\d{2}$/.test(String(body.deliverOn))) {
    deliverOn = String(body.deliverOn);
  }

  // Capture the buyer's user id if they happen to be signed in (optional).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createAdminClient();

  // Insert the pending gift, retrying on the rare code collision.
  let giftId: string | null = null;
  let code = "";
  for (let attempt = 0; attempt < 6 && !giftId; attempt++) {
    code = generateGiftCode();
    const { data, error } = await admin
      .from("gift_purchases")
      .insert({
        code,
        term_months: term.months,
        amount_cents: term.amountCents,
        purchaser_email: buyerEmail,
        purchaser_user_id: user?.id ?? null,
        recipient_name: recipientName,
        recipient_email: recipientEmail,
        gift_message: message,
        deliver_on: deliverOn,
        status: "pending",
      })
      .select("id")
      .single();
    if (!error && data) {
      giftId = data.id;
    } else if (error && !String(error.message).toLowerCase().includes("duplicate")) {
      console.error("gift insert error:", error);
      return NextResponse.json(
        { error: "Could not start the gift. Please try again." },
        { status: 500 },
      );
    }
  }
  if (!giftId) {
    return NextResponse.json(
      { error: "Could not start the gift. Please try again." },
      { status: 500 },
    );
  }

  const stripe = getStripe();
  const siteUrl =
    request.headers.get("origin") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://members.originalbotanica.com";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: buyerEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: term.amountCents,
          product_data: {
            name: `Original Botanica Membership: ${termLabel(term.months)} gift`,
            description: "A prepaid gift membership. One-time payment, no auto-renewal.",
          },
        },
      },
    ],
    metadata: { gift_id: giftId, kind: "gift" },
    payment_intent_data: { metadata: { gift_id: giftId, kind: "gift" } },
    success_url: `${siteUrl}/gift/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/gift?canceled=1`,
  });

  await admin
    .from("gift_purchases")
    .update({
      stripe_checkout_session_id: session.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", giftId);

  return NextResponse.json({ url: session.url });
}
