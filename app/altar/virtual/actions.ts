"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import {
  DESIRES,
  DURATIONS,
  getCandleArt,
  desireForCandle,
  candlesLitToday,
  ALTAR_DAILY_LIMIT,
} from "@/lib/altar/altar";
import { containsProhibitedLanguage } from "@/lib/moderation";
import { localToday } from "@/lib/altar/tend";

/** Light a candle: insert into `candles` for the current member. */
export async function lightCandleAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const candle_type = String(formData.get("candle_type") || ""); // desire slug
  const candle_color = String(formData.get("candle_color") || ""); // candle slug
  const intention = String(formData.get("intention") || "").trim();
  const petition = String(formData.get("petition") || "").trim();
  const days = parseInt(String(formData.get("days") || "7"), 10);
  const is_public = formData.get("is_public") === "on";
  // The petition can only be public if the candle is. Default is private.
  const petition_public =
    is_public && formData.get("petition_public") === "on";

  if (!DESIRES.some((d) => d.slug === candle_type)) {
    return redirect("/altar/virtual/new?error=Please%20choose%20an%20intention");
  }
  // The candle must exist and belong to the chosen desire.
  if (
    !getCandleArt(candle_color) ||
    desireForCandle(candle_color)?.slug !== candle_type
  ) {
    return redirect("/altar/virtual/new?error=Please%20choose%20a%20candle");
  }
  if (!intention) {
    return redirect("/altar/virtual/new?error=Please%20add%20a%20dedication");
  }
  if (containsProhibitedLanguage(intention, petition)) {
    return redirect(
      "/altar/virtual/new?error=" +
        encodeURIComponent(
          "Please keep your dedication respectful of this sacred space.",
        ),
    );
  }

  // Gentle daily rate limit to keep the community wall free of spam.
  // "Today" is the member's own calendar day, so the limit resets at
  // their midnight instead of trailing a rolling 24-hour window.
  const memberTz = (await headers()).get("x-vercel-ip-timezone");
  const litToday = await candlesLitToday(user.id, memberTz);
  if (litToday >= ALTAR_DAILY_LIMIT) {
    return redirect(
      "/altar/virtual/new?error=" +
        encodeURIComponent(
          `You've lit ${ALTAR_DAILY_LIMIT} candles today. Please return tomorrow to light another. Your prayers are heard.`,
        ),
    );
  }

  const dur = DURATIONS.some((d) => d.days === days) ? days : 7;
  const expires_at = new Date(Date.now() + dur * 86_400_000).toISOString();

  const { data, error } = await supabase
    .from("candles")
    .insert({
      user_id: user.id,
      candle_type,
      candle_color,
      intention: intention.slice(0, 200),
      petition: petition ? petition.slice(0, 2000) : null,
      is_public,
      petition_public,
      lit_at: new Date().toISOString(),
      expires_at,
    })
    .select("id")
    .single();

  if (error) {
    return redirect(
      `/altar/virtual/new?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/altar/virtual");
  redirect(`/altar/virtual/${data.id}`);
}

/** Tend a burning candle: one tap per candle per local day. Holding the
 *  intention marks the day in the devotion log and brightens the flame.
 *  No redirect: the client plays the tending ritual (dim, flare, embers)
 *  and refreshes in place when both the ritual and this write finish. */
export async function tendCandleAction(
  candleId: string,
): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !candleId) return { ok: false };

  // Must be the member's own, still-burning candle.
  const { data: candle } = await supabase
    .from("candles")
    .select("id, expires_at, archived_at")
    .eq("id", candleId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (
    !candle ||
    candle.archived_at ||
    (candle.expires_at && new Date(candle.expires_at) <= new Date())
  ) {
    return { ok: false };
  }

  const memberTz = (await headers()).get("x-vercel-ip-timezone");
  // Ignore duplicate taps for the same day (primary key candle_id + date).
  const { error } = await supabase.from("candle_tendings").upsert(
    {
      candle_id: candleId,
      user_id: user.id,
      tended_on: localToday(memberTz),
    },
    { onConflict: "candle_id,tended_on", ignoreDuplicates: true },
  );

  revalidatePath(`/altar/virtual/${candleId}`);
  revalidatePath("/altar/virtual");
  return { ok: !error };
}

/** Extinguish (archive) a candle the member owns. */
export async function extinguishCandleAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const id = String(formData.get("id") || "");
  if (id) {
    await supabase
      .from("candles")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id);
  }
  revalidatePath("/altar/virtual");
  redirect("/altar/virtual");
}
