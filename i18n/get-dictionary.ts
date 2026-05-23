import "server-only";
import type { Locale } from "./config";

/**
 * Loads the dictionary for a given locale on the server.
 * Uses dynamic import so each dictionary is its own code chunk
 * — we never ship the Spanish JSON to an English user, etc.
 */
const dictionaries = {
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  es: () => import("./dictionaries/es.json").then((m) => m.default),
} as const;

export const getDictionary = async (locale: Locale) => {
  const loader = dictionaries[locale] || dictionaries.en;
  return loader();
};

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
