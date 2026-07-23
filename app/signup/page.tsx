import Link from "next/link";
import Image from "next/image";
import { signupAction } from "./actions";

export const metadata = {
  title: "Begin your practice",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next || "";
  // Arriving from the redeem flow: this person was given a gift, so we
  // welcome them as a recipient — no trial framing, no pricing.
  const isGift = next.startsWith("/redeem");

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="auth-card">
        <Link href="/" className="flex flex-col items-center mb-8 leading-none">
          <Image
            src="/logo-ob-white-banner.png"
            alt="Original Botanica"
            width={100}
            height={70}
            priority
            className="h-auto w-[100px]"
          />
        </Link>

        {isGift ? (
          <>
            <h1 className="display text-2xl mb-2 text-center">
              Someone lit the way for you.
            </h1>
            <p className="text-foreground-muted text-center text-sm mb-8">
              Create your free account to claim your gift membership. No card
              needed — your gift covers everything.
            </p>
          </>
        ) : (
          <>
            <h1 className="display text-2xl mb-2 text-center">
              Begin your practice.
            </h1>
            <p className="text-foreground-muted text-center text-sm mb-8">
              7 days free. Cancel anytime.
            </p>
          </>
        )}

        <form action={signupAction} className="flex flex-col gap-5">
          {next && <input type="hidden" name="next" value={next} />}
          <div>
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="form-input"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className="form-input"
              placeholder="At least 8 characters"
            />
          </div>

          {params.error && <p className="form-error">{params.error}</p>}

          <button type="submit" className="btn-primary mt-2">
            {isGift ? "Create Account & Claim Gift" : "Create Account"}
          </button>

          <p className="text-center text-xs text-[var(--foreground-subtle)] leading-relaxed">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-[var(--accent)]">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-[var(--accent)]">
              Privacy Policy
            </Link>
            {isGift ? (
              <>. Your gift membership is prepaid — nothing renews and no payment method is required.</>
            ) : (
              <>
                . After your 7-day free trial, the membership is $29.95/month or
                $299.95/year and renews automatically until you cancel.
              </>
            )}
          </p>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--foreground-muted)]">
          Already have an account?{" "}
          <Link
            href={next ? `/login?redirectTo=${encodeURIComponent(next)}` : "/login"}
            className="text-[var(--accent)] hover:underline"
          >
            Sign in
          </Link>
        </p>
        {!isGift && (
          <p className="text-[var(--foreground-muted)] text-center text-sm mt-2">
            Received a gift?{" "}
            <Link href="/redeem" className="text-[var(--accent)] hover:underline">
              Redeem your code
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
