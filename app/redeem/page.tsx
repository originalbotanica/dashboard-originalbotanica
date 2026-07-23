import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import { redeemGift } from "./actions";

export const metadata = {
  title: "Redeem your Original Botanica gift",
  description: "Redeem your Original Botanica gift membership.",
};

export default async function RedeemPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string }>;
}) {
  const { code = "", error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const next = `/redeem${code ? `?code=${encodeURIComponent(code)}` : ""}`;

  return (
    <main className="min-h-screen">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center leading-none">
            <Image
              src="/logo-ob-white-banner.png"
              alt="Original Botanica"
              width={70}
              height={50}
              className="h-auto w-[60px] md:w-[70px]"
            />
          </Link>
          <Link href="/gift" className="nav-link text-[var(--foreground-muted)] hover:text-[var(--accent)]">
            Give a gift
          </Link>
        </div>
      </header>

      <section className="max-w-md mx-auto px-6 pt-20 pb-24">
        <p className="eyebrow mb-3 text-[var(--foreground-muted)] text-center">Redeem a gift</p>
        <h1 className="display text-3xl md:text-4xl leading-tight mb-4 text-center">
          Claim your membership.
        </h1>
        <p className="text-[var(--foreground-muted)] leading-relaxed mb-8 text-center">
          Enter your gift code below. Your membership begins the moment you redeem. No card
          required.
        </p>

        {!user ? (
          <div className="mb-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-center text-sm text-[var(--foreground-muted)]">
            You&apos;ll need a free account to claim your gift.{" "}
            <Link href={`/signup?next=${encodeURIComponent(next)}`} className="text-[var(--accent)] hover:underline">
              Create one
            </Link>{" "}
            or{" "}
            <Link href={`/login?redirectTo=${encodeURIComponent(next)}`} className="text-[var(--accent)] hover:underline">
              sign in
            </Link>
            .
          </div>
        ) : null}

        <form action={redeemGift}>
          <label className="form-label" htmlFor="code">Gift code</label>
          <input
            id="code"
            name="code"
            className="form-input text-center tracking-wider"
            defaultValue={code}
            placeholder="OB-GIFT-XXXX-XXXX"
            autoComplete="off"
            autoCapitalize="characters"
            required
          />
          {error ? <p className="form-error mt-3">{error}</p> : null}
          <button type="submit" className="btn-primary w-full mt-6">
            Redeem my gift
          </button>
        </form>
      </section>
    </main>
  );
}
