import { cookies, headers } from "next/headers";
import { asLocale, type Locale, LOCALE_COOKIE } from "./dictionary";

/**
 * The current UI locale. Server-only.
 *
 * Priority:
 *   1. The ob-locale cookie (an explicit choice via the toggle).
 *   2. On first visit (no cookie), the browser's Accept-Language header —
 *      Spanish speakers land in Spanish automatically.
 *   3. English.
 */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const fromCookie = store.get(LOCALE_COOKIE)?.value;
  if (fromCookie) return asLocale(fromCookie);

  try {
    const h = await headers();
    const accept = (h.get("accept-language") || "").toLowerCase();
    const first = accept.split(",")[0]?.trim() ?? "";
    if (first.startsWith("es")) return "es";
  } catch {
    /* headers unavailable; fall through to default */
  }
  return "en";
}
