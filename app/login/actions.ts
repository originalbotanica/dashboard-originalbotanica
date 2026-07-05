"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function loginAction(formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  // Only allow internal, single-slash paths. A raw value could be an
  // absolute URL ("https://evil.com") or protocol-relative ("//evil.com"),
  // turning the trusted login page into an open redirect for phishing.
  const rawRedirect = String(formData.get("redirectTo") || "/dashboard");
  const redirectTo =
    rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
      ? rawRedirect
      : "/dashboard";

  if (!email || !password) {
    return redirect("/login?error=Email%20and%20password%20required");
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");

  // If they're going to /dashboard but their profile is incomplete
  // (no first_name), send them through profile-setup first. This
  // catches users who confirmed via email but never filled in their
  // first name (which can happen if Supabase stripped the redirect path).
  if (redirectTo === "/dashboard") {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", user.id)
        .maybeSingle();
      if (!profile?.first_name) {
        redirect("/profile-setup");
      }
    }
  }

  redirect(redirectTo);
}
