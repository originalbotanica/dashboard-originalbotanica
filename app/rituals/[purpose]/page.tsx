import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionStatus } from "@/lib/subscription";
import { getPurpose } from "@/lib/rituals/purposes";
import { listRitualsByPurpose } from "@/lib/rituals/queries";
import { RitualCard } from "@/components/ritual-card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ purpose: string }>;
}) {
  const { purpose } = await params;
  const p = getPurpose(purpose);
  return { title: p ? p.label : "Ritual library" };
}

export default async function PurposePage({
  params,
}: {
  params: Promise<{ purpose: string }>;
}) {
  const { purpose } = await params;
  const p = getPurpose(purpose);
  if (!p) notFound();

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

  const rituals = await listRitualsByPurpose(p.slug);

  return (
    <main className="min-h-screen">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/rituals" className="nav-link text-[var(--accent)]">
            ← Library
          </Link>
          <p className="sublabel text-xs">{p.label}</p>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 pt-16 pb-10">
        <p className="eyebrow mb-3 text-[var(--foreground-muted)]">Purpose</p>
        <h1 className="display text-3xl md:text-5xl leading-tight mb-4">
          {p.label}
        </h1>
        <p className="text-[var(--foreground-muted)] text-lg leading-relaxed max-w-2xl">
          {p.blurb}
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24">
        {rituals.length === 0 ? (
          <p className="text-[var(--foreground-muted)] leading-relaxed">
            No rituals on this shelf yet.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rituals.map((r) => (
              <RitualCard key={r.slug} ritual={r} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
