import Link from "next/link";
import { MemberNav } from "@/components/member-nav";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionStatus } from "@/lib/subscription";
import { PURPOSES, OB_CDN, purposeLabel, purposeBlurb } from "@/lib/rituals/purposes";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionary";
import {
  getPurposeCounts,
  searchRituals,
  getSavedRitualIds,
  getPurposeCovers,
} from "@/lib/rituals/queries";
import { RitualCard } from "@/components/ritual-card";

export const metadata = {
  title: "Ritual library",
  description:
    "Sixty-six years of practice in the Bronx, curated and organized by purpose. Search by your need, browse by intention.",
};

export default async function RitualsLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
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
  if (!sub.isActive) redirect("/tools/rituals");

  const locale = await getLocale();
  const query = (q || "").trim();
  const [counts, results, savedIds, covers] = await Promise.all([
    getPurposeCounts(),
    query ? searchRituals(query) : Promise.resolve([]),
    getSavedRitualIds(user.id),
    getPurposeCovers(),
  ]);

  // Only show shelves that have at least one published ritual.
  const shelves = PURPOSES.filter((p) => (counts[p.slug] || 0) > 0);

  return (
    <main className="min-h-screen">
      <MemberNav />

      <section className="max-w-5xl mx-auto px-6 pt-16 pb-10">
        <p className="eyebrow mb-3 text-[var(--foreground-muted)]">{t(locale, "rit.archiveEyebrow")}</p>
        <h1 className="display text-3xl md:text-5xl leading-tight mb-5">
          {t(locale, "rit.homeTitle")}
        </h1>
        <p className="text-[var(--foreground-muted)] text-lg leading-relaxed max-w-2xl mb-4">
          {t(locale, "rit.homeIntro")}
        </p>
        <p className="text-[var(--foreground-subtle)] text-sm leading-relaxed max-w-2xl mb-8">
          {t(locale, "rit.homeGrowing")}
        </p>

        <form action="/rituals" method="get" className="max-w-xl">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder={t(locale, "rit.searchPlaceholder")}
            className="form-input"
            aria-label={t(locale, "rit.searchAria")}
          />
        </form>

        <p className="mt-5">
          <Link
            href="/rituals/saved"
            className="nav-link text-[var(--accent)] inline-flex items-center gap-2"
          >
            {t(locale, "rit.savedLink")}
            <span aria-hidden>→</span>
          </Link>
        </p>
      </section>

      {query ? (
        <section className="max-w-5xl mx-auto px-6 pb-24">
          <p className="eyebrow mb-6">
            {t(locale, results.length === 1 ? "rit.resultOne" : "rit.resultMany", { n: results.length })}{" "}
            &ldquo;{query}&rdquo;
          </p>
          {results.length === 0 ? (
            <p className="text-[var(--foreground-muted)] leading-relaxed">
              {t(locale, "rit.noMatchPre")}
              <Link href="/rituals" className="text-[var(--accent)]">
                {t(locale, "rit.libraryHome")}
              </Link>
              .
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((r) => (
                <RitualCard key={r.slug} ritual={r} saved={savedIds.has(r.id)} locale={locale} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="max-w-5xl mx-auto px-6 pb-24">
          {shelves.length === 0 ? (
            <div className="border-l-2 border-[var(--accent)] pl-4 py-2 invocation text-[var(--foreground-muted)] max-w-lg">
              {t(locale, "rit.indexing")}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {shelves.map((p) => (
                <Link
                  key={p.slug}
                  href={`/rituals/${p.slug}`}
                  className="group block rounded-xl overflow-hidden border border-[var(--border)] hover:border-[var(--accent)] transition-colors"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={covers[p.slug] || `${OB_CDN}${p.image}`}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(180deg, transparent 45%, rgba(13,10,7,0.7) 100%)",
                      }}
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-baseline justify-between gap-3">
                      <h2 className="display text-xl leading-tight">{purposeLabel(p, locale)}</h2>
                      <span className="eyebrow text-[var(--foreground-subtle)] shrink-0">
                        {counts[p.slug]}
                      </span>
                    </div>
                    <p className="text-[var(--foreground-muted)] text-sm leading-relaxed mt-2">
                      {purposeBlurb(p, locale)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
