import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export const metadata = {
  title: "Ancestors altar | Original Botanica",
};

const OB_CDN = "https://dlkhclkmyx18n.cloudfront.net";

/**
 * Ancestors altar — placeholder.
 *
 * The real tool will be ported from ancestors-originalbotanica.vercel.app.
 * For now this surface explains what's coming so the dashboard link
 * doesn't 404.
 */
export default async function AncestorsPage() {
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
    <main className="min-h-screen relative">
      <div className="absolute inset-0 -z-10">
        <Image
          src={`${OB_CDN}/spiritual-candles.png`}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-25"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(20,16,11,0.9) 0%, rgba(20,16,11,0.96) 100%)",
          }}
        />
      </div>

      <header className="border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="nav-link text-[var(--accent)]">
            ← Dashboard
          </Link>
          <p className="sublabel text-xs">Ancestors altar</p>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 pt-24 pb-20">
        <p className="eyebrow mb-4">Ancestors altar</p>
        <h1 className="display text-4xl md:text-5xl mb-6 leading-tight">
          A flame for those who came before.
        </h1>
        <p className="text-[var(--foreground-muted)] text-lg leading-relaxed max-w-2xl mb-10">
          Soon you&apos;ll be able to memorialize the people you carry. Their
          names lit. Their stories with you. A flame that stays.
        </p>

        <div className="border-l-2 border-[var(--accent)] pl-4 py-2 invocation text-[var(--foreground-muted)] max-w-lg mb-12">
          Coming soon. The ancestors tool is being woven into this membership.
        </div>

        <Link href="/dashboard" className="btn-ghost inline-flex">
          Back to your dashboard
        </Link>
      </section>
    </main>
  );
}
