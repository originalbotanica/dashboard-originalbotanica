import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionStatus } from "@/lib/subscription";
import { getSaintCandle } from "@/lib/altar/catalog";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionary";
import { SaintCandleLighter } from "@/components/saint-candle-lighter";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const saint = getSaintCandle(slug);
  return { title: saint ? saint.name : "Light a candle" };
}

export default async function SaintCandlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const saint = getSaintCandle(slug);
  if (!saint) redirect("/altar/virtual/new");

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

  const locale = await getLocale();

  return (
    <main className="min-h-screen">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/altar/virtual" className="nav-link text-[var(--accent)]">
            ← {t(locale, "nav.altar")}
          </Link>
          <p className="sublabel text-xs">{t(locale, "saint.eyebrow")}</p>
        </div>
      </header>

      <section className="max-w-2xl mx-auto px-6 pt-12 pb-24 text-center">
        <p className="eyebrow mb-3 text-[var(--foreground-muted)]">
          {t(locale, "saint.eyebrow")}
        </p>
        <h1 className="display text-3xl md:text-4xl leading-tight mb-2">
          {saint.name}
        </h1>
        <p className="text-[var(--foreground-muted)] mb-10">{saint.tagline}</p>

        <SaintCandleLighter
          slug={saint.slug}
          name={saint.name}
          color={saint.saintColor ?? "var(--accent)"}
          intention={saint.saintIntention ?? saint.name}
          locale={locale}
        />
      </section>
    </main>
  );
}
