import Link from "next/link";
import Image from "next/image";
import { requestResetAction } from "./actions";

export const metadata = {
  title: "Reset your password",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

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

        <h1 className="display text-2xl mb-2 text-center">Reset your password.</h1>
        <p className="text-foreground-muted text-center text-sm mb-8">
          We&rsquo;ll send a link to your email to set a new one.
        </p>

        <form action={requestResetAction} className="flex flex-col gap-5">
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

          {params.error && <p className="form-error">{params.error}</p>}
          {params.message && <p className="form-success">{params.message}</p>}

          <button type="submit" className="btn-primary mt-2">
            Send Reset Link
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--foreground-muted)]">
          Remembered it?{" "}
          <Link href="/login" className="text-[var(--accent)] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
