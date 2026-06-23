"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "./locale-provider";
import { setLocale } from "@/app/locale-actions";
import { LOCALES, type Locale } from "@/lib/i18n/dictionary";

/**
 * EN / ES language switch. Persists the choice (cookie + profile) and refreshes
 * so server-rendered chrome re-renders in the chosen language.
 */
export function LanguageToggle({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function choose(next: Locale) {
    if (next === locale || pending) return;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  return (
    <div
      role="group"
      aria-label="Language"
      className={`inline-flex items-center gap-1 ${className}`}
    >
      {LOCALES.map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 && (
            <span className="text-[var(--foreground-subtle)] px-0.5" aria-hidden>
              /
            </span>
          )}
          <button
            type="button"
            onClick={() => choose(l)}
            disabled={pending}
            aria-pressed={l === locale}
            className={`text-xs uppercase tracking-wide transition-colors ${
              l === locale
                ? "text-[var(--accent)]"
                : "text-[var(--foreground-muted)] hover:text-[var(--accent)]"
            }`}
          >
            {l}
          </button>
        </span>
      ))}
    </div>
  );
}
