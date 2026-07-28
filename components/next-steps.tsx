import Link from "next/link";
import { t, type Locale } from "@/lib/i18n/dictionary";

/**
 * The closing block on a tool page — where to go once the work is done.
 *
 * Every one of these pages ends on a moment: a dream read, a flame
 * charged, an offering set, a card turned. Before this existed the page
 * simply stopped, and the member's only way out was the browser's back
 * button (or, on the memorial page, a delete button). This offers the
 * natural next moves in the practice, and always a way home.
 */

export type NextStep = { href: string; labelKey: string };

export function NextSteps({
  steps,
  locale,
  eyebrowKey = "ns.eyebrow",
}: {
  steps: NextStep[];
  locale: Locale;
  eyebrowKey?: string;
}) {
  return (
    // Extra room at the foot so the floating feedback mark never lands on
    // the last link.
    <div className="mt-12 border-t border-[var(--border)] pt-8 pb-6 text-center">
      <p className="eyebrow mb-5 text-[var(--foreground-subtle)]">
        {t(locale, eyebrowKey)}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
        {steps.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="nav-link text-[var(--accent)] inline-flex items-center gap-2"
          >
            {t(locale, s.labelKey)} <span aria-hidden>→</span>
          </Link>
        ))}
      </div>
      <Link
        href="/dashboard"
        className="nav-link text-[var(--foreground-muted)] hover:text-[var(--accent)] inline-flex items-center gap-2 mt-7"
      >
        ← {t(locale, "ns.home")}
      </Link>
    </div>
  );
}
