"use server";

import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Save a member's feedback from the in-app "Share your thoughts" box.
 * Private to the house: written by the member, read via the service
 * role only. Light rate limit so the box can't be spammed.
 */
export async function submitFeedbackAction(
  message: string,
  page: string,
): Promise<{ ok: boolean }> {
  const text = message.trim().slice(0, 4000);
  if (!text) return { ok: false };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const limit = rateLimit(`feedback:${user.id}`, 5, 10 * 60_000);
  if (!limit.ok) return { ok: false };

  const hdrs = await headers();
  const safePage = (page || hdrs.get("referer") || "").slice(0, 200);

  const { error } = await supabase.from("member_feedback").insert({
    user_id: user.id,
    page: safePage,
    message: text,
  });
  return { ok: !error };
}
