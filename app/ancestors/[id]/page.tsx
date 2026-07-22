import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionStatus } from "@/lib/subscription";
import { CandleWithOfferings } from "@/components/altar-offerings";
import { MakeOffering } from "@/components/make-offering";
import type { OfferingType } from "@/app/ancestors/actions";
import { MemorialForm } from "@/components/memorial-form";
import { ShareMemorialLink } from "@/components/share-memorial-link";
import { updateAncestorAction, deleteAncestorAction } from "../actions";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/dictionary";

export const metadata = {
  title: "Memorial",
};

/**
 * Memorial detail + edit page.
 *
 * Top: hero with the loved one's candle (with their photo), dates,
 * dedication, and the shareable family link.
 *
 * Below: editable form. The owner can update any field or remove the
 * memorial entirely.
 */
export default async function MemorialDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
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
  if (!sub.isActive) redirect("/tools/ancestors");

  const { data: memorial } = await supabase
    .from("ancestors")
    .select(
      "id, name, relation, birth_date, death_date, dedication, photo_url, hash, is_public, flame_lit, light_count, added_at",
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!memorial) notFound();

  const locale = await getLocale();
  const dates = formatDates(memorial.birth_date, memorial.death_date, locale);

  // Offerings on this memorial: total, most recent, what's actively on
  // the altar (last 7 days), and whether the owner already offered today.
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const [
    { count: offeringCount },
    { data: lastOffering },
    { data: recentOfferings },
    { count: mineToday },
  ] = await Promise.all([
    supabase
      .from("ancestor_offerings")
      .select("id", { count: "exact", head: true })
      .eq("ancestor_id", id),
    supabase
      .from("ancestor_offerings")
      .select("created_at")
      .eq("ancestor_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("ancestor_offerings")
      .select("offering_type")
      .eq("ancestor_id", id)
      .gte("created_at", weekAgo)
      .order("created_at", { ascending: false })
      .limit(40),
    supabase
      .from("ancestor_offerings")
      .select("id", { count: "exact", head: true })
      .eq("ancestor_id", id)
      .eq("user_id", user.id)
      .gte("created_at", new Date(Date.now() - 86_400_000).toISOString()),
  ]);
  const lastLine = lastOffering
    ? lastOfferingLine(lastOffering.created_at, locale)
    : null;
  const activeOfferings = [
    ...new Set((recentOfferings ?? []).map((o) => o.offering_type as OfferingType)),
  ];

  return (
    <main className="min-h-screen">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/ancestors" className="nav-link text-[var(--accent)]">
            ← {t(locale, "anc.eyebrow")}
          </Link>
          <p className="sublabel text-xs">{memorial.name}</p>
        </div>
      </header>

      {/* Memorial hero */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-12 text-center">
        <CandleWithOfferings
          lit={!!memorial.flame_lit}
          photoUrl={memorial.photo_url}
          alt={`Candle for ${memorial.name}`}
          offerings={activeOfferings}
        />
        <h1 className="display text-3xl md:text-4xl mt-8 mb-2 leading-tight">
          {memorial.name}
        </h1>
        {memorial.relation && (
          <p className="invocation text-base text-[var(--foreground-muted)] mb-2">
            {memorial.relation}
          </p>
        )}
        {dates && (
          <p className="text-sm text-[var(--foreground-subtle)] mb-8">
            {dates}
          </p>
        )}
        {memorial.dedication && (
          <p className="text-[var(--foreground-muted)] leading-relaxed max-w-xl mx-auto mb-8 whitespace-pre-wrap">
            {memorial.dedication}
          </p>
        )}

        {/* Offerings — the second devotional act, beside the candle. */}
        <div className="mt-4 mb-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] px-6 py-8 max-w-xl mx-auto">
          <p className="eyebrow mb-5">{t(locale, "off.eyebrow")}</p>
          <MakeOffering
            name={memorial.name}
            ancestorId={memorial.id}
            offeredToday={(mineToday ?? 0) >= 1}
          />
          {(lastLine || (offeringCount ?? 0) > 0) && (
            <p className="text-xs text-[var(--foreground-subtle)] mt-5">
              {lastLine}
              {lastLine && (offeringCount ?? 0) > 0 ? " · " : ""}
              {(offeringCount ?? 0) > 0 &&
                t(
                  locale,
                  offeringCount === 1 ? "off.countOne" : "off.countMany",
                  { n: offeringCount ?? 0 },
                )}
            </p>
          )}
          <p className="invocation text-base text-[var(--foreground-muted)] mt-4 leading-relaxed">
            {t(locale, "off.weekly")}
          </p>
        </div>

        {memorial.is_public && memorial.hash && (
          <div className="mt-6 inline-flex flex-col items-center border border-[var(--border)] rounded-lg p-4 bg-[var(--surface)]">
            <ShareMemorialLink
              url={`${process.env.NEXT_PUBLIC_SITE_URL || "https://members.originalbotanica.com"}/candle/${memorial.hash}`}
            />
            {memorial.light_count > 0 && (
              <p className="text-xs text-[var(--foreground-subtle)] mt-2">
                {t(locale, memorial.light_count === 1 ? "anc.lightAddedOne" : "anc.lightAddedMany", { n: memorial.light_count })}
              </p>
            )}
          </div>
        )}
      </section>

      {/* Edit form */}
      <section className="max-w-2xl mx-auto px-6 pb-24">
        <div className="border-t border-[var(--border)] pt-12">
          <p className="eyebrow mb-4">{t(locale, "anc.editEyebrow")}</p>
          {sp.error && <p className="form-error mb-4">{sp.error}</p>}
          {sp.saved && <p className="form-success mb-4">{t(locale, "anc.savedMsg")}</p>}
          <MemorialForm
            action={updateAncestorAction}
            initial={memorial}
            submitLabel={t(locale, "anc.saveChanges")}
          />
        </div>

        <div className="mt-16 border-t border-[var(--border)] pt-8">
          <p className="text-sm text-[var(--foreground-muted)] mb-4 leading-relaxed max-w-lg">
            {t(locale, "anc.removeBody")}
          </p>
          <form action={deleteAncestorAction}>
            <input type="hidden" name="id" value={memorial.id} />
            <button
              type="submit"
              className="nav-link text-[var(--ember)] hover:underline"
            >
              {t(locale, "anc.removeBtn")}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

function lastOfferingLine(createdAt: string, locale: Locale): string {
  const days = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / 86_400_000,
  );
  if (days <= 0) return t(locale, "off.lastToday");
  if (days === 1) return t(locale, "off.lastDay");
  return t(locale, "off.lastDays", { n: days });
}

function formatDates(birth: string | null | undefined, death: string | null | undefined, locale: Locale): string {
  const fmt = (s?: string | null) =>
    s
      ? new Date(s + "T00:00:00Z").toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
          timeZone: "UTC",
        })
      : null;
  const b = fmt(birth);
  const d = fmt(death);
  if (b && d) return `${b} - ${d}`;
  if (d) return t(locale, "anc.passed", { y: d });
  if (b) return t(locale, "anc.born", { y: b });
  return "";
}
