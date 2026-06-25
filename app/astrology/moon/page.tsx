import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionStatus } from "@/lib/subscription";
import { getMoon, moonGuidance } from "@/lib/astrology/moon";
import { getTodaysSky } from "@/lib/astrology/sky";
import { getRitualsByMoonPhase, getSavedRitualIds } from "@/lib/rituals/queries";
import { MoonPhase } from "@/components/moon-phase";
import { RitualCard } from "@/components/ritual-card";

export const metadata = {
  title: "Tonight's moon",
  description:
    "The current phase of the moon, what it is good for, and rituals timed to tonight's light.",
};

export default async function MoonGuidePage() {
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
  if (!sub.isActive) redirect("/astrology");

  const moon = getMoon();
  const guide = moonGuidance(moon.bucket);
  const sky = getTodaysSky();
  const [rituals, savedIds] = await Promise.all([
    getRitualsByMoonPhase(moon.bucket, 3),
    getSavedRitualIds(user.id),
  ]);

  return (
    <main className="min-h-screen">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/astrology" className="nav-link text-[var(--accent)]">
            ← Astrology
          </Link>
          <p className="sublabel text-xs">Tonight&apos;s moon</p>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12">
        <div className="flex flex-col items-center text-center">
          <MoonPhase
            illumination={moon.illumination}
            waxing={moon.waxing}
            size={150}
          />
          <p className="eyebrow mt-8 mb-2 text-[var(--foreground-muted)]">
            {moon.illuminationPct}% illuminated {moon.waxing ? "and waxing" : "and waning"}
          </p>
          <h1 className="display text-3xl md:text-5xl leading-tight">
            {moon.phaseName} in {sky.moonSign}
          </h1>
          {sky.aspect && (
            <p className="eyebrow mt-3 text-[var(--foreground-muted)]">
              Moon {sky.aspect.name} Sun. {sky.aspect.meaning}
            </p>
          )}
          <p className="invocation text-lg md:text-xl text-[var(--foreground)] mt-5 max-w-2xl">
            {guide.title}
          </p>
          <p className="text-[var(--foreground-muted)] leading-relaxed mt-5 max-w-2xl">
            {guide.body}
          </p>

          {/* Good for chips */}
          <div className="flex flex-wrap justify-center gap-2 mt-7">
            {guide.goodFor.map((g) => (
              <span
                key={g}
                className="eyebrow border border-[var(--border-strong)] rounded-full px-3 py-1 text-[var(--foreground-muted)]"
              >
                {g}
              </span>
            ))}
          </div>

          {/* Next phases */}
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-2 mt-10 text-[var(--foreground-subtle)]">
            <span className="eyebrow">
              New moon in {moon.daysToNew} {moon.daysToNew === 1 ? "day" : "days"}
            </span>
            <span className="eyebrow">
              Full moon in {moon.daysToFull} {moon.daysToFull === 1 ? "day" : "days"}
            </span>
          </div>
        </div>
      </section>

      {/* Rituals timed to tonight's moon */}
      {rituals.length > 0 ? (
        <section className="max-w-5xl mx-auto px-6 pb-24 border-t border-[var(--border)] pt-12">
          <p className="eyebrow mb-2">Rituals for tonight&apos;s moon</p>
          <p className="text-[var(--foreground-muted)] leading-relaxed mb-8 max-w-2xl">
            From the library, timed to a {moon.bucket === "full" ? "full" : moon.bucket} moon.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rituals.map((r) => (
              <RitualCard key={r.slug} ritual={r} saved={savedIds.has(r.id)} />
            ))}
          </div>
          <p className="mt-8">
            <Link
              href="/rituals"
              className="nav-link text-[var(--accent)] inline-flex items-center gap-2"
            >
              Browse the full library
              <span aria-hidden>→</span>
            </Link>
          </p>
        </section>
      ) : null}
    </main>
  );
}
