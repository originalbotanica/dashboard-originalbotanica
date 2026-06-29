import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionStatus } from "@/lib/subscription";
import { LightCandleForm } from "@/components/light-candle-form";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionary";

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

  const locale = await getLocale();

  return (
    <main className="min-h-screen">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/altar/virtual" className="nav-link text-[var(--accent)]">
            ← {t(locale, "altar.back")}
          </Link>
          <p className="sublabel text-xs">{t(locale, "altar.lightSublabel")}</p>
        </div>
      </header>

      <section className="max-w-2xl mx-auto px-6 pt-14 pb-24">
        <p className="eyebrow mb-3 text-[var(--foreground-muted)]">{t(locale, "altar.eyebrow")}</p>
        <h1 className="display text-3xl md:text-4xl leading-tight mb-3">
          {t(locale, "altar.newTitle")}
        </h1>
        <p className="text-[var(--foreground-muted)] leading-relaxed mb-10">
          {t(locale, "altar.newIntro")}
        </p>

        {error ? <p className="form-error mb-8">{error}</p> : null}

        <LightCandleForm initialIntention={intention} />
      </section>
    </main>
  );
}
