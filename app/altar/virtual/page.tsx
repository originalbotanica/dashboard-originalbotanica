import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { MemberNav } from "@/components/member-nav";
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionStatus } from "@/lib/subscription";
import {
  listMyCandles,
  listCommunityCandles,
  daysLeft,
  DESIRES,
  desireLabel,
  type Candle,
} from "@/lib/altar/altar";
import { AltarCandle } from "@/components/altar-candle";
import { Candle as FlameCandle } from "@/components/candle";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/dictionary";

export const metadata = {
  title: "Virtual altar",
  description:
    "Light a virtual prayer candle, set your intention, and join the community altar.",
};

const OB_CDN = "https://dlkhclkmyx18n.cloudfront.net";

export default async function VirtualAltarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; desire?: string }>;
}) {
  const { q, desire: desireParam } = await searchParams;
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

  const query = (q || "").trim();
  const desire = (desireParam || "").trim() || undefined;
  const [mine, community] = await Promise.all([
    listMyCandles(user.id),
    listCommunityCandles(query, desire),
  ]);
  const locale = await getLocale();

  return (
    <main className="min-h-screen relative">
      <div className="absolute inset-0 -z-10">
        <Image
          src={`${OB_CDN}/transforms/_miscImage/virtual-candle-altar.jpg`}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-20"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(20,16,11,0.92) 0%, rgba(20,16,11,0.97) 100%)",
          }}
        />
      </div>

      <MemberNav />

      <section className="max-w-5xl mx-auto px-6 pt-20 pb-12 text-center">
        <p className="eyebrow mb-4">{t(locale, "altar.eyebrow")}</p>
        <h1 className="display text-4xl md:text-5xl mb-5 max-w-2xl mx-auto leading-tight">
          {t(locale, "altar.title")}
        </h1>
        <p className="text-[var(--foreground-muted)] text-lg leading-relaxed max-w-xl mx-auto mb-8">
          {t(locale, "altar.intro")}
        </p>
        <div className="flex justify-center mt-12 mb-10" aria-hidden>
          <FlameCandle size="large" lit />
        </div>
        <Link href="/altar/virtual/new" className="btn-primary inline-flex">
          {t(locale, "altar.lightCta")}
        </Link>
      </section>

      {/* Your candles */}
      {mine.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 pb-16">
          <p className="eyebrow mb-8 text-center">{t(locale, "altar.yourAltar")}</p>
          <CandleGrid candles={mine} locale={locale} />
        </section>
      )}

      {/* Community altar */}
      <section className="max-w-5xl mx-auto px-6 pb-24 border-t border-[var(--border)] pt-14">
        <p className="eyebrow mb-2 text-center">{t(locale, "altar.communityEyebrow")}</p>
        <p className="text-[var(--foreground-muted)] leading-relaxed text-center max-w-xl mx-auto mb-8">
          {t(locale, "altar.communityIntro")}
        </p>

        <form action="/altar/virtual" method="get" className="max-w-md mx-auto mb-12">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder={t(locale, "altar.searchPh")}
            className="form-input"
            aria-label={t(locale, "altar.searchAria")}
          />
        </form>

        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <Link
            href={query ? `/altar/virtual?q=${encodeURIComponent(query)}` : "/altar/virtual"}
            className={`eyebrow rounded-full px-3 py-1 border transition-colors ${
              !desire
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "border-[var(--border-strong)] text-[var(--foreground-muted)] hover:text-[var(--accent)]"
            }`}
          >
            {t(locale, "altar.all")}
          </Link>
          {DESIRES.map((d) => (
            <Link
              key={d.slug}
              href={`/altar/virtual?desire=${d.slug}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
              className={`eyebrow rounded-full px-3 py-1 border transition-colors ${
                desire === d.slug
                  ? "border-[var(--accent)] text-[var(--accent)]"
                  : "border-[var(--border-strong)] text-[var(--foreground-muted)] hover:text-[var(--accent)]"
              }`}
            >
              {desireLabel(d, locale)}
            </Link>
          ))}
        </div>

        {community.length === 0 ? (
          <p className="text-[var(--foreground-muted)] text-center leading-relaxed">
            {query || desire
              ? t(locale, "altar.noMatch")
              : t(locale, "altar.noneYet")}
          </p>
        ) : (
          <CandleGrid candles={community} locale={locale} />
        )}
      </section>
    </main>
  );
}

function CandleGrid({ candles, locale }: { candles: Candle[]; locale: Locale }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12">
      {candles.map((c) => {
        const left = daysLeft(c.expires_at);
        return (
          <Link
            key={c.id}
            href={`/altar/virtual/${c.id}`}
            className="group flex flex-col items-center text-center"
          >
            <AltarCandle candleSlug={c.candle_color} />
            <p className="display text-sm mt-5 group-hover:text-[var(--accent)] transition-colors line-clamp-2">
              {c.intention}
            </p>
            {left !== null && (
              <p className="text-xs text-[var(--foreground-subtle)] mt-1">
                {left > 0
                  ? t(locale, left === 1 ? "altar.dayLeftOne" : "altar.dayLeftMany", { n: left })
                  : t(locale, "altar.burnedOut")}
              </p>
            )}
          </Link>
        );
      })}
    </div>
  );
}
