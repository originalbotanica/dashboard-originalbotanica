import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionStatus } from "@/lib/subscription";
import { listSavedRituals } from "@/lib/rituals/queries";
import { RitualCard } from "@/components/ritual-card";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionary";

export const metadata = {
  title: "Your saved rituals",
};

export default async function SavedRitualsPage() {
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

  const rituals = await listSavedRituals(user.id);
  const locale = await getLocale();

  return (
    <main className="min-h-screen">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/rituals" className="nav-link text-[var(--accent)]">
            ← {t(locale, "rit.library")}
          </Link>
          <p className="sublabel text-xs">{t(locale, "rit.savedSublabel")}</p>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 pt-16 pb-10">
        <p className="eyebrow mb-3 text-[var(--foreground-muted)]">{t(locale, "rit.savedShelf")}</p>
        <h1 className="display text-3xl md:text-5xl leading-tight mb-4">
          {t(locale, "rit.savedTitle")}
        </h1>
        <p className="text-[var(--foreground-muted)] text-lg leading-relaxed max-w-2xl">
          {t(locale, "rit.savedIntro")}
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24">
        {rituals.length === 0 ? (
          <p className="text-[var(--foreground-muted)] leading-relaxed">
            {t(locale, "rit.savedEmptyPre")}
            <Link href="/rituals" className="text-[var(--accent)]">
              {t(locale, "rit.browseLibrary")}
            </Link>
            .
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rituals.map((r) => (
              <RitualCard key={r.slug} ritual={r} saved locale={locale} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
