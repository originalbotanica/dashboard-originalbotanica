import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionStatus } from "@/lib/subscription";
import { getCandle, getDesire, daysLeft } from "@/lib/altar/altar";
import { AltarCandle } from "@/components/altar-candle";
import { listRitualsByPurpose, getSavedRitualIds } from "@/lib/rituals/queries";
import { RitualCard } from "@/components/ritual-card";
import { extinguishCandleAction } from "../actions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const candle = await getCandle(id);
  return { title: candle ? candle.intention : "A candle" };
}

export default async function CandleDetailPage({
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
  if (!sub.isActive) redirect("/tools/virtual-altar");

  const candle = await getCandle(id);
  if (!candle) notFound();

  const { data: owned } = await supabase
    .from("candles")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  const isOwner = !!owned;

  const desire = getDesire(candle.candle_type);
  const left = daysLeft(candle.expires_at);

  const [rituals, savedIds] = await Promise.all([
    desire ? listRitualsByPurpose(desire.purpose) : Promise.resolve([]),
    getSavedRitualIds(user.id),
  ]);

  return (
    <main className="min-h-screen">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/altar/virtual" className="nav-link text-[var(--accent)]">
            ← Altar
          </Link>
          <p className="sublabel text-xs">A candle</p>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="flex justify-center mb-10">
          <AltarCandle color={candle.candle_color} size="hero" />
        </div>

        {desire ? <p className="eyebrow mb-3">{desire.label}</p> : null}
        <h1 className="display text-3xl md:text-4xl leading-tight mb-4 max-w-2xl mx-auto">
          {candle.intention}
        </h1>
        {left !== null && (
          <p className="text-[var(--foreground-subtle)] eyebrow">
            {left > 0 ? `Burning · ${left} ${left === 1 ? "day" : "days"} left` : "Burned out"}
          </p>
        )}

        {candle.petition ? (
          <div className="invocation text-lg text-[var(--foreground)] leading-relaxed mt-10 border-l-2 border-[var(--accent)] pl-4 py-2 text-left max-w-xl mx-auto whitespace-pre-line">
            {candle.petition}
          </div>
        ) : null}

        {isOwner ? (
          <form action={extinguishCandleAction} className="mt-10">
            <input type="hidden" name="id" value={candle.id} />
            <button
              type="submit"
              className="nav-link text-[var(--ember)] hover:underline"
            >
              Extinguish this candle
            </button>
          </form>
        ) : null}
      </section>

      {/* Rituals for this intention */}
      {rituals.length > 0 && desire ? (
        <section className="max-w-5xl mx-auto px-6 pb-24 border-t border-[var(--border)] pt-12">
          <p className="eyebrow mb-2 text-center">To deepen the work</p>
          <p className="text-[var(--foreground-muted)] leading-relaxed text-center max-w-xl mx-auto mb-8">
            Rituals from the library for {desire.label.toLowerCase()}.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rituals.slice(0, 3).map((r) => (
              <RitualCard key={r.slug} ritual={r} saved={savedIds.has(r.id)} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
