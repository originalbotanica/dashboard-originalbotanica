import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionStatus } from "@/lib/subscription";
import { createCompatibilityAction } from "./actions";
import { PendingSubmit } from "@/components/pending-submit";
import { getLocale } from "@/lib/i18n/server";
import { t, type Locale } from "@/lib/i18n/dictionary";

export const metadata = {
  title: "Compatibility",
};

const OB_CDN = "https://dlkhclkmyx18n.cloudfront.net";

/**
 * Compatibility hub — past readings + form to create a new one.
 *
 * Submitting the form takes ~10-15 seconds (AstrologyAPI chart compute
 * + Claude generation). The browser sees a normal POST + redirect; for
 * a future polish pass we could add an "Reading the charts…" interim
 * state, but for now we let the server action be synchronous.
 */
export default async function CompatibilityHubPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
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
  if (!profile.birth_date || !profile.birth_place) redirect("/astrology");

  const sub = await getSubscriptionStatus(user.id);
  if (!sub.isActive) redirect("/astrology");

  const { data: readings } = await supabase
    .from("compatibility_readings")
    .select(
      "id, other_name, other_birth_date, other_birth_city, created_at",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const locale = await getLocale();

  return (
    <main className="min-h-screen relative">
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
          <p className="sublabel text-xs">{t(locale, "cmp.sublabel")}</p>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 pt-20 pb-20">
        <p className="eyebrow mb-4">{t(locale, "cmp.sublabel")}</p>
        <h1 className="display text-4xl md:text-5xl mb-4 leading-tight">
          {t(locale, "cmp.title")}
        </h1>
        <p className="text-[var(--foreground-muted)] text-lg leading-relaxed max-w-2xl mb-10">
          {t(locale, "cmp.intro")}
        </p>

        {params.error && (
          <p className="form-error mb-6">{params.error}</p>
        )}

        {/* New reading form */}
        <form
          action={createCompatibilityAction}
          className="flex flex-col gap-5 border border-[var(--border)] rounded-xl p-6 bg-[var(--surface)] mb-16"
        >
          <p className="eyebrow">{t(locale, "cmp.newReading")}</p>
          <div>
            <label htmlFor="other_name" className="form-label">
              {t(locale, "cmp.theirName")}
            </label>
            <input
              id="other_name"
              name="other_name"
              type="text"
              required
              className="form-input"
              placeholder={t(locale, "cmp.theirNamePh")}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="other_birth_date" className="form-label">
                {t(locale, "cmp.theirBirthDate")}
              </label>
              <input
                id="other_birth_date"
                name="other_birth_date"
                type="date"
                required
                className="form-input"
              />
            </div>
            <div>
              <label htmlFor="other_birth_time" className="form-label">
                {t(locale, "cmp.theirBirthTime")}{" "}
                <span className="text-[var(--foreground-subtle)] normal-case tracking-normal">
                  {t(locale, "cmp.ifKnown")}
                </span>
              </label>
              <input
                id="other_birth_time"
                name="other_birth_time"
                type="time"
                className="form-input"
              />
            </div>
          </div>
          <div>
            <label htmlFor="other_birth_city" className="form-label">
              {t(locale, "cmp.theirBirthCity")}
            </label>
            <input
              id="other_birth_city"
              name="other_birth_city"
              type="text"
              required
              className="form-input"
              placeholder={t(locale, "cmp.cityPh")}
            />
          </div>
          <div>
            <label htmlFor="relationship_note" className="form-label">
              {t(locale, "cmp.address")}{" "}
              <span className="text-[var(--foreground-subtle)] normal-case tracking-normal">
                {t(locale, "cmp.optional")}
              </span>
            </label>
            <textarea
              id="relationship_note"
              name="relationship_note"
              rows={3}
              className="form-input"
              placeholder={t(locale, "cmp.addressPh")}
            />
          </div>
          <PendingSubmit
            label={t(locale, "cmp.submit")}
            pendingLabel={t(locale, "cmp.submitting")}
            className="btn-primary mt-2"
          />
          <p className="text-xs text-[var(--foreground-subtle)]">
            {t(locale, "cmp.submitNote")}
          </p>
        </form>

        {/* Past readings */}
        {readings && readings.length > 0 && (
          <section>
            <p className="eyebrow mb-6">{t(locale, "cmp.past")}</p>
            <ul className="space-y-3">
              {readings.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/astrology/compatibility/${r.id}`}
                    className="block border border-[var(--border)] rounded-lg px-5 py-4 hover:border-[var(--accent)] hover:bg-[var(--surface)] transition-colors"
                  >
                    <p className="display text-lg mb-1">
                      {t(locale, "cmp.youAnd", { name: r.other_name })}
                    </p>
                    <p className="text-xs text-[var(--foreground-subtle)]">
                      {formatRelative(r.created_at, locale)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </section>
    </main>
  );
}

function formatRelative(iso: string, locale: Locale): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  const diffD = Math.floor(diffH / 24);
  if (diffH < 1) return t(locale, "dr.justNow");
  if (diffH < 24) return t(locale, diffH === 1 ? "dr.hourAgo" : "dr.hoursAgo", { n: diffH });
  if (diffD < 7) return t(locale, diffD === 1 ? "dr.dayAgo" : "dr.daysAgo", { n: diffD });
  return date.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
