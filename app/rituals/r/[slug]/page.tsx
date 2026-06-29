import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionStatus } from "@/lib/subscription";
import { getPurpose, purposeLabel } from "@/lib/rituals/purposes";
import {
  getRitualBySlug,
  dayLabel,
  getSavedRitualIds,
  listRitualsByPurpose,
} from "@/lib/rituals/queries";
import { materialUrl } from "@/lib/rituals/material-link";
import { SaveRitualButton } from "@/components/save-ritual-button";
import { RitualCard } from "@/components/ritual-card";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionary";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const r = await getRitualBySlug(slug);
  return { title: r ? r.title_en : "Ritual" };
}

export default async function RitualDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
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

  const r = await getRitualBySlug(slug);
  if (!r) notFound();

  const savedIds = await getSavedRitualIds(user.id);
  const saved = savedIds.has(r.id);
  const locale = await getLocale();
  const purpose = r.purpose ? getPurpose(r.purpose) : undefined;
  const day = dayLabel(r.best_day_of_week, locale);
  const backHref = purpose ? `/rituals/${purpose.slug}` : "/rituals";
  const related = r.purpose
    ? (await listRitualsByPurpose(r.purpose))
        .filter((x) => x.slug !== r.slug)
        .slice(0, 3)
    : [];

  return (
    <main className="min-h-screen">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href={backHref} className="nav-link text-[var(--accent)]">
            ← {purpose ? purposeLabel(purpose, locale) : t(locale, "rit.library")}
          </Link>
          <p className="sublabel text-xs">{t(locale, "rit.ritualTag")}</p>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-6 pt-16 pb-24">
        {purpose ? <p className="eyebrow mb-3">{purposeLabel(purpose, locale)}</p> : null}
        <h1 className="display text-3xl md:text-5xl leading-tight mb-5">
          {r.title_en}
        </h1>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-8 text-[var(--foreground-subtle)]">
          {r.tradition ? <span className="eyebrow">{prettyTradition(r.tradition)}</span> : null}
          {r.difficulty ? <span className="eyebrow">{r.difficulty}</span> : null}
          {day ? <span className="eyebrow">{t(locale, "rit.bestOn", { day })}</span> : null}
          {r.best_moon_phase ? <span className="eyebrow">{r.best_moon_phase} {t(locale, "rit.moonWord")}</span> : null}
        </div>

        <div className="mb-10">
          <SaveRitualButton ritualId={r.id} initialSaved={saved} />
        </div>

        {/* Hero image — the source post's art or the video thumbnail. */}
        {r.image_url ? (
          <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-[var(--border)] mb-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={r.image_url}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        ) : null}

        {r.summary ? (
          <p className="invocation text-lg text-[var(--foreground)] leading-relaxed mb-10">
            {r.summary}
          </p>
        ) : null}

        {/* Materials */}
        {r.materials.length > 0 ? (
          <section className="mb-10">
            <p className="eyebrow mb-4">{t(locale, "rit.whatYouNeed")}</p>
            <ul className="space-y-2">
              {r.materials.map((m, i) => (
                <li key={i} className="text-[var(--foreground-muted)] leading-relaxed">
                  <a
                    href={materialUrl(m)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--accent)] hover:underline"
                  >
                    {m.name}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* Steps */}
        {r.steps.length > 0 ? (
          <section className="mb-10">
            <p className="eyebrow mb-4">{t(locale, "rit.theRitual")}</p>
            <ol className="space-y-5">
              {r.steps.map((s, i) => (
                <li key={i} className="flex gap-4">
                  <span className="display text-[var(--accent)] text-lg shrink-0 w-7">
                    {i + 1}
                  </span>
                  <span className="text-[var(--foreground-muted)] leading-relaxed pt-0.5">
                    {s}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {/* Warnings */}
        {r.warnings ? (
          <div className="border-l-2 border-[var(--ember)] pl-4 py-2 text-[var(--foreground-muted)] leading-relaxed mb-10">
            {r.warnings}
          </div>
        ) : null}

        {/* Source */}
        {r.source_url ? (
          <p className="text-[var(--foreground-subtle)] text-sm">
            {t(locale, r.source_type === "youtube" ? "rit.sourceChannel" : "rit.sourceBlog")}
            <a
              href={r.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline"
            >
              {t(locale, r.source_type === "youtube" ? "rit.watchVideo" : "rit.readOriginal")}
            </a>
            .
          </p>
        ) : null}
      </article>

      {related.length > 0 ? (
        <section className="max-w-5xl mx-auto px-6 pb-24 border-t border-[var(--border)] pt-12">
          <p className="eyebrow mb-2">{t(locale, "rit.moreLikeThis")}</p>
          <p className="text-[var(--foreground-muted)] leading-relaxed mb-8 max-w-2xl">
            {purpose
              ? t(locale, "rit.moreForPurpose", { purpose: purposeLabel(purpose, locale).toLowerCase() })
              : t(locale, "rit.moreFromLibrary")}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((x) => (
              <RitualCard key={x.slug} ritual={x} saved={savedIds.has(x.id)} locale={locale} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

function prettyTradition(t: string): string {
  switch (t) {
    case "lucumi":
      return "Lucumí";
    case "espiritismo":
      return "Espiritismo";
    case "hoodoo":
      return "Hoodoo";
    case "folk_catholic":
      return "Folk Catholic";
    default:
      return "General";
  }
}
