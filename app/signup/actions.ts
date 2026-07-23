"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";

/** Only allow same-site relative paths as a post-signup destination. */
function safeNext(raw: string): string | null {
  if (!raw) return null;
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

export async function signupAction(formData: FormData) {
  const supabase = await createClient();
  const hdrs = await headers();
  const origin = hdrs.get("origin") || "";

  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const next = safeNext(String(formData.get("next") || ""));
  const back = next ? `&next=${encodeURIComponent(next)}` : "";

  if (!email || !password) {
    return redirect(`/signup?error=Email%20and%20password%20required${back}`);
  }
  if (password.length < 8) {
    return redirect(
      `/signup?error=Password%20must%20be%20at%20least%208%20characters${back}`,
    );
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next || "/profile-setup")}`,
    },
  });

  if (error) {
    return redirect(`/signup?error=${encodeURIComponent(error.message)}${back}`);
  }

  revalidatePath("/", "layout");
  // Email confirmation is off, so signUp returns a session and the member is
  // signed in immediately. Gift recipients continue straight to redeeming
  // their code; everyone else goes into onboarding. (Profile setup still
  // gates the member area, so gift redeemers are onboarded right after.)
  if (data.session) {
    redirect(next || "/profile-setup");
  }
  redirect(
    "/login?message=Check%20your%20email%20to%20confirm%20your%20account.",
  );
}
