"use client";

import { createContext, useContext } from "react";
import { type Locale, t as translate } from "@/lib/i18n/dictionary";

/**
 * Makes the current locale available to client components, with a useT()
 * helper for translating shell strings. The locale is resolved on the server
 * (from the ob-locale cookie) and passed in via the root layout.
 */
const LocaleContext = createContext<Locale>("en");

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

export function useT() {
  const locale = useContext(LocaleContext);
  return (key: string, vars?: Record<string, string | number>) =>
    translate(locale, key, vars);
}
