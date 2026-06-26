import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionStatus } from "@/lib/subscription";

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

  return (
    <main className="min-h-screen">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/astrology" className="nav-link text-[var(--accent)]">
            ← Astrology
          </Link>
          <p className="sublabel text-xs">Your astrologer</p>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 pt-16 pb-20">
        <p className="eyebrow mb-4">Your astrologer</p>
        <h1 className="display text-4xl md:text-5xl mb-5 leading-tight">
          Sit with the astrologer, {profile.first_name}.
        </h1>
        <p className="text-[var(--foreground-muted)] text-lg leading-relaxed max-w-2xl mb-10">
          Ask anything that&apos;s been on your mind, and let&apos;s see what the
          stars have to say. Need a ritual that fits today? Just ask. Each
          conversation is kept here for you.
        </p>

        <Link
          href="/astrology/astrologer/new"
          className="btn-primary inline-flex"
        >
          Start a new reading
        </Link>

        {threads && threads.length > 0 && (
          <section className="mt-20 border-t border-[var(--border)] pt-12">
            <p className="eyebrow mb-6">Past readings</p>
            <ul className="space-y-3">
              {threads.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/astrology/astrologer/${t.id}`}
                    className="block border border-[var(--border)] rounded-lg px-5 py-4 hover:border-[var(--accent)] hover:bg-[var(--surface)] transition-colors"
                  >
                    <p className="display text-lg mb-1">{t.title}</p>
                    <p className="text-xs text-[var(--foreground-subtle)]">
                      {formatRelative(t.created_at)}
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

function formatRelative(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffH = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  const diffD = Math.floor(diffH / 24);
  if (diffH < 1) return "Just now";
  if (diffH < 24) return `${diffH} ${diffH === 1 ? "hour" : "hours"} ago`;
  if (diffD < 7) return `${diffD} ${diffD === 1 ? "day" : "days"} ago`;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
