import Link from "next/link";
import type { SubscriptionStatus } from "@/lib/subscription";
import { t, type Locale } from "@/lib/i18n/dictionary";

/**
 * Conversion / status prompt shown in the dashboard hero. Localized (EN/ES).
 *
 * - Trial ending soon (<= 3 days): transparent price + a clear CTA.
 * - Membership set to cancel: a gentle "keep it" nudge.
 * - Lapsed / inactive: a reactivate prompt.
 * - Trialing with time to spare: the quiet line.
 * - Active and healthy: nothing.
 */
const CARD =
  "mt-14 mx-auto max-w-md flex flex-col items-center gap-3 rounded-xl border px-6 py-5 bg-[var(--surface)]";

export function MembershipPrompt({
  sub,
  trialLeft,
  locale = "en",
}: {
  sub: SubscriptionStatus;
  trialLeft: number | null;
  locale?: Locale;
}) {
  const tr = (k: string, vars?: Record<string, string | number>) => t(locale, k, vars);

  const pricePhrase =
    sub.plan === "annual"
      ? tr("price.annual")
      : sub.plan === "monthly"
        ? tr("price.monthly")
        : tr("price.plan");

  const fmtDate = (d: Date | null): string | null =>
    d
      ? d.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
          month: "long",
          day: "numeric",
        })
      : null;

  // Lapsed / inactive — strongest nudge.
  if (!sub.isActive) {
    return (
      <div className={CARD} style={{ borderColor: "var(--ember)" }}>
        <p className="eyebrow text-[var(--ember)]">{tr("prompt.inactiveEyebrow")}</p>
        <p className="text-sm text-[var(--foreground-muted)] leading-relaxed text-center">
          {tr("prompt.inactiveBody")}
        </p>
        <Link href="/account" className="btn-primary">
          {tr("prompt.reactivate")}
        </Link>
      </div>
    );
  }

  // Active but scheduled to cancel.
  if (sub.rawStatus === "active" && sub.cancelAtPeriodEnd) {
    const ends = fmtDate(sub.currentPeriodEnd);
    return (
      <div className={CARD} style={{ borderColor: "var(--border-strong)" }}>
        <p className="eyebrow text-[var(--accent)]">
          {ends ? tr("prompt.endsOn", { date: ends }) : tr("prompt.ending")}
        </p>
        <p className="text-sm text-[var(--foreground-muted)] leading-relaxed text-center">
          {tr("prompt.cancelBody")}
        </p>
        <Link href="/account" className="btn-ghost">
          {tr("prompt.manage")}
        </Link>
      </div>
    );
  }

  // Trial ending soon.
  if (sub.isTrialing && trialLeft !== null && trialLeft <= 3) {
    const when =
      trialLeft === 0
        ? tr("prompt.whenToday")
        : trialLeft === 1
          ? tr("prompt.whenTomorrow")
          : tr("prompt.whenInDays", { n: trialLeft });
    return (
      <div className={CARD} style={{ borderColor: "var(--accent)" }}>
        <p className="eyebrow text-[var(--accent)]">{tr("prompt.trialEnds", { when })}</p>
        <p className="text-sm text-[var(--foreground-muted)] leading-relaxed text-center">
          {tr("prompt.continueBody", { price: pricePhrase })}
        </p>
        <Link href="/account" className="btn-primary">
          {tr("prompt.manage")}
        </Link>
      </div>
    );
  }

  // Trialing, plenty of time left — keep it quiet.
  if (sub.isTrialing && trialLeft !== null) {
    return (
      <p className="eyebrow mt-16 text-[var(--accent)]">
        {trialLeft === 1
          ? tr("prompt.trialLeftDay")
          : tr("prompt.trialLeftDays", { n: trialLeft })}
      </p>
    );
  }

  return null;
}
