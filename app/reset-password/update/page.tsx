import Link from "next/link";
import Image from "next/image";
import { updatePasswordAction } from "../actions";

export const metadata = {
  title: "Choose a new password",
};

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
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

        <h1 className="display text-2xl mb-2 text-center">Choose a new password.</h1>
        <p className="text-foreground-muted text-center text-sm mb-8">
          At least 8 characters.
        </p>

        <form action={updatePasswordAction} className="flex flex-col gap-5">
          <div>
            <label htmlFor="password" className="form-label">New Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className="form-input"
              placeholder="••••••••"
            />
          </div>

          {params.error && <p className="form-error">{params.error}</p>}

          <button type="submit" className="btn-primary mt-2">
            Update Password
          </button>
        </form>
      </div>
    </main>
  );
}
