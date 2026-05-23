/**
 * Internationalization config.
 *
 * V1 plan: bilingual UI from day one. English content first. Spanish
 * translations of the rituals library and AI prompts roll out across
 * the first 60–90 days post-launch.
 *
 * We keep the locale set tight — adding more later is easy, but
 * shipping with a sprawling set we can't actually translate is not.
 */

export const locales = ["en", "es"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/**
 * Human-readable label for a locale (used in the language switcher).
 */
export const localeLabels: Record<Locale, string> = {
  en: "English",
  es: "Español",
};
