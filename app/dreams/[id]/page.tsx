import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionStatus } from "@/lib/subscription";
import { DreamChat } from "@/components/dream-chat";

export const metadata = {
  title: "Dream | Original Botanica",
};

/**
 * View a specific dream thread. Members can read past interpretations
 * and continue the conversation (add follow-up questions, deeper symbols).
 */
export default async function DreamThreadPage({
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
    .select("first_name")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.first_name) redirect("/profile-setup");

  const sub = await getSubscriptionStatus(user.id);
  if (!sub.isActive) redirect("/dreams");

  // Load the thread + verify ownership (RLS enforces; double-check)
  const { data: thread } = await supabase
    .from("dream_threads")
    .select("id, title")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!thread) notFound();

  const { data: rows } = await supabase
    .from("dream_messages")
    .select("role, content")
    .eq("thread_id", thread.id)
    .order("created_at", { ascending: true })
    .limit(100);

  const initialMessages = (rows || []).map((r) => ({
    role: r.role as "user" | "assistant",
    content: r.content,
  }));

  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link
            href="/dreams"
            className="nav-link text-[var(--accent)] shrink-0"
          >
            ← Dream journal
          </Link>
          <p className="sublabel text-xs truncate" title={thread.title}>
            {thread.title}
          </p>
        </div>
      </header>

      <section className="flex-1 max-w-3xl w-full mx-auto px-6 pt-8 pb-12 flex flex-col">
        <DreamChat
          firstName={profile.first_name}
          threadId={thread.id}
          initialMessages={initialMessages}
        />
      </section>
    </main>
  );
}
