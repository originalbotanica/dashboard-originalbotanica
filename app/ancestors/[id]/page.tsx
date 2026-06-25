import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionStatus } from "@/lib/subscription";
import { Candle } from "@/components/candle";
import { MemorialForm } from "@/components/memorial-form";
import { updateAncestorAction, deleteAncestorAction } from "../actions";

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

  const dates = formatDates(memorial.birth_date, memorial.death_date);

  return (
    <main className="min-h-screen">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/ancestors" className="nav-link text-[var(--accent)]">
            ← Ancestors altar
          </Link>
          <p className="sublabel text-xs">{memorial.name}</p>
        </div>
      </header>

      {/* Memorial hero */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-12 text-center">
        <Candle
          size="large"
          lit={!!memorial.flame_lit}
          photoUrl={memorial.photo_url}
          alt={`Candle for ${memorial.name}`}
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

        {memorial.is_public && memorial.hash && (
          <div className="mt-6 inline-flex flex-col items-center border border-[var(--border)] rounded-lg p-4 bg-[var(--surface)]">
            <p className="eyebrow mb-2">Share with family</p>
            <code className="text-sm text-[var(--accent)] break-all">
              https://dashboard-originalbotanica.vercel.app/candle/{memorial.hash}
            </code>
            {memorial.light_count > 0 && (
              <p className="text-xs text-[var(--foreground-subtle)] mt-2">
                {memorial.light_count}{" "}
                {memorial.light_count === 1 ? "person has" : "people have"} added
                their light
              </p>
            )}
          </div>
        )}
      </section>

      {/* Edit form */}
      <section className="max-w-2xl mx-auto px-6 pb-24">
        <div className="border-t border-[var(--border)] pt-12">
          <p className="eyebrow mb-4">Edit memorial</p>
          {sp.error && <p className="form-error mb-4">{sp.error}</p>}
          {sp.saved && <p className="form-success mb-4">Changes saved.</p>}
          <MemorialForm
            action={updateAncestorAction}
            initial={memorial}
            submitLabel="Save changes"
          />
        </div>

        <div className="mt-16 border-t border-[var(--border)] pt-8">
          <p className="eyebrow mb-3 text-[var(--ember)]">Danger zone</p>
          <p className="text-sm text-[var(--foreground-muted)] mb-4 leading-relaxed max-w-lg">
            Removing a memorial extinguishes the flame and deletes the
            record permanently. This cannot be undone.
          </p>
          <form action={deleteAncestorAction}>
            <input type="hidden" name="id" value={memorial.id} />
            <button
              type="submit"
              className="nav-link text-[var(--ember)] hover:underline"
            >
              Remove this memorial
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

function formatDates(birth?: string | null, death?: string | null): string {
  const fmt = (s?: string | null) =>
    s
      ? new Date(s + "T00:00:00Z").toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
          timeZone: "UTC",
        })
      : null;
  const b = fmt(birth);
  const d = fmt(death);
  if (b && d) return `${b} — ${d}`;
  if (d) return `Passed ${d}`;
  if (b) return `Born ${b}`;
  return "";
}
