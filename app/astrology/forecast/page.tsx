import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionStatus } from "@/lib/subscription";
import { getOrGenerateMonthlyForecast } from "@/lib/forecast/generate";
import {
  ProseLine,
  ProseBlock,
  buildProductLookup,
} from "@/lib/rag/render-prose";
import { BotanicaRecs } from "@/components/botanica-recs";
import { getLocale } from "@/lib/i18n/server";
import { t, type Locale } from "@/lib/i18n/dictionary";

const EMPTY_LOOKUP = buildProductLookup([]);
const OB_BASE_URL = "https://originalbotanica.com";

export const metadata = {
  title: "Your monthly forecast",
};

const OB_CDN = "https://dlkhclkmyx18n.cloudfront.net";

/**
 * Monthly Forecast page.
 *
 * Generates the current month's forecast on first visit, then serves
 * the cached row for the rest of the month. Visible only to members
 * with a completed profile (birth date + city) and an active
 * subscription.
 */
export default async function ForecastPage() {
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

  const locale = await getLocale();
  const forecast = await getOrGenerateMonthlyForecast(user.id, locale);

  const monthLabel = currentMonthLabel(locale);

  // Only show key dates that haven't passed yet this month (Steve's note —
  // no point marking dates already behind us). We read the last day number in
  // the label so a range like "June 12–14" stays until the 14th; anything we
  // can't parse is kept, to be safe.
  const todayDay = new Date().getUTCDate();
  const upcomingKeyDates = (forecast?.content.key_dates || []).filter((kd) => {
    const nums = String(kd.date).match(/[0-9]{1,2}/g);
    if (!nums) return true;
    return parseInt(nums[nums.length - 1], 10) >= todayDay;
  });

  return (
    <main className="min-h-screen relative">
      {/* Atmospheric backdrop */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={`${OB_CDN}/cta-spiritual-services.jpg`}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-15"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(20,16,11,0.94) 0%, rgba(20,16,11,0.97) 100%)",
          }}
        />
      </div>

      <header className="border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/astrology" className="nav-link text-[var(--accent)]">
            ← {t(locale, "astro.eyebrow")}
          </Link>
          <p className="sublabel text-xs">{monthLabel}</p>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 pt-20 pb-24">
        <p className="eyebrow mb-4">{t(locale, "fc.eyebrow")}</p>
        <h1 className="display text-4xl md:text-5xl mb-10 leading-tight">
          {t(locale, "fc.title", { name: profile.first_name, month: monthLabel })}
        </h1>

        {!forecast ? (
          <div className="invocation text-[var(--foreground-muted)] border-l-2 border-[var(--ember)] pl-4 py-2 max-w-xl">
            {t(locale, "fc.failBody")}
          </div>
        ) : (
          <>
            {/* Opening — multi-paragraph prose with product links */}
            <article className="text-[var(--foreground)] mb-16">
              <ProseBlock
                text={forecast.content.opening}
                lookup={EMPTY_LOOKUP}
                optimisticBaseUrl={OB_BASE_URL}
                className="leading-relaxed text-lg mb-5 last:mb-0"
              />
            </article>

            {/* Key dates — upcoming only */}
            {upcomingKeyDates.length > 0 && (
                <section className="mb-16 border-t border-[var(--border)] pt-10">
                  <p className="eyebrow mb-6">{t(locale, "fc.datesToMark")}</p>
                  <ul className="space-y-6">
                    {upcomingKeyDates.map((kd, i) => (
                      <li
                        key={i}
                        className="grid grid-cols-12 gap-4 pb-4 border-b border-[var(--border)] last:border-b-0"
                      >
                        <div className="col-span-12 md:col-span-3">
                          <p className="display text-lg">{kd.date}</p>
                          <p className="text-xs text-[var(--foreground-subtle)] mt-1">
                            {kd.transit}
                          </p>
                        </div>
                        <div className="col-span-12 md:col-span-9 text-[var(--foreground-muted)] leading-relaxed">
                          <ProseLine
                            text={kd.what_to_do}
                            lookup={EMPTY_LOOKUP}
                            optimisticBaseUrl={OB_BASE_URL}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

            {/* Three terrains: love, work, spirit */}
            <section className="grid md:grid-cols-3 gap-8 mb-16 border-t border-[var(--border)] pt-10">
              <Terrain label={t(locale, "fc.terrainLove")} body={forecast.content.love} />
              <Terrain label={t(locale, "fc.terrainWork")} body={forecast.content.work} />
              <Terrain label={t(locale, "fc.terrainSpirit")} body={forecast.content.spirit} />
            </section>

            {/* Ritual for the month */}
            <section className="border-t border-[var(--border)] pt-10">
              <p className="eyebrow mb-4">{t(locale, "fc.ritualEyebrow")}</p>
              <h2 className="display text-2xl md:text-3xl mb-2 leading-tight">
                {forecast.content.ritual.title}
              </h2>
              <p className="invocation text-base text-[var(--accent)] mb-6">
                {forecast.content.ritual.when}
              </p>
              <div className="text-[var(--foreground-muted)]">
                <ProseBlock
                  text={forecast.content.ritual.what}
                  lookup={EMPTY_LOOKUP}
                  optimisticBaseUrl={OB_BASE_URL}
                  className="leading-relaxed mb-4 last:mb-0"
                />
              </div>
            </section>

            {/* Inline ritual + product recommendations from the botanica */}
            <BotanicaRecs
              userId={user.id}
              productSlugs={forecast.retrieved_product_slugs || []}
              sourceSlugs={(forecast.retrieved_sources || []).map((s) => s.slug)}
              headingKey="recs.forThisMonth"
            />
          </>
        )}

        <div className="mt-16 pt-8 border-t border-[var(--border)] flex gap-4 flex-wrap">
          <Link
            href="/astrology/astrologer"
            className="btn-primary inline-flex"
          >
            {t(locale, "astro.talk")}
          </Link>
          <Link href="/astrology" className="btn-ghost inline-flex">
            {t(locale, "fc.back")}
          </Link>
        </div>
      </section>
    </main>
  );
}

function Terrain({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <p className="eyebrow mb-3 text-[var(--accent)]">{label}</p>
      <div className="text-[var(--foreground-muted)] text-sm">
        <ProseBlock
          text={body}
          lookup={EMPTY_LOOKUP}
          optimisticBaseUrl={OB_BASE_URL}
          className="leading-relaxed mb-3 last:mb-0"
        />
      </div>
    </div>
  );
}

function currentMonthLabel(locale: Locale): string {
  const now = new Date();
  return now.toLocaleString(locale === "es" ? "es-ES" : "en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
