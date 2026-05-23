import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

/**
 * Marketing homepage (logged out).
 *
 * This is a SCAFFOLD — final marketing copy and visual treatment come in
 * Phase 4 once we know the name and have the rituals library populated.
 *
 * IMPORTANT: this page also serves as a defensive fallback for the
 * Supabase email-confirmation flow. Supabase strips paths from
 * `redirect_to` that aren't in its allowlist, which means email-confirm
 * links can land here at `/?code=...` instead of `/auth/callback?code=...`.
 * We handle that case by exchanging the code ourselves and routing onward,
 * so the signup flow works regardless of how Supabase's URL config is set.
 */
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  // Case 1: arriving with ?code=... — exchange it for a session.
  if (params.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(params.code);
    if (!error) {
      // After successful exchange, route based on profile completeness.
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name")
          .eq("id", user.id)
          .maybeSingle();
        if (!profile?.first_name) redirect("/profile-setup");
        redirect("/dashboard");
      }
    }
    // Exchange failed — fall through to marketing page.
  }

  // Case 2: already signed in — route them onward.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile?.first_name) redirect("/profile-setup");
    redirect("/dashboard");
  }

  // Case 3: logged out — show marketing hero.
  return (
    <main className="flex-1 flex flex-col">
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 max-w-3xl mx-auto">
        <p className="sublabel mb-6">Original Botanica</p>
        <h1 className="display text-5xl md:text-6xl mb-6">
          Your spiritual home, online.
        </h1>
        <p className="text-lg text-[var(--foreground-muted)] leading-relaxed mb-10 max-w-2xl">
          Daily tarot. Personal astrology. Your virtual altar. A flame
          for those who came before. A library of rituals from sixty‑six
          years of practice in the Bronx.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/signup" className="btn-primary">
            Start 7-day free trial
          </Link>
          <Link href="/login" className="btn-ghost">
            Sign in
          </Link>
        </div>
        <p className="eyebrow mt-12 text-[var(--foreground-subtle)]">
          The Bronx, since 1959
        </p>
      </section>
    </main>
  );
}
