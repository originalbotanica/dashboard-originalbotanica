import { createAdminClient } from "@/utils/supabase/admin";
import { sendEmail } from "@/lib/email";
import { giftRecipientEmail, giftBuyerEmail } from "@/lib/gift-emails";
import { termLabel, formatLongDate } from "@/lib/gift";

/**
 * Gift fulfillment — shared by the Stripe webhook (on payment) and the
 * daily delivery cron (for scheduled, future-dated gifts).
 */

type GiftRow = {
  id: string;
  code: string;
  term_months: number;
  purchaser_email: string;
  recipient_name: string | null;
  recipient_email: string | null;
  gift_message: string | null;
  deliver_on: string | null;
  status: string;
  delivered_at: string | null;
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Is this gift due to be delivered now (no schedule, or the date has arrived)? */
function isDue(deliverOn: string | null): boolean {
  return !deliverOn || deliverOn <= todayISO();
}

async function sendRecipientEmail(gift: GiftRow): Promise<boolean> {
  if (!gift.recipient_email) return false;
  const { subject, html } = giftRecipientEmail({
    recipientName: gift.recipient_name,
    buyerName: null, // we key on the buyer's email, not a stored name
    termLabel: termLabel(gift.term_months),
    code: gift.code,
    message: gift.gift_message,
  });
  const res = await sendEmail({
    to: gift.recipient_email,
    subject,
    html,
    replyTo: gift.purchaser_email,
  });
  return res.ok || !!res.skipped; // a skipped (unconfigured) send shouldn't block fulfillment
}

async function sendBuyerEmail(gift: GiftRow): Promise<void> {
  const deliverOnLabel =
    gift.deliver_on && !isDue(gift.deliver_on)
      ? formatLongDate(new Date(gift.deliver_on + "T00:00:00"))
      : null;
  const { subject, html } = giftBuyerEmail({
    recipientName: gift.recipient_name,
    recipientEmail: gift.recipient_email,
    termLabel: termLabel(gift.term_months),
    code: gift.code,
    deliverOnLabel,
  });
  await sendEmail({ to: gift.purchaser_email, subject, html });
}

/**
 * Mark a gift paid and send the confirmation(s). Idempotent: if the gift is
 * already paid/redeemed, it does nothing. Sends the buyer their confirmation,
 * and the recipient their gift now if it isn't scheduled for a future date.
 */
export async function fulfillGiftPaid(
  giftId: string,
  paymentIntentId?: string | null,
): Promise<void> {
  const admin = createAdminClient();
  const { data: gift, error } = await admin
    .from("gift_purchases")
    .select(
      "id, code, term_months, purchaser_email, recipient_name, recipient_email, gift_message, deliver_on, status, delivered_at",
    )
    .eq("id", giftId)
    .maybeSingle();

  if (error || !gift) {
    console.error("fulfillGiftPaid: gift not found", giftId, error);
    return;
  }
  if (gift.status !== "pending") {
    return; // already handled — keep idempotent
  }

  const due = isDue(gift.deliver_on);

  await admin
    .from("gift_purchases")
    .update({
      status: "paid",
      stripe_payment_intent_id: paymentIntentId ?? null,
      delivered_at: due ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", giftId);

  // Buyer always gets a confirmation now.
  await sendBuyerEmail(gift as GiftRow);
  // Recipient gets theirs now if not scheduled for later.
  if (due) await sendRecipientEmail(gift as GiftRow);
}

/**
 * Deliver any paid gifts whose scheduled date has arrived and that haven't
 * been delivered yet. Returns the count delivered. Called by the daily cron.
 */
export async function deliverDueGifts(): Promise<number> {
  const admin = createAdminClient();
  const { data: gifts, error } = await admin
    .from("gift_purchases")
    .select(
      "id, code, term_months, purchaser_email, recipient_name, recipient_email, gift_message, deliver_on, status, delivered_at",
    )
    .eq("status", "paid")
    .is("delivered_at", null)
    .lte("deliver_on", todayISO());

  if (error || !gifts) {
    if (error) console.error("deliverDueGifts query error:", error);
    return 0;
  }

  let delivered = 0;
  for (const gift of gifts as GiftRow[]) {
    const ok = await sendRecipientEmail(gift);
    if (ok) {
      await admin
        .from("gift_purchases")
        .update({ delivered_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq("id", gift.id);
      delivered++;
    }
  }
  return delivered;
}
