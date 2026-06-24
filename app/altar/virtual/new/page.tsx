import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionStatus } from "@/lib/subscription";
import { LightCandleForm } from "@/components/light-candle-form";

export const metadata = { title: "Light a candle" };

export default async function LightCandlePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; intention?: string }>;
}) {
  const { error, intention } = await searchParams;
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

  return (
    <main className="min-h-screen">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/altar/virtual" className="nav-link text-[var(--accent)]">
            ← Altar
          </Link>
          <p className="sublabel text-xs">Light a candle</p>
        </div>
      </header>

      <section className="max-w-2xl mx-auto px-6 pt-14 pb-24">
        <p className="eyebrow mb-3 text-[var(--foreground-muted)]">The virtual altar</p>
        <h1 className="display text-3xl md:text-4xl leading-tight mb-3">
          Light a candle.
        </h1>
        <p className="text-[var(--foreground-muted)] leading-relaxed mb-10">
          Choose your intention and the candle that fits it, write your petition,
          and let the flame carry it. The candle burns here on the altar for the
          days you choose.
        </p>

        {error ? <p className="form-error mb-8">{error}</p> : null}

        <LightCandleForm initialIntention={intention} />
      </section>
    </main>
  );
}
