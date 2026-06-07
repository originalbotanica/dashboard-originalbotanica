import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionStatus } from "@/lib/subscription";
import { deleteCompatibilityAction } from "../actions";
import type { CompatibilityContent } from "@/lib/compatibility/prompt";
import { ProseBlock, buildProductLookup } from "@/lib/rag/render-prose";
import { BotanicaRecs } from "@/components/botanica-recs";

const EMPTY_LOOKUP = buildProductLookup([]);
const OB_BASE_URL = "https://originalbotanica.com";

export const metadata = {
  title: "Reading",
};

export default async function CompatibilityReadingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  const { data: reading } = await supabase
    .from("compatibility_readings")
    .select(
      "id, other_name, other_birth_date, other_birth_city, relationship_note, content, created_at, retrieved_product_slugs, retrieved_sources",
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!reading) notFound();

  const content = reading.content as CompatibilityContent;

  return (
    <main className="min-h-screen">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/astrology/compatibility"
            className="nav-link text-[var(--accent)]"
          >
            ← Compatibility
          </Link>
          <p className="sublabel text-xs">You and {reading.other_name}</p>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 pt-16 pb-24">
        <p className="eyebrow mb-4">Synastry reading</p>
        <h1 className="display text-3xl md:text-4xl mb-3 leading-tight">
          {profile.first_name} and {reading.other_name}.
        </h1>
        <p className="text-sm text-[var(--foreground-subtle)] mb-12">
          {reading.other_name} born{" "}
          {formatDate(reading.other_birth_date as string)} in{" "}
          {reading.other_birth_city}.
        </p>

        {/* Opening */}
        <article className="text-[var(--foreground)] mb-14">
          <ProseBlock
            text={content.opening}
            lookup={EMPTY_LOOKUP}
            optimisticBaseUrl={OB_BASE_URL}
            className="leading-relaxed text-lg mb-5 last:mb-0"
          />
        </article>

        {/* Dynamics — three structured sections */}
        {content.dynamics?.length > 0 && (
          <section className="border-t border-[var(--border)] pt-10 mb-14">
            <div className="space-y-10">
              {content.dynamics.map((d, i) => (
                <div key={i}>
                  <p className="eyebrow mb-3 text-[var(--accent)]">{d.name}</p>
                  <div className="text-[var(--foreground-muted)]">
                    <ProseBlock
                      text={d.body}
                      lookup={EMPTY_LOOKUP}
                      optimisticBaseUrl={OB_BASE_URL}
                      className="leading-relaxed mb-4 last:mb-0"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Shared ritual */}
        {content.shared_ritual && (
          <section className="border-t border-[var(--border)] pt-10">
            <p className="eyebrow mb-4">A shared ritual</p>
            <h2 className="display text-2xl md:text-3xl mb-2 leading-tight">
              {content.shared_ritual.title}
            </h2>
            <p className="invocation text-base text-[var(--accent)] mb-6">
              {content.shared_ritual.when}
            </p>
            <div className="text-[var(--foreground-muted)]">
              <ProseBlock
                text={content.shared_ritual.what}
                lookup={EMPTY_LOOKUP}
                optimisticBaseUrl={OB_BASE_URL}
                className="leading-relaxed mb-4 last:mb-0"
              />
            </div>
          </section>
        )}

        {/* Inline ritual + product recommendations from the botanica */}
        <BotanicaRecs
          userId={user.id}
          productSlugs={(reading.retrieved_product_slugs as string[]) || []}
          sourceSlugs={(
            (reading.retrieved_sources as Array<{ slug: string }>) || []
          ).map((s) => s.slug)}
          heading="For the two of you"
        />

        {/* Footer actions */}
        <div className="mt-16 pt-8 border-t border-[var(--border)] flex gap-4 flex-wrap items-center">
          <Link
            href="/astrology/compatibility"
            className="btn-ghost inline-flex"
          >
            All readings
          </Link>
          <Link href="/astrology" className="nav-link text-[var(--accent)]">
            Astrology hub
          </Link>
          <form action={deleteCompatibilityAction} className="ml-auto">
            <input type="hidden" name="id" value={reading.id} />
            <button
              type="submit"
              className="nav-link text-[var(--ember)] hover:underline"
            >
              Delete this reading
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

function formatDate(yyyyMmDd: string): string {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
