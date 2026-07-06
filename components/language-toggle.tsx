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

  // Label the button with the language you'd SWITCH TO, not the current one.
  // "ENGLISH" on an English page reads as a statement, not a button; a
  // Spanish-speaking visitor scanning for their language needs to see
  // "ESPAÑOL". While the switch is in flight, say so in the target language.
  const next = locale === "es" ? "en" : "es";
  const switchTo = next === "es" ? "Español" : "English";
  const switchAbbr = next === "es" ? "ESP" : "ENG";
  const pendingLabel = next === "es" ? "Cambiando…" : "Switching…";

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
      aria-live="polite"
      aria-label={
        pending ? pendingLabel : `${next === "es" ? "Cambiar a" : "Switch to"} ${switchTo}`
      }
      title={`${next === "es" ? "Cambiar a" : "Switch to"} ${switchTo}`}
      className={`nav-link inline-flex items-center gap-1.5 text-[var(--foreground)] hover:text-[var(--accent)] transition-colors disabled:opacity-60 ${className}`}
    >
      <Globe />
      {/* Full name on desktop; compact ENG/ESP on small screens. */}
      <span className="md:hidden">{pending ? "…" : switchAbbr}</span>
      <span className="hidden md:inline">{pending ? pendingLabel : switchTo}</span>
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
