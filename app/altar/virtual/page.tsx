import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionStatus } from "@/lib/subscription";
import {
  listMyCandles,
  listCommunityCandles,
  daysLeft,
  type Candle,
} from "@/lib/altar/altar";
import { AltarCandle } from "@/components/altar-candle";

export const metadata = {
  title: "Virtual altar",
  description:
    "Light a virtual prayer candle, set your intention, and join the community altar.",
};

const OB_CDN = "https://dlkhclkmyx18n.cloudfront.net";

export default async function VirtualAltarPage({
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
  if (!sub.isActive) redirect("/tools/virtual-altar");

  const query = (q || "").trim();
  const [mine, community] = await Promise.all([
    listMyCandles(user.id),
    listCommunityCandles(query),
  ]);

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

      <header className="border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="nav-link text-[var(--accent)]">
            ← Dashboard
          </Link>
          <p className="sublabel text-xs">Virtual altar</p>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 pt-20 pb-12 text-center">
        <p className="eyebrow mb-4">The virtual altar</p>
        <h1 className="display text-4xl md:text-5xl mb-5 max-w-2xl mx-auto leading-tight">
          Light a candle. Set your prayer aloft.
        </h1>
        <p className="text-[var(--foreground-muted)] text-lg leading-relaxed max-w-xl mx-auto mb-10">
          A sacred space where intention meets the flame. Light your candle, and
          let the collective energy of the community hold it with you.
        </p>
        <Link href="/altar/virtual/new" className="btn-primary inline-flex">
          Light a candle
        </Link>
      </section>

      {/* Your candles */}
      {mine.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 pb-16">
          <p className="eyebrow mb-8 text-center">Your altar</p>
          <CandleGrid candles={mine} />
        </section>
      )}

      {/* Community altar */}
      <section className="max-w-5xl mx-auto px-6 pb-24 border-t border-[var(--border)] pt-14">
        <p className="eyebrow mb-2 text-center">The community altar</p>
        <p className="text-[var(--foreground-muted)] leading-relaxed text-center max-w-xl mx-auto mb-8">
          Candles lit by the community, burning now. Search by name or
          intention.
        </p>

        <form action="/altar/virtual" method="get" className="max-w-md mx-auto mb-12">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Name or keyword"
            className="form-input"
            aria-label="Search the altar"
          />
        </form>

        {community.length === 0 ? (
          <p className="text-[var(--foreground-muted)] text-center leading-relaxed">
            {query
              ? `No candles match "${query}".`
              : "No candles are burning yet. Be the first to light one."}
          </p>
        ) : (
          <CandleGrid candles={community} />
        )}
      </section>
    </main>
  );
}

function CandleGrid({ candles }: { candles: Candle[] }) {
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
            <AltarCandle color={c.candle_color} />
            <p className="display text-sm mt-5 group-hover:text-[var(--accent)] transition-colors line-clamp-2">
              {c.intention}
            </p>
            {left !== null && (
              <p className="text-xs text-[var(--foreground-subtle)] mt-1">
                {left > 0
                  ? `${left} ${left === 1 ? "day" : "days"} left`
                  : "Burned out"}
              </p>
            )}
          </Link>
        );
      })}
    </div>
  );
}
