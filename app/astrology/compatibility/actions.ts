"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { createCompatibilityReading } from "@/lib/compatibility/generate";
import { getSubscriptionStatus } from "@/lib/subscription";
import { getLocale } from "@/lib/i18n/server";

/**
 * Server actions for compatibility readings.
 */

export async function createCompatibilityAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Subscription gate. This action generates a reading (AstrologyAPI +
  // Claude) and is directly invocable, so it must enforce the paywall
  // itself — the page gate alone does not protect it. Mirrors the
  // astrologer and dream chat routes.
  const sub = await getSubscriptionStatus(user.id);
  if (!sub.isActive) {
    return redirect(
      "/astrology/compatibility?error=An%20active%20subscription%20is%20required.",
    );
  }

  const other_name = String(formData.get("other_name") || "").trim();
  const other_birth_date = String(
    formData.get("other_birth_date") || "",
  ).trim();
  const other_birth_time =
    String(formData.get("other_birth_time") || "").trim() || null;
  const other_birth_city = String(
    formData.get("other_birth_city") || "",
  ).trim();
  const relationship_note =
    String(formData.get("relationship_note") || "").trim() || null;

  if (!other_name || !other_birth_date || !other_birth_city) {
    return redirect(
      "/astrology/compatibility?error=Please%20fill%20in%20name,%20birth%20date,%20and%20birth%20city.",
    );
  }

  // Crude minor check (the AI also enforces; this is belt-and-suspenders).
  const otherDate = new Date(other_birth_date + "T00:00:00Z");
  const ageYears =
    (Date.now() - otherDate.getTime()) /
    (365.25 * 24 * 60 * 60 * 1000);
  if (ageYears < 18) {
    return redirect(
      "/astrology/compatibility?error=We%20do%20not%20read%20charts%20for%20anyone%20under%2018.",
    );
  }

  const result = await createCompatibilityReading({
    userId: user.id,
    otherName: other_name,
    otherBirthDate: other_birth_date,
    otherBirthTime: other_birth_time,
    otherBirthCity: other_birth_city,
    relationshipNote: relationship_note,
    locale: await getLocale(),
  });

  if (!result) {
    return redirect(
      "/astrology/compatibility?error=The%20reading%20could%20not%20be%20generated.%20Please%20try%20again.",
    );
  }

  revalidatePath("/astrology/compatibility");
  redirect(`/astrology/compatibility/${result.id}`);
}

export async function deleteCompatibilityAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") || "");
  if (!id) return redirect("/astrology/compatibility");

  await supabase
    .from("compatibility_readings")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/astrology/compatibility");
  redirect("/astrology/compatibility");
}
