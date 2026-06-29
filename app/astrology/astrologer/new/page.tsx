import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionStatus } from "@/lib/subscription";
import { AstrologerChat } from "@/components/astrologer-chat";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionary";

export const metadata = {
  title: "A new reading",
};

export default async function NewAstrologerReadingPage() {
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

  const locale = await getLocale();

  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/astrology/astrologer" className="nav-link text-[var(--accent)]">
            ← {t(locale, "astrologer.sublabel")}
          </Link>
          <p className="sublabel text-xs">{t(locale, "astrologer.newSublabel")}</p>
        </div>
      </header>

      <section className="flex-1 max-w-3xl w-full mx-auto px-6 pt-8 pb-12 flex flex-col">
        <AstrologerChat
          firstName={profile.first_name}
          threadId={null}
          initialMessages={[]}
        />
      </section>
    </main>
  );
}
