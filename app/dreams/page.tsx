import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

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

  const { data: threads } = await supabase
    .from("dream_threads")
    .select("id, title, updated_at, created_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(50);

  return (
    <main className="min-h-screen relative">
      {/* Atmospheric backdrop */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={`${OB_CDN}/incense-smudges-resins.png`}
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

      <header className="border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="nav-link text-[var(--accent)]">
            ← Dashboard
          </Link>
          <p className="sublabel text-xs">Dreams</p>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 pt-24 pb-20">
        <p className="eyebrow mb-4">Dream journal</p>
        <h1 className="display text-4xl md:text-5xl mb-6 leading-tight">
          What did the night bring, {profile.first_name}?
        </h1>
        <p className="text-[var(--foreground-muted)] text-lg leading-relaxed max-w-2xl mb-10">
          Describe what you remember. The interpretation honors Lucum&iacute;,
          Espiritismo, folk Catholic, and Western traditions. Every dream
          becomes an entry in your journal.
        </p>

        <Link href="/dreams/new" className="btn-primary inline-flex">
          Interpret a new dream
        </Link>

        {threads && threads.length > 0 && (
          <section className="mt-20 border-t border-[var(--border)] pt-12">
            <p className="eyebrow mb-6">Your journal</p>
            <ul className="space-y-3">
              {threads.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/dreams/${t.id}`}
                    className="block border border-[var(--border)] rounded-lg px-5 py-4 hover:border-[var(--accent)] hover:bg-[var(--surface)] transition-colors"
                  >
                    <p className="display text-lg mb-1">{t.title}</p>
                    <p className="text-xs text-[var(--foreground-subtle)]">
                      {formatRelative(t.updated_at)}
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
              No dreams yet. When you interpret your first, it will appear here.
            </p>
          </section>
        )}
      </section>
    </main>
  );
}

function formatRelative(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);
  if (diffMin < 2) return "Just now";
  if (diffMin < 60) return `${diffMin} minutes ago`;
  if (diffH < 24) return `${diffH} ${diffH === 1 ? "hour" : "hours"} ago`;
  if (diffD < 7) return `${diffD} ${diffD === 1 ? "day" : "days"} ago`;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
