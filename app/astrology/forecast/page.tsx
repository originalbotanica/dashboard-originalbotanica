import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionStatus } from "@/lib/subscription";
import { getOrGenerateMonthlyForecast } from "@/lib/forecast/generate";

export const metadata = {
  title: "Your monthly forecast | Original Botanica",
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

  const forecast = await getOrGenerateMonthlyForecast(user.id);

  const monthLabel = currentMonthLabel();

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
            ← Astrology
          </Link>
          <p className="sublabel text-xs">{monthLabel}</p>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 pt-20 pb-24">
        <p className="eyebrow mb-4">Your monthly forecast</p>
        <h1 className="display text-4xl md:text-5xl mb-10 leading-tight">
          {profile.first_name}, {monthLabel}.
        </h1>

        {!forecast ? (
          <div className="invocation text-[var(--foreground-muted)] border-l-2 border-[var(--ember)] pl-4 py-2 max-w-xl">
            The forecast could not be generated right now. Please refresh
            the page in a moment.
          </div>
        ) : (
          <>
            {/* Opening */}
            <article className="prose-invocation text-[var(--foreground)] leading-relaxed text-lg whitespace-pre-wrap mb-16">
              {forecast.content.opening}
            </article>

            {/* Key dates */}
            {forecast.content.key_dates &&
              forecast.content.key_dates.length > 0 && (
                <section className="mb-16 border-t border-[var(--border)] pt-10">
                  <p className="eyebrow mb-6">Dates to mark</p>
                  <ul className="space-y-6">
                    {forecast.content.key_dates.map((kd, i) => (
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
                          {kd.what_to_do}
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

            {/* Three terrains: love, work, spirit */}
            <section className="grid md:grid-cols-3 gap-8 mb-16 border-t border-[var(--border)] pt-10">
              <Terrain label="Love" body={forecast.content.love} />
              <Terrain label="Work" body={forecast.content.work} />
              <Terrain label="Spirit" body={forecast.content.spirit} />
            </section>

            {/* Ritual for the month */}
            <section className="border-t border-[var(--border)] pt-10">
              <p className="eyebrow mb-4">A ritual for this month</p>
              <h2 className="display text-2xl md:text-3xl mb-2 leading-tight">
                {forecast.content.ritual.title}
              </h2>
              <p className="invocation text-base text-[var(--accent)] mb-6">
                {forecast.content.ritual.when}
              </p>
              <p className="text-[var(--foreground-muted)] leading-relaxed whitespace-pre-wrap">
                {forecast.content.ritual.what}
              </p>
            </section>
          </>
        )}

        <div className="mt-16 pt-8 border-t border-[var(--border)] flex gap-4 flex-wrap">
          <Link
            href="/astrology/astrologer"
            className="btn-primary inline-flex"
          >
            Talk to your astrologer
          </Link>
          <Link href="/astrology" className="btn-ghost inline-flex">
            Back to astrology
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
      <p className="text-[var(--foreground-muted)] leading-relaxed text-sm whitespace-pre-wrap">
        {body}
      </p>
    </div>
  );
}

function currentMonthLabel(): string {
  const now = new Date();
  return now.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
