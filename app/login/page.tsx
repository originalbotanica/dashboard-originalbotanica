import Link from "next/link";
import Image from "next/image";
import { loginAction } from "./actions";

export const metadata = {
  title: "Sign in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirectTo?: string; message?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = params.redirectTo || "/dashboard";

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="auth-card">
        <Link href="/" className="flex flex-col items-center mb-8 leading-none">
          <Image
            src="/logo-original-botanica.svg"
            alt="Original Botanica"
            width={100}
            height={70}
            priority
            className="h-auto w-[100px]"
          />
        </Link>

        <h1 className="display text-2xl mb-2 text-center">Welcome back.</h1>
        <p className="text-foreground-muted text-center text-sm mb-8">
          Sign in to your spiritual home.
        </p>

        <form action={loginAction} className="flex flex-col gap-5">
          <input type="hidden" name="redirectTo" value={redirectTo} />

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
              autoComplete="current-password"
              required
              className="form-input"
              placeholder="••••••••"
            />
          </div>

          {params.error && <p className="form-error">{params.error}</p>}
          {params.message && <p className="form-success">{params.message}</p>}

          <button type="submit" className="btn-primary mt-2">
            Sign In
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-2 text-sm">
          <Link
            href="/reset-password"
            className="text-[var(--foreground-muted)] hover:text-[var(--accent)] transition-colors"
          >
            Forgot your password?
          </Link>
          <p className="text-[var(--foreground-muted)]">
            New here?{" "}
            <Link href="/signup" className="text-[var(--accent)] hover:underline">
              Start your 7-day trial
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
