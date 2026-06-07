import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { MemorialForm } from "@/components/memorial-form";
import { createAncestorAction } from "../actions";

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

  return (
    <main className="min-h-screen">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/ancestors" className="nav-link text-[var(--accent)]">
            ← Ancestors altar
          </Link>
          <p className="sublabel text-xs">A new flame</p>
        </div>
      </header>

      <section className="max-w-2xl mx-auto px-6 pt-16 pb-24">
        <p className="eyebrow mb-4">Add an ancestor</p>
        <h1 className="display text-3xl md:text-4xl mb-4 leading-tight">
          Who are you remembering?
        </h1>
        <p className="text-[var(--foreground-muted)] leading-relaxed mb-10">
          Only their name is required. Everything else lets you say more
          when you visit their candle later.
        </p>

        {params.error && <p className="form-error mb-6">{params.error}</p>}

        <MemorialForm
          action={createAncestorAction}
          submitLabel="Light their flame"
        />
      </section>
    </main>
  );
}
