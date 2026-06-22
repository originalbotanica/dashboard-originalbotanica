import { MemberNav } from "@/components/member-nav";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionStatus, trialDaysLeft } from "@/lib/subscription";
import { planLabel } from "@/lib/stripe";
import {
  ManageBillingButton,
  StartMembershipButtons,
} from "@/components/account-actions";

export const metadata = { title: "Your account" };

function formatDate(d: Date | null): string | null {
  if (!d) return null;
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name")
    .eq("id", user.id)
    .maybeSingle();

  const sub = await getSubscriptionStatus(user.id);
  const trialLeft = trialDaysLeft(sub);
  const renews = formatDate(sub.currentPeriodEnd);

  let statusLine: string;
  if (sub.isTrialing) {
    statusLine =
      trialLeft === 0
        ? "Free trial — ends today"
        : `Free trial — ${trialLeft} ${trialLeft === 1 ? "day" : "days"} left`;
  } else if (sub.rawStatus === "active") {
    statusLine = sub.cancelAtPeriodEnd
      ? "Active — cancels at period end"
      : "Active";
  } else if (sub.rawStatus === "past_due") {
    statusLine = "Payment past due";
  } else if (sub.rawStatus === "gift") {
    statusLine = "Gift membership — active";
  } else {
    statusLine = "No active membership";
  }

  return (
    <main className="min-h-screen">
      <MemberNav />

      <section className="max-w-2xl mx-auto px-6 pt-16 pb-24">
        <p className="eyebrow mb-3 text-[var(--foreground-muted)]">
          Your account
        </p>
        <h1 className="display text-3xl md:text-4xl leading-tight mb-2">
          {profile?.first_name
            ? `${profile.first_name}'s membership`
            : "Your membership"}
        </h1>
        <p className="text-[var(--foreground-muted)] mb-10 break-words">
          {user.email}
        </p>

        <div className="border border-[var(--border)] rounded-xl bg-[var(--surface)] p-6 mb-10">
          <p className="eyebrow mb-4">Membership</p>
          <dl className="space-y-3">
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--foreground-muted)]">Status</dt>
              <dd className="text-[var(--foreground)] text-right">
                {statusLine}
              </dd>
            </div>
            {sub.plan && (
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--foreground-muted)]">Plan</dt>
                <dd className="text-[var(--foreground)] text-right">
                  {planLabel(sub.plan)}
                </dd>
              </div>
            )}
            {sub.isTrialing && sub.trialEnd && (
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--foreground-muted)]">Trial ends</dt>
                <dd className="text-[var(--foreground)] text-right">
                  {formatDate(sub.trialEnd)}
                </dd>
              </div>
            )}
            {!sub.isTrialing && sub.isActive && renews && (
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--foreground-muted)]">
                  {sub.cancelAtPeriodEnd ? "Ends" : "Renews"}
                </dt>
                <dd className="text-[var(--foreground)] text-right">{renews}</dd>
              </div>
            )}
          </dl>
        </div>

        {sub.rawStatus === "gift" ? (
          <div className="mb-12">
            <h2 className="display text-2xl mb-3">Your gift membership is active.</h2>
            <p className="text-[var(--foreground-muted)] leading-relaxed mb-6">
              Every tool is open to you{renews ? ` through ${renews}` : ""}. When your
              gift ends, you can continue your membership any time — your altar,
              ancestors, and saved rituals will be here waiting.
            </p>
            <StartMembershipButtons />
          </div>
        ) : sub.isActive ? (
          <div className="mb-12">
            <p className="text-[var(--foreground-muted)] leading-relaxed mb-5">
              Update your payment method, change or cancel your plan, and view
              past invoices in the secure billing portal.
            </p>
            <ManageBillingButton />
          </div>
        ) : (
          <div className="mb-12">
            <h2 className="display text-2xl mb-3">Begin your membership.</h2>
            <p className="text-[var(--foreground-muted)] leading-relaxed mb-6">
              Seven days free, then your plan. Cancel anytime. Every tool opens
              the moment you join.
            </p>
            <StartMembershipButtons />
          </div>
        )}

        <div className="border-t border-[var(--border)] pt-8">
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="nav-link text-[var(--foreground-muted)] hover:text-[var(--accent)] transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
