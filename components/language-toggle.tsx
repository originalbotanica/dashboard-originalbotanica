"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "./locale-provider";
import { setLocale } from "@/app/locale-actions";

/**
 * Language switch — a globe (the universal "language" mark) plus the current
 * language in its own name (English / Español). One tap switches to the other.
 * Persists the choice (cookie + profile) and refreshes so the chrome
 * re-renders in the chosen language.
 */
export function LanguageToggle({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const name = locale === "es" ? "Español" : "English";
  const next = locale === "es" ? "en" : "es";
  const switchTo = next === "es" ? "Español" : "English";

  function toggle() {
    if (pending) return;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-label={`Language: ${name}. Switch to ${switchTo}.`}
      title={`Switch to ${switchTo}`}
      className={`nav-link inline-flex items-center gap-1.5 text-[var(--foreground)] hover:text-[var(--accent)] transition-colors disabled:opacity-60 ${className}`}
    >
      <Globe />
      <span>{name}</span>
    </button>
  );
}

function Globe() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18" />
    </svg>
  );
}
