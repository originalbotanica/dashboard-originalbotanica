import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionStatus } from "@/lib/subscription";
import { DreamChat } from "@/components/dream-chat";

export const metadata = {
  title: "Interpret a dream",
};

export default async function NewDreamPage() {
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

  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dreams" className="nav-link text-[var(--accent)]">
            ← Dream journal
          </Link>
          <p className="sublabel text-xs">A new dream</p>
        </div>
      </header>

      <section className="flex-1 max-w-3xl w-full mx-auto px-6 pt-8 pb-12 flex flex-col">
        <DreamChat
          firstName={profile.first_name}
          threadId={null}
          initialMessages={[]}
        />
      </section>
    </main>
  );
}
