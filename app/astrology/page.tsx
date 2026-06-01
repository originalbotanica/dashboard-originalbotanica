import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionStatus } from "@/lib/subscription";

export const metadata = {
  title: "Astrology | Original Botanica",
};

/**
 * Astrology hub page.
 *
 * Two doors for Part 1: Talk to Your Astrologer, View Your Chart.
 * Forecast + Compatibility arrive in Part 2.
 */
export default async function AstrologyHubPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, birth_date, birth_place, sun_sign, moon_sign, rising_sign")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.first_name) redirect("/profile-setup");

  const sub = await getSubscriptionStatus(user.id);
  const hasBirthData = !!profile.birth_date && !!profile.birth_place;
  const hasChart = !!profile.sun_sign;

  return (
    <main className="min-h-screen">
      <section className="max-w-3xl mx-auto px-6 pt-20 pb-16">
        <p className="eyebrow mb-4">Astrology</p>
        <h1 className="display text-4xl md:text-5xl mb-6">
          {profile.first_name}, your chart awaits.
        </h1>

        {!hasBirthData ? (
          <>
            <p className="text-[var(--foreground-muted)] text-lg leading-relaxed max-w-2xl mb-8">
              To read your chart, the astrologer needs your birth date and the
              city where you were born. Birth time is helpful but not required.
            </p>
            <Link href="/profile-setup" className="btn-primary inline-flex">
              Add your birth details
            </Link>
          </>
        ) : (
          <>
            <p className="text-[var(--foreground-muted)] text-lg leading-relaxed max-w-2xl mb-8">
              Your astrologer is ready. Ask about a placement, a current transit,
              or the ritual that fits this week.
            </p>

            {hasChart && (
              <p className="invocation text-base text-[var(--foreground-muted)] mb-10">
                Sun in {profile.sun_sign}. Moon in {profile.moon_sign}.
                {profile.rising_sign
                  ? ` Rising in ${profile.rising_sign}.`
                  : ""}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
              <Link
                href="/astrology/astrologer"
                className="btn-primary inline-flex"
              >
                Talk to Your Astrologer
              </Link>
              <Link href="/astrology/chart" className="btn-ghost inline-flex">
                View Your Chart
              </Link>
            </div>

            {!sub.isActive && (
              <p className="form-error mt-6">
                Your subscription is not active. The astrologer is locked until
                you reactivate.
              </p>
            )}
          </>
        )}

        <section className="mt-20 border-t border-[var(--border)] pt-10">
          <p className="eyebrow mb-3">Coming soon</p>
          <ul className="text-[var(--foreground-muted)] leading-relaxed space-y-1">
            <li>Monthly forecast personalized to your chart</li>
            <li>Compatibility readings between two charts</li>
            <li>Inline ritual and product recommendations from the botanica</li>
          </ul>
        </section>

        <div className="mt-12">
          <Link
            href="/dashboard"
            className="nav-link text-[var(--accent)]"
          >
            ← Back to your dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
