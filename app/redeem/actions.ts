"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { normalizeGiftCode } from "@/lib/gift";
import { redeemCodeForUser } from "@/lib/gift-redeem";

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
    // Gift recipients are usually brand new — welcome them with a
    // gift-flavored signup (it links to sign-in for existing members).
    // Signup auto-redeems the code, so they never re-enter it.
    redirect(`/signup?next=${encodeURIComponent(`/redeem?code=${code}`)}`);
  }

  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0].trim() ||
    hdrs.get("x-real-ip")?.trim() ||
    "unknown";

  const err = await redeemCodeForUser(user.id, code, ip);
  if (err) redirect(errorUrl(err));

  redirect("/dashboard?gift=welcome");
}
