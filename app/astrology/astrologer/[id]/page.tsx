import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionStatus } from "@/lib/subscription";
import { AstrologerChat } from "@/components/astrologer-chat";
import { BotanicaRecs } from "@/components/botanica-recs";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionary";

export const metadata = {
  title: "A reading",
};

/**
 * A specific astrologer conversation. Loads its history and lets the member
 * continue it.
 */
export default async function AstrologerThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  const { data: thread } = await supabase
    .from("astrologer_threads")
    .select("id, title")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!thread) notFound();

  const { data: rows } = await supabase
    .from("astrologer_messages")
    .select("role, content")
    .eq("thread_id", thread.id)
    .order("created_at", { ascending: true })
    .limit(100);

  const initialMessages = (rows || []).map((r) => ({
    role: r.role as "user" | "assistant",
    content: r.content,
  }));

  // The latest reading's matched archive rituals + shop products, surfaced as
  // tappable "For this reading" cards beneath the conversation.
  const { data: lastReading } = await supabase
    .from("astrologer_messages")
    .select("ritual_slugs, product_slugs")
    .eq("thread_id", thread.id)
    .eq("role", "assistant")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const locale = await getLocale();

  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link
            href="/astrology/astrologer"
            className="nav-link text-[var(--accent)] shrink-0"
          >
            ← {t(locale, "astrologer.sublabel")}
          </Link>
          <p className="sublabel text-xs truncate" title={thread.title}>
            {thread.title}
          </p>
        </div>
      </header>

      <section className="flex-1 max-w-3xl w-full mx-auto px-6 pt-8 pb-12 flex flex-col">
        <AstrologerChat
          firstName={profile.first_name}
          threadId={thread.id}
          initialMessages={initialMessages}
          recs={
            <BotanicaRecs
              userId={user.id}
              sourceSlugs={(lastReading?.ritual_slugs as string[]) || []}
              productSlugs={(lastReading?.product_slugs as string[]) || []}
              headingKey="recs.forThisReading"
            />
          }
        />
      </section>
    </main>
  );
}
