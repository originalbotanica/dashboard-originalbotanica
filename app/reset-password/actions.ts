"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function requestResetAction(formData: FormData) {
  const supabase = await createClient();
  const hdrs = await headers();
  const origin = hdrs.get("origin") || "";

  const email = String(formData.get("email") || "").trim();
  if (!email) {
    return redirect("/reset-password?error=Email%20required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password/update`,
  });

  if (error) {
    return redirect(
      `/reset-password?error=${encodeURIComponent(error.message)}`,
    );
  }

  return redirect(
    "/reset-password?message=If%20an%20account%20exists%20for%20that%20email%2C%20we%20just%20sent%20a%20reset%20link.",
  );
}

export async function updatePasswordAction(formData: FormData) {
  const supabase = await createClient();

  const password = String(formData.get("password") || "");
  if (password.length < 8) {
    return redirect(
      "/reset-password/update?error=Password%20must%20be%20at%20least%208%20characters",
    );
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return redirect(
      `/reset-password/update?error=${encodeURIComponent(error.message)}`,
    );
  }

  return redirect("/login?message=Password%20updated.%20Sign%20in%20to%20continue.");
}
