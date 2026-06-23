/**
 * Lightweight i18n for the app shell (Phase 1: chrome — nav, account, etc.).
 *
 * Flat dotted keys, two locales. The member's choice is stored in the
 * `ob-locale` cookie (source of truth) and mirrored to profiles.locale.
 * Spiritual *content* (rituals, dream readings, horoscopes) is handled
 * separately and is not part of this dictionary.
 */

export type Locale = "en" | "es";
export const LOCALES: Locale[] = ["en", "es"];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "ob-locale";

export function asLocale(v: string | null | undefined): Locale {
  return v === "es" ? "es" : "en";
}

type Dict = Record<string, string>;

const en: Dict = {
  // navigation / chrome
  "nav.tarot": "Tarot",
  "nav.astrology": "Astrology",
  "nav.dreams": "Dreams",
  "nav.altar": "Altar",
  "nav.ancestors": "Ancestors",
  "nav.rituals": "Rituals",
  "nav.account": "Account",
  "nav.accountBilling": "Account & billing",
  "nav.signOut": "Sign out",
  "nav.menu": "Menu",
  "nav.close": "Close",
  "lang.label": "Language",
};

const es: Dict = {
  "nav.tarot": "Tarot",
  "nav.astrology": "Astrología",
  "nav.dreams": "Sueños",
  "nav.altar": "Altar",
  "nav.ancestors": "Ancestros",
  "nav.rituals": "Rituales",
  "nav.account": "Cuenta",
  "nav.accountBilling": "Cuenta y facturación",
  "nav.signOut": "Cerrar sesión",
  "nav.menu": "Menú",
  "nav.close": "Cerrar",
  "lang.label": "Idioma",
};

const MESSAGES: Record<Locale, Dict> = { en, es };

/** Translate a key for a locale, with optional {var} interpolation. */
export function t(
  locale: Locale,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const table = MESSAGES[locale] || MESSAGES.en;
  let s = table[key] ?? MESSAGES.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return s;
}
