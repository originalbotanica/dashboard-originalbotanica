import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionStatus } from "@/lib/subscription";
import { getLocale } from "@/lib/i18n/server";
import { t, type Locale } from "@/lib/i18n/dictionary";

export const metadata = {
  title: "Your Astrologer",
};

/**
 * Astrologer hub — start a new reading, or return to a past conversation.
 */
export default async function AstrologerHubPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, birth_date, birth_place")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.first_name) redirect("/profile-setup");
  if (!profile.birth_date || !profile.birth_place) redirect("/astrology");

  const sub = await getSubscriptionStatus(user.id);
  if (!sub.isActive) redirect("/astrology");

  const { data: threads } = await supabase
    .from("astrologer_threads")
    .select("id, title, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const locale = await getLocale();

  return (
    <main className="min-h-screen">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/astrology" className="nav-link text-[var(--accent)]">
            ← {t(locale, "astro.eyebrow")}
          </Link>
          <p className="sublabel text-xs">{t(locale, "astrologer.sublabel")}</p>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 pt-16 pb-20">
        <p className="eyebrow mb-4">{t(locale, "astrologer.sublabel")}</p>
        <h1 className="display text-4xl md:text-5xl mb-5 leading-tight">
          {t(locale, "astrologer.title", { name: profile.first_name })}
        </h1>
        <p className="text-[var(--foreground-muted)] text-lg leading-relaxed max-w-2xl mb-10">
          {t(locale, "astrologer.intro")}
        </p>

        <Link
          href="/astrology/astrologer/new"
          className="btn-primary inline-flex"
        >
          {t(locale, "astrologer.startNew")}
        </Link>

        {threads && threads.length > 0 && (
          <section className="mt-20 border-t border-[var(--border)] pt-12">
            <p className="eyebrow mb-6">{t(locale, "astrologer.past")}</p>
            <ul className="space-y-3">
              {threads.map((thread) => (
                <li key={thread.id}>
                  <Link
                    href={`/astrology/astrologer/${thread.id}`}
                    className="block border border-[var(--border)] rounded-lg px-5 py-4 hover:border-[var(--accent)] hover:bg-[var(--surface)] transition-colors"
                  >
                    <p className="display text-lg mb-1">{thread.title}</p>
                    <p className="text-xs text-[var(--foreground-subtle)]">
                      {formatRelative(thread.created_at, locale)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </section>
    </main>
  );
}

function formatRelative(iso: string, locale: Locale): string {
  const date = new Date(iso);
  const now = new Date();
  const diffH = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  const diffD = Math.floor(diffH / 24);
  if (diffH < 1) return t(locale, "dr.justNow");
  if (diffH < 24) return t(locale, diffH === 1 ? "dr.hourAgo" : "dr.hoursAgo", { n: diffH });
  if (diffD < 7) return t(locale, diffD === 1 ? "dr.dayAgo" : "dr.daysAgo", { n: diffD });
  return date.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
