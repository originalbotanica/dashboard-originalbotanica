import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { MemberNav } from "@/components/member-nav";
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionStatus } from "@/lib/subscription";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/dictionary";

export const metadata = {
  title: "Dreams",
};

const OB_CDN = "https://dlkhclkmyx18n.cloudfront.net";

/**
 * The Dream Journal — list of all the member's past dream threads.
 */
export default async function DreamsHubPage() {
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
  if (!sub.isActive) redirect("/tools/dreams");

  const { data: threads } = await supabase
    .from("dream_threads")
    .select("id, title, updated_at, created_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(50);

  const locale = await getLocale();

  return (
    <main className="min-h-screen relative">
      {/* Atmospheric backdrop */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/landing/gfx-dreams.jpg"
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
              "linear-gradient(180deg, rgba(20,16,11,0.92) 0%, rgba(20,16,11,0.96) 100%)",
          }}
        />
      </div>

      <MemberNav />

      <section className="max-w-3xl mx-auto px-6 pt-24 pb-20">
        <p className="eyebrow mb-4">{t(locale, "dr.journalEyebrow")}</p>
        <h1 className="display text-4xl md:text-5xl mb-6 leading-tight">
          {t(locale, "dr.hubTitle", { name: profile.first_name })}
        </h1>
        <p className="text-[var(--foreground-muted)] text-lg leading-relaxed max-w-2xl mb-10">
          {t(locale, "dr.hubIntro")}
        </p>

        <Link href="/dreams/new" className="btn-primary inline-flex">
          {t(locale, "dr.interpretNew")}
        </Link>

        {threads && threads.length > 0 && (
          <section className="mt-20 border-t border-[var(--border)] pt-12">
            <p className="eyebrow mb-6">{t(locale, "dr.yourJournal")}</p>
            <ul className="space-y-3">
              {threads.map((thread) => (
                <li key={thread.id}>
                  <Link
                    href={`/dreams/${thread.id}`}
                    className="block border border-[var(--border)] rounded-lg px-5 py-4 hover:border-[var(--accent)] hover:bg-[var(--surface)] transition-colors"
                  >
                    <p className="display text-lg mb-1">{thread.title}</p>
                    <p className="text-xs text-[var(--foreground-subtle)]">
                      {formatRelative(thread.updated_at, locale)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {(!threads || threads.length === 0) && (
          <section className="mt-20 border-t border-[var(--border)] pt-12">
            <p className="invocation text-[var(--foreground-muted)] leading-relaxed max-w-lg">
              {t(locale, "dr.empty")}
            </p>
          </section>
        )}
      </section>
    </main>
  );
}

function formatRelative(iso: string, locale: Locale): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);
  if (diffMin < 2) return t(locale, "dr.justNow");
  if (diffMin < 60) return t(locale, "dr.minutesAgo", { n: diffMin });
  if (diffH < 24) return t(locale, diffH === 1 ? "dr.hourAgo" : "dr.hoursAgo", { n: diffH });
  if (diffD < 7) return t(locale, diffD === 1 ? "dr.dayAgo" : "dr.daysAgo", { n: diffD });
  return date.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
