import { cookies } from "next/headers";
import { asLocale, type Locale, LOCALE_COOKIE } from "./dictionary";

/**
 * The current UI locale, read from the ob-locale cookie. Server-only.
 * Defaults to English when unset.
 */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  return asLocale(store.get(LOCALE_COOKIE)?.value);
}
