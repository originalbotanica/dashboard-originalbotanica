import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionStatus } from "@/lib/subscription";
import { StartMembershipButtons } from "@/components/account-actions";

export const metadata = { title: "Start your free trial" };

/**
 * The trial / checkout step of onboarding.
 *
 * Reached after profile setup. The member chooses a plan and starts a
 * 7-day free trial via Stripe Checkout; on success they land on the
 * dashboard. Already-subscribed members skip straight through.
 */
export default async function SubscribePage() {
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
  if (!profile?.first_name) redirect("/profile-setup");

  const sub = await getSubscriptionStatus(user.id);
  if (sub.isActive) redirect("/dashboard");

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="auth-card text-center">
        <Image
          src="/logo-ob-white-banner.png"
          alt="Original Botanica"
          width={100}
          height={70}
          priority
          className="h-auto w-[100px] mx-auto mb-8"
        />
        <h1 className="display text-2xl mb-3">Start your 7-day free trial.</h1>
        <p className="text-foreground-muted leading-relaxed text-sm mb-2">
          {profile.first_name}, every tool opens today: daily tarot, your
          astrologer, the altar, and the rituals library. No charge until day 8.
          Cancel anytime.
        </p>
        <p className="text-[var(--foreground-subtle)] text-xs mb-8">
          Choose your plan to begin.
        </p>

        <div className="flex justify-center">
          <StartMembershipButtons />
        </div>

        <p className="mt-6 text-sm font-medium text-[var(--foreground)]">
          You won&apos;t be charged during your 7-day trial.
        </p>
        <p className="mt-1.5 text-xs text-[var(--foreground-muted)]">
          After the trial, your plan renews automatically ($29.95/month or
          $299.95/year) until you cancel — which you can do any time, in a
          couple of clicks. We&apos;ll email you before your trial ends, so
          nothing is a surprise.
        </p>
      </div>
    </main>
  );
}
