import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionStatus } from "@/lib/subscription";
import { loadAstrologerContext } from "@/lib/astrologer/context";
import { ChartWheel } from "@/components/chart-wheel";
import { getLocale } from "@/lib/i18n/server";
import { t, type Locale } from "@/lib/i18n/dictionary";
import { signName, planetName } from "@/lib/astrology/terms";

export const metadata = {
  title: "Your Natal Chart",
};

/**
 * Natal chart display.
 *
 * Calling loadAstrologerContext both fetches the cached chart and
 * computes it on the fly the first time. If credentials are missing,
 * the astrology-api lib falls back to mocked data so the page still
 * renders something instead of erroring.
 */
export default async function ChartPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, birth_date, birth_place")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.first_name) redirect("/profile-setup");
  if (!profile.birth_date || !profile.birth_place) {
    redirect("/astrology");
  }

  const sub = await getSubscriptionStatus(user.id);
  if (!sub.isActive) redirect("/astrology");

  const context = await loadAstrologerContext(user.id);
  if (!context) redirect("/astrology");

  const locale = await getLocale();
  const { chart, birthDate, birthCity, birthTime, isUnderEighteen } = context;
  // Rising and houses depend on the time of birth. Without it the chart engine
  // falls back to noon, which would make Rising/houses look exact when they are
  // really a guess — so we hide them rather than present a guess as fact.
  const hasTime = Boolean(birthTime);

  // Group placements into Big Three vs the rest
  const bigThreeNames = new Set(["Sun", "Moon", "Ascendant"]);
  const otherPlacements = chart.placements.filter(
    (p) => !bigThreeNames.has(p.name) && !/^asc$/i.test(p.name),
  );

  return (
    <main className="min-h-screen">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/astrology" className="nav-link text-[var(--accent)]">
            ← {t(locale, "astro.eyebrow")}
          </Link>
          <p className="sublabel text-xs">{t(locale, "chart.sublabel")}</p>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 pt-16 pb-24">
        <p className="eyebrow mb-4">{t(locale, "chart.eyebrow")}</p>
        <h1 className="display text-4xl md:text-5xl mb-3">
          {profile.first_name}
        </h1>
        <p className="text-[var(--foreground-muted)] mb-10">
          {birthTime
            ? t(locale, "chart.bornAt", { date: formatDate(birthDate, locale), time: birthTime, city: birthCity })
            : t(locale, "chart.born", { date: formatDate(birthDate, locale), city: birthCity })}
          {!hasTime && (
            <span className="block text-sm mt-1 text-[var(--foreground-subtle)]">
              {t(locale, "chart.noTimePre")}
              <Link
                href="/profile-setup"
                className="text-[var(--accent)] hover:underline"
              >
                {t(locale, "chart.addTime")}
              </Link>
              {t(locale, "chart.noTimePost")}
            </span>
          )}
          {chart.isMocked && (
            <span className="block text-sm mt-2 text-[var(--ember)]">
              {t(locale, "chart.mocked")}
            </span>
          )}
        </p>

        {isUnderEighteen && (
          <div className="form-error mb-10">
            {t(locale, "chart.under18")}
          </div>
        )}

        {chart.chartImageUrl && <ChartWheel src={chart.chartImageUrl} />}

        <section className="mb-12">
          <p className="eyebrow mb-3">{t(locale, "chart.bigThree")}</p>
          <ul className="space-y-3">
            <li className="flex justify-between border-b border-[var(--border)] pb-3">
              <span className="text-[var(--foreground-muted)]">{planetName("Sun", locale)}</span>
              <span className="display text-xl">{signName(chart.sunSign, locale)}</span>
            </li>
            <li className="flex justify-between border-b border-[var(--border)] pb-3">
              <span className="text-[var(--foreground-muted)]">{planetName("Moon", locale)}</span>
              <span className="display text-xl">{signName(chart.moonSign, locale)}</span>
            </li>
            <li className="flex justify-between border-b border-[var(--border)] pb-3">
              <span className="text-[var(--foreground-muted)]">{planetName("Rising", locale)}</span>
              <span className="display text-xl">
                {hasTime ? signName(chart.risingSign, locale) : "-"}
              </span>
            </li>
          </ul>
        </section>

        {otherPlacements.length > 0 && (
          <section className="mb-12">
            <p className="eyebrow mb-3">{t(locale, "chart.otherPlacements")}</p>
            <ul className="space-y-2 text-[var(--foreground-muted)]">
              {otherPlacements.map((p) => (
                <li key={p.name} className="flex justify-between text-sm">
                  <span>{planetName(p.name, locale)}</span>
                  <span>
                    {signName(p.sign, locale)}
                    {hasTime && p.house != null
                      ? " · " + (locale === "es"
                          ? t(locale, "chart.houseES", { n: p.house })
                          : t(locale, "chart.houseEN", { ord: ordinal(p.house) }))
                      : ""}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-12 flex gap-4 flex-wrap">
          <Link
            href="/astrology/astrologer"
            className="btn-primary inline-flex"
          >
            {t(locale, "chart.talkBtn")}
          </Link>
          <Link href="/astrology" className="btn-ghost inline-flex">
            {t(locale, "chart.backBtn")}
          </Link>
        </div>
      </section>
    </main>
  );
}

function formatDate(yyyyMmDd: string, locale: Locale): string {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
