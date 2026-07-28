"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers, cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { normalizeGiftCode } from "@/lib/gift";
import { redeemCodeForUser } from "@/lib/gift-redeem";
import {
  ATTRIBUTION_COOKIE,
  decodeAttribution,
} from "@/lib/ads/attribution";

/** Only allow same-site relative paths as a post-signup destination. */
function safeNext(raw: string): string | null {
  if (!raw) return null;
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

/** If the post-signup destination is the redeem page with a code, pull
 *  the code out so we can redeem it for the new account automatically. */
function giftCodeFromNext(next: string | null): string | null {
  if (!next || !next.startsWith("/redeem")) return null;
  try {
    const url = new URL(next, "https://x.invalid");
    return normalizeGiftCode(url.searchParams.get("code") || "");
  } catch {
    return null;
  }
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

  // Stamp the ad click that brought them here onto the profile, so the
  // conversion can be credited when their first payment lands weeks later.
  if (data.user) {
    try {
      const jar = await cookies();
      const attr = decodeAttribution(jar.get(ATTRIBUTION_COOKIE)?.value);
      if (attr) {
        // The Meta pixel's own browser cookie improves match quality.
        const fbp = jar.get("_fbp")?.value;
        await createAdminClient()
          .from("profiles")
          .update({
            attribution: fbp ? { ...attr, fbp } : attr,
            attributed_at: new Date().toISOString(),
          })
          .eq("id", data.user.id);
      }
    } catch {
      /* attribution is best-effort — never block a signup over it */
    }
  }

  revalidatePath("/", "layout");
  // Email confirmation is off, so signUp returns a session and the member is
  // signed in immediately. A gift recipient arriving from the redeem flow
  // already typed their code, so redeem it for them right here — account
  // creation IS the claim. Then straight into onboarding. If the code turns
  // out to be bad, land them back on the redeem page with the reason.
  if (data.session) {
    const giftCode = giftCodeFromNext(next);
    if (giftCode && data.session.user) {
      const ip =
        hdrs.get("x-forwarded-for")?.split(",")[0].trim() ||
        hdrs.get("x-real-ip")?.trim() ||
        "unknown";
      const err = await redeemCodeForUser(data.session.user.id, giftCode, ip);
      if (err) {
        redirect(
          `/redeem?code=${encodeURIComponent(giftCode)}&error=${encodeURIComponent(err)}`,
        );
      }
      redirect("/profile-setup");
    }
    redirect(next || "/profile-setup");
  }
  redirect(
    "/login?message=Check%20your%20email%20to%20confirm%20your%20account.",
  );
}
