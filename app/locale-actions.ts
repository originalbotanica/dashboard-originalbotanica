"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { asLocale, type Locale, LOCALE_COOKIE } from "@/lib/i18n/dictionary";

/**
 * Persist the chosen UI locale: set the ob-locale cookie (source of truth) and,
 * if the visitor is signed in, mirror it to their profile so it follows them
 * across devices. The client refreshes after this resolves.
 */
export async function setLocale(locale: Locale) {
  const value = asLocale(locale);
  const store = await cookies();
  store.set(LOCALE_COOKIE, value, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ locale: value }).eq("id", user.id);
    }
  } catch {
    /* cookie is enough; profile mirror is best-effort */
  }
}
