import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionStatus } from "@/lib/subscription";
import { getCandle, getDesire, getCandleArt, daysLeft, desireLabel } from "@/lib/altar/altar";
import { AltarCandle } from "@/components/altar-candle";
import { listRitualsByPurpose, getSavedRitualIds } from "@/lib/rituals/queries";
import { RitualCard } from "@/components/ritual-card";
import { extinguishCandleAction, tendCandleAction } from "../actions";
import { getTendingState } from "@/lib/altar/tend";
import { headers } from "next/headers";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionary";
import { PendingSubmit } from "@/components/pending-submit";

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

  const candle = await getCandle(id, user.id);
  if (!candle) notFound();

  const { data: owned } = await supabase
    .from("candles")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  const isOwner = !!owned;

  const locale = await getLocale();
  const desire = getDesire(candle.candle_type);
  const art = getCandleArt(candle.candle_color);
  const left = daysLeft(candle.expires_at);
  const burning = left !== null && left > 0;

  // Tending — the daily act of holding the intention (owner only).
  const memberTz = (await headers()).get("x-vercel-ip-timezone");
  const tending =
    isOwner && burning
      ? await getTendingState(candle.id, candle.lit_at, candle.expires_at, memberTz)
      : null;

  const [rituals, savedIds] = await Promise.all([
    desire ? listRitualsByPurpose(desire.purpose) : Promise.resolve([]),
    getSavedRitualIds(user.id),
  ]);

  return (
    <main className="min-h-screen">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/altar/virtual" className="nav-link text-[var(--accent)]">
            ← {t(locale, "altar.back")}
          </Link>
          <p className="sublabel text-xs">{t(locale, "altar.candleSublabel")}</p>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="flex justify-center mb-10">
          <AltarCandle
            candleSlug={candle.candle_color}
            size="hero"
            bright={!!tending?.tendedToday}
          />
        </div>

        {desire ? <p className="eyebrow mb-3">{desireLabel(desire, locale)}</p> : null}
        {art ? (
          <p className="text-[var(--foreground-muted)] text-sm mb-3">
            {art.name} · {art.tagline}
          </p>
        ) : null}
        <h1 className="display text-3xl md:text-4xl leading-tight mb-4 max-w-2xl mx-auto">
          {candle.intention}
        </h1>
        {left !== null && (
          <p className="text-[var(--foreground-subtle)] eyebrow">
            {left > 0
              ? t(locale, left === 1 ? "altar.burningOne" : "altar.burningMany", { n: left })
              : t(locale, "altar.burnedOut")}
          </p>
        )}

        {/* Tending — return each day the candle burns to hold the intention. */}
        {tending && (
          <div className="mt-8">
            {tending.tendedToday ? (
              <>
                <p className="invocation text-[var(--accent)]">
                  {t(locale, "tend.done")}
                </p>
                <p className="text-sm text-[var(--foreground-subtle)] mt-2">
                  {t(locale, "tend.count", {
                    n: tending.daysTended,
                    d: tending.totalDays,
                  })}
                </p>
              </>
            ) : (
              <form action={tendCandleAction}>
                <input type="hidden" name="id" value={candle.id} />
                <PendingSubmit
                  label={t(locale, "tend.btn")}
                  pendingLabel={t(locale, "tend.pending")}
                />
                <p className="text-sm text-[var(--foreground-subtle)] mt-3 max-w-sm mx-auto leading-relaxed">
                  {tending.daysTended > 0
                    ? t(locale, "tend.count", {
                        n: tending.daysTended,
                        d: tending.totalDays,
                      })
                    : t(locale, "tend.hint")}
                </p>
              </form>
            )}
          </div>
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
              className="nav-link text-sm text-[var(--foreground-muted)] underline underline-offset-4 decoration-[var(--border-strong)] hover:text-[var(--ember)] hover:decoration-[var(--ember)] cursor-pointer transition-colors"
            >
              {t(locale, "altar.remove")}
            </button>
          </form>
        ) : null}
      </section>

      {/* Rituals for this intention */}
      {rituals.length > 0 && desire ? (
        <section className="max-w-5xl mx-auto px-6 pb-24 border-t border-[var(--border)] pt-12">
          <p className="eyebrow mb-2 text-center">{t(locale, "altar.deepenEyebrow")}</p>
          <p className="text-[var(--foreground-muted)] leading-relaxed text-center max-w-xl mx-auto mb-8">
            {t(locale, "altar.deepenIntro", { purpose: desireLabel(desire, locale).toLowerCase() })}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rituals.slice(0, 3).map((r) => (
              <RitualCard key={r.slug} ritual={r} saved={savedIds.has(r.id)} locale={locale} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
