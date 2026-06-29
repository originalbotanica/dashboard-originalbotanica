import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionStatus } from "@/lib/subscription";
import { MemorialForm } from "@/components/memorial-form";
import { createAncestorAction } from "../actions";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionary";

export const metadata = {
  title: "Add an ancestor",
};

export default async function NewAncestorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
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
  if (!sub.isActive) redirect("/tools/ancestors");

  const locale = await getLocale();

  return (
    <main className="min-h-screen">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/ancestors" className="nav-link text-[var(--accent)]">
            ← {t(locale, "anc.eyebrow")}
          </Link>
          <p className="sublabel text-xs">{t(locale, "anc.newSublabel")}</p>
        </div>
      </header>

      <section className="max-w-2xl mx-auto px-6 pt-16 pb-24">
        <p className="eyebrow mb-4">{t(locale, "anc.add")}</p>
        <h1 className="display text-3xl md:text-4xl mb-4 leading-tight">
          {t(locale, "anc.newTitle")}
        </h1>
        <p className="text-[var(--foreground-muted)] leading-relaxed mb-4">
          {t(locale, "anc.newIntro")}
        </p>
        <p className="text-sm text-[var(--foreground-subtle)] mb-10">
          {t(locale, "anc.privacyNote")}
        </p>

        {params.error && <p className="form-error mb-6">{params.error}</p>}

        <MemorialForm
          action={createAncestorAction}
          submitLabel={t(locale, "mem.lightFlame")}
        />
      </section>
    </main>
  );
}
