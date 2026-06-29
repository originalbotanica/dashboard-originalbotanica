import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionStatus } from "@/lib/subscription";
import { getMoon, moonGuidance } from "@/lib/astrology/moon";
import { getTodaysSky } from "@/lib/astrology/sky";
import { getRitualsByMoonPhase, getSavedRitualIds } from "@/lib/rituals/queries";
import { MoonPhase } from "@/components/moon-phase";
import { RitualCard } from "@/components/ritual-card";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionary";
import { signName, moonPhaseName } from "@/lib/astrology/terms";

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
  const locale = await getLocale();

  return (
    <main className="min-h-screen">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/astrology" className="nav-link text-[var(--accent)]">
            ← {t(locale, "astro.eyebrow")}
          </Link>
          <p className="sublabel text-xs">{t(locale, "moon.sublabel")}</p>
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
            {t(locale, moon.waxing ? "moon.illumWaxing" : "moon.illumWaning", { pct: moon.illuminationPct })}
          </p>
          <h1 className="display text-3xl md:text-5xl leading-tight">
            {t(locale, "moon.phaseInSign", { phase: moonPhaseName(moon.phaseName, locale), sign: signName(sky.moonSign, locale) })}
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
              {t(locale, moon.daysToNew === 1 ? "moon.newInOne" : "moon.newInMany", { n: moon.daysToNew })}
            </span>
            <span className="eyebrow">
              {t(locale, moon.daysToFull === 1 ? "moon.fullInOne" : "moon.fullInMany", { n: moon.daysToFull })}
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-10">
            <Link
              href={`/altar/virtual/new?intention=${encodeURIComponent(t(locale, "moon.intentionPrefill", { phase: moonPhaseName(moon.phaseName, locale).toLowerCase() }))}`}
              className="btn-primary inline-flex"
            >
              {t(locale, "moon.lightCta")}
            </Link>
            <Link href="/calendar" className="btn-ghost inline-flex">
              {t(locale, "moon.calendar")}
            </Link>
          </div>
        </div>
      </section>

      {/* Rituals timed to tonight's moon */}
      {rituals.length > 0 ? (
        <section className="max-w-5xl mx-auto px-6 pb-24 border-t border-[var(--border)] pt-12">
          <p className="eyebrow mb-2">{t(locale, "moon.ritualsEyebrow")}</p>
          <p className="text-[var(--foreground-muted)] leading-relaxed mb-8 max-w-2xl">
            {t(locale, "moon.ritualsIntro", { phase: moon.bucket === "full" ? "full" : moon.bucket })}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rituals.map((r) => (
              <RitualCard key={r.slug} ritual={r} saved={savedIds.has(r.id)} locale={locale} />
            ))}
          </div>
          <p className="mt-8">
            <Link
              href="/rituals"
              className="nav-link text-[var(--accent)] inline-flex items-center gap-2"
            >
              {t(locale, "moon.browseFull")}
              <span aria-hidden>→</span>
            </Link>
          </p>
        </section>
      ) : null}
    </main>
  );
}
