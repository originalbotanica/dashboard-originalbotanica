"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function signupAction(formData: FormData) {
  const supabase = await createClient();
  const hdrs = await headers();
  const origin = hdrs.get("origin") || "";

  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return redirect("/signup?error=Email%20and%20password%20required");
  }
  if (password.length < 8) {
    return redirect("/signup?error=Password%20must%20be%20at%20least%208%20characters");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/profile-setup`,
    },
  });

  if (error) {
    return redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  // Email confirmation is off, so signUp returns a session and the member is
  // signed in immediately — take them straight into onboarding (the auto
  // profiles-row trigger has created their row). If confirmation is ever
  // turned back on, signUp returns no session, so fall back to verify-by-email.
  if (data.session) {
    redirect("/profile-setup");
  }
  redirect(
    "/login?message=Check%20your%20email%20to%20confirm%20your%20account.",
  );
}
