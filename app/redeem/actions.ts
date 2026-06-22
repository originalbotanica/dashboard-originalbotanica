"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { normalizeGiftCode, giftTerm, addMonths } from "@/lib/gift";

/**
 * Redeem a gift code for the signed-in member.
 *
 * Grants membership by extending profiles.gift_member_until by the gift's term
 * (stacking on top of any time already remaining), and marks the gift redeemed.
 * On any problem it redirects back to /redeem with an ?error message.
 */
export async function redeemGift(formData: FormData) {
  const rawCode = String(formData.get("code") || "");
  const code = normalizeGiftCode(rawCode);

  const errorUrl = (msg: string) =>
    `/redeem?code=${encodeURIComponent(rawCode)}&error=${encodeURIComponent(msg)}`;

  if (!code) redirect(errorUrl("Please enter your gift code."));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Must be signed in to attach the gift to an account.
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/redeem?code=${code}`)}`);
  }

  const admin = createAdminClient();
  const { data: gift } = await admin
    .from("gift_purchases")
    .select("id, term_months, status")
    .eq("code", code)
    .maybeSingle();

  if (!gift) {
    redirect(errorUrl("We couldn't find that code. Please check it and try again."));
  }
  if (gift.status === "redeemed") {
    redirect(errorUrl("This gift has already been redeemed."));
  }
  if (gift.status === "refunded" || gift.status === "canceled") {
    redirect(
      errorUrl("This gift is no longer valid. Please contact us if you think this is a mistake."),
    );
  }
  if (gift.status !== "paid") {
    redirect(
      errorUrl("This gift isn't ready to redeem yet. If you just received it, try again in a moment."),
    );
  }

  const term = giftTerm(gift.term_months);
  if (!term) {
    redirect(errorUrl("This gift has an unexpected length. Please contact us."));
  }

  // Extend from the later of "now" or any existing gift time remaining.
  const { data: prof } = await admin
    .from("profiles")
    .select("gift_member_until")
    .eq("id", user.id)
    .maybeSingle();

  const now = new Date();
  const existing = prof?.gift_member_until ? new Date(prof.gift_member_until) : null;
  const base = existing && existing > now ? existing : now;
  const until = addMonths(base, gift.term_months);

  const { error: profErr } = await admin
    .from("profiles")
    .update({ gift_member_until: until.toISOString(), updated_at: new Date().toISOString() })
    .eq("id", user.id);
  if (profErr) {
    console.error("redeem: profile update failed", profErr);
    redirect(errorUrl("Something went wrong applying your gift. Please try again."));
  }

  await admin
    .from("gift_purchases")
    .update({
      status: "redeemed",
      redeemed_by_user_id: user.id,
      redeemed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", gift.id);

  redirect("/dashboard?gift=welcome");
}
