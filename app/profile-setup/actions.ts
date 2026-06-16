"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

/**
 * Save the profile after first signup.
 *
 * The auto-profile trigger we installed in Supabase already created the
 * profiles row on signup, so this is an UPDATE (we use upsert anyway
 * in case of an edge race where the trigger hasn't fired yet).
 *
 * Birth chart fields are optional; the Astrology tool will prompt for
 * them on first visit if missing.
 */
export async function saveProfileAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/login");
  }

  const first_name = String(formData.get("first_name") || "").trim();
  const locale = String(formData.get("locale") || "en");
  const birth_date_raw = String(formData.get("birth_date") || "").trim();
  const birth_time_raw = String(formData.get("birth_time") || "").trim();
  const birth_place_raw = String(formData.get("birth_place") || "").trim();

  if (!first_name) {
    return redirect("/profile-setup?error=First%20name%20is%20required");
  }
  if (locale !== "en" && locale !== "es") {
    return redirect("/profile-setup?error=Invalid%20language");
  }

  const updates: Record<string, string | null> = {
    first_name,
    locale,
    birth_date: birth_date_raw || null,
    birth_time: birth_time_raw || null,
    birth_place: birth_place_raw || null,
  };

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) {
    return redirect(
      `/profile-setup?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/dashboard");
  // Next step of onboarding: start the free trial (Stripe checkout).
  // Already-subscribed members are bounced straight to the dashboard there.
  redirect("/subscribe");
}
