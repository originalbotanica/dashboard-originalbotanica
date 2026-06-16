import Link from "next/link";
import type { SubscriptionStatus } from "@/lib/subscription";

/**
 * Conversion / status prompt shown in the dashboard hero.
 *
 * - Trial ending soon (<= 3 days): transparent price + a clear CTA so the
 *   member knows what happens next and can manage it.
 * - Membership set to cancel: a gentle "keep it" nudge.
 * - Lapsed / inactive: a reactivate prompt.
 * - Trialing with time to spare: the original quiet line.
 * - Active and healthy: nothing.
 */
function pricePhrase(plan: SubscriptionStatus["plan"]): string {
  if (plan === "annual") return "$199.95/year";
  if (plan === "monthly") return "$24.95/month";
  return "your plan";
}
function fmtDate(d: Date | null): string | null {
  return d
    ? d.toLocaleDateString("en-US", { month: "long", day: "numeric" })
    : null;
}

const CARD =
  "mt-14 mx-auto max-w-md flex flex-col items-center gap-3 rounded-xl border px-6 py-5 bg-[var(--surface)]";

export function MembershipPrompt({
  sub,
  trialLeft,
}: {
  sub: SubscriptionStatus;
  trialLeft: number | null;
}) {
  // Lapsed / inactive — strongest nudge.
  if (!sub.isActive) {
    return (
      <div className={CARD} style={{ borderColor: "var(--ember)" }}>
        <p className="eyebrow text-[var(--ember)]">Membership inactive</p>
        <p className="text-sm text-[var(--foreground-muted)] leading-relaxed text-center">
          Reactivate to keep your daily readings, your chart, and the altar.
        </p>
        <Link href="/account" className="btn-primary">
          Reactivate membership
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
          {ends ? `Membership ends ${ends}` : "Membership ending"}
        </p>
        <p className="text-sm text-[var(--foreground-muted)] leading-relaxed text-center">
          Changed your mind? You can keep your membership anytime.
        </p>
        <Link href="/account" className="btn-ghost">
          Manage membership
        </Link>
      </div>
    );
  }

  // Trial ending soon.
  if (sub.isTrialing && trialLeft !== null && trialLeft <= 3) {
    const when =
      trialLeft === 0 ? "today" : trialLeft === 1 ? "tomorrow" : `in ${trialLeft} days`;
    return (
      <div className={CARD} style={{ borderColor: "var(--accent)" }}>
        <p className="eyebrow text-[var(--accent)]">Your free trial ends {when}</p>
        <p className="text-sm text-[var(--foreground-muted)] leading-relaxed text-center">
          Your membership continues at {pricePhrase(sub.plan)}. Cancel anytime —
          everything stays open.
        </p>
        <Link href="/account" className="btn-primary">
          Manage membership
        </Link>
      </div>
    );
  }

  // Trialing, plenty of time left — keep it quiet.
  if (sub.isTrialing && trialLeft !== null) {
    return (
      <p className="eyebrow mt-16 text-[var(--accent)]">
        {trialLeft} {trialLeft === 1 ? "day" : "days"} left in your trial
      </p>
    );
  }

  return null;
}
