import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionStatus } from "@/lib/subscription";
import { AstrologerChat } from "@/components/astrologer-chat";

export const metadata = {
  title: "Your Astrologer | Original Botanica",
};

export default async function AstrologerPage() {
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
  if (!profile.birth_date || !profile.birth_place) {
    redirect("/astrology");
  }

  const sub = await getSubscriptionStatus(user.id);
  if (!sub.isActive) {
    redirect("/astrology");
  }

  // Load recent messages from the user's most recent thread
  const { data: thread } = await supabase
    .from("astrologer_threads")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let initialMessages: Array<{ role: "user" | "assistant"; content: string }> =
    [];
  if (thread?.id) {
    const { data: rows } = await supabase
      .from("astrologer_messages")
      .select("role, content")
      .eq("thread_id", thread.id)
      .order("created_at", { ascending: true })
      .limit(50);
    initialMessages = (rows || []).map((r) => ({
      role: r.role as "user" | "assistant",
      content: r.content,
    }));
  }

  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/astrology" className="nav-link text-[var(--accent)]">
            ← Astrology
          </Link>
          <p className="sublabel text-xs">Your astrologer</p>
        </div>
      </header>

      <section className="flex-1 max-w-3xl w-full mx-auto px-6 pt-8 pb-12 flex flex-col">
        <AstrologerChat
          firstName={profile.first_name}
          initialMessages={initialMessages}
        />
      </section>
    </main>
  );
}
