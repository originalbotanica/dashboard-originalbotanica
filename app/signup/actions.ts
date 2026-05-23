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

  const { error } = await supabase.auth.signUp({
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
  // The signup trigger we installed in Supabase auto-creates a `profiles`
  // row. After they confirm their email, the callback route routes them
  // to /profile-setup to fill in name + (optional) birth chart details.
  redirect(
    "/login?message=Check%20your%20email%20to%20confirm%20your%20account.",
  );
}
