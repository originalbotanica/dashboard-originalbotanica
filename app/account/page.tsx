import Link from "next/link";
import { MemberNav } from "@/components/member-nav";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionStatus, trialDaysLeft } from "@/lib/subscription";
import { getLocale } from "@/lib/i18n/server";
import { t, type Locale } from "@/lib/i18n/dictionary";
import {
  ManageBillingButton,
  StartMembershipButtons,
} from "@/components/account-actions";

export const metadata = { title: "Your account" };

function formatDate(d: Date | null, locale: Locale): string | null {
  if (!d) return null;
  return d.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function planLabelKey(plan: string | null): string | null {
  if (plan === "monthly") return "account.planMonthly";
  if (plan === "annual") return "account.planAnnual";
  if (plan === "gift") return "account.planGift";
  return null;
}

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const locale = await getLocale();
  const tr = (k: string, vars?: Record<string, string | number>) => t(locale, k, vars);

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name")
    .eq("id", user.id)
    .maybeSingle();

  const sub = await getSubscriptionStatus(user.id);
  const trialLeft = trialDaysLeft(sub);
  const renews = formatDate(sub.currentPeriodEnd, locale);

  let statusLine: string;
  if (sub.isTrialing) {
    statusLine =
      trialLeft === 0
        ? tr("account.statusTrialToday")
        : trialLeft === 1
          ? tr("account.statusTrialDay")
          : tr("account.statusTrialDays", { n: trialLeft ?? 0 });
  } else if (sub.rawStatus === "active") {
    statusLine = sub.cancelAtPeriodEnd
      ? tr("account.statusActiveCancel")
      : tr("account.statusActive");
  } else if (sub.rawStatus === "past_due") {
    statusLine = tr("account.statusPastDue");
  } else if (sub.rawStatus === "gift") {
    statusLine = tr("account.statusGift");
  } else {
    statusLine = tr("account.statusNone");
  }

  const planKey = planLabelKey(sub.plan);

  return (
    <main className="min-h-screen">
      <MemberNav />

      <section className="max-w-2xl mx-auto px-6 pt-16 pb-24">
        <p className="eyebrow mb-3 text-[var(--foreground-muted)]">
          {tr("account.eyebrow")}
        </p>
        <h1 className="display text-3xl md:text-4xl leading-tight mb-2">
          {profile?.first_name
            ? tr("account.membershipOf", { name: profile.first_name })
            : tr("account.yourMembership")}
        </h1>
        <p className="text-[var(--foreground-muted)] mb-10 break-words">
          {user.email}
        </p>

        <div className="border border-[var(--border)] rounded-xl bg-[var(--surface)] p-6 mb-10">
          <p className="eyebrow mb-4">{tr("account.membership")}</p>
          <dl className="space-y-3">
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--foreground-muted)]">{tr("account.status")}</dt>
              <dd className="text-[var(--foreground)] text-right">
                {statusLine}
              </dd>
            </div>
            {planKey && (
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--foreground-muted)]">{tr("account.plan")}</dt>
                <dd className="text-[var(--foreground)] text-right">
                  {tr(planKey)}
                </dd>
              </div>
            )}
            {sub.isTrialing && sub.trialEnd && (
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--foreground-muted)]">{tr("account.trialEnds")}</dt>
                <dd className="text-[var(--foreground)] text-right">
                  {formatDate(sub.trialEnd, locale)}
                </dd>
              </div>
            )}
            {!sub.isTrialing && sub.isActive && renews && (
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--foreground-muted)]">
                  {sub.cancelAtPeriodEnd ? tr("account.ends") : tr("account.renews")}
                </dt>
                <dd className="text-[var(--foreground)] text-right">{renews}</dd>
              </div>
            )}
          </dl>
        </div>

        {sub.rawStatus === "gift" ? (
          <div className="mb-12">
            <h2 className="display text-2xl mb-3">{tr("account.giftTitle")}</h2>
            <p className="text-[var(--foreground-muted)] leading-relaxed mb-6">
              {renews
                ? tr("account.giftBodyThrough", { date: renews })
                : tr("account.giftBody")}
            </p>
            <StartMembershipButtons />
          </div>
        ) : sub.isActive ? (
          <div className="mb-12">
            <p className="text-[var(--foreground-muted)] leading-relaxed mb-5">
              {tr("account.manageIntro")}
            </p>
            <ManageBillingButton />
          </div>
        ) : (
          <div className="mb-12">
            <h2 className="display text-2xl mb-3">{tr("account.beginTitle")}</h2>
            <p className="text-[var(--foreground-muted)] leading-relaxed mb-6">
              {tr("account.beginBody")}
            </p>
            <StartMembershipButtons />
          </div>
        )}

        <div className="border-t border-[var(--border)] pt-8 mb-8">
          <p className="eyebrow mb-3 text-[var(--foreground-muted)]">
            {tr("account.giveGiftEyebrow")}
          </p>
          <p className="text-[var(--foreground-muted)] leading-relaxed mb-4">
            {tr("account.giveGiftBody")}
          </p>
          <Link href="/gift" className="btn-ghost inline-flex">
            {tr("account.giftCta")}
          </Link>
        </div>

        <p className="text-xs text-[var(--foreground-subtle)] mb-8">
          {tr("account.privacyNote")}{" "}
          <Link href="/privacy" className="underline hover:text-[var(--accent)]">
            {tr("account.privacyLink")}
          </Link>
          .
        </p>

        <div className="border-t border-[var(--border)] pt-8">
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="nav-link text-[var(--foreground-muted)] hover:text-[var(--accent)] transition-colors"
            >
              {tr("account.signOut")}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
