import Link from "next/link";
import Image from "next/image";

/**
 * Header bar for signed-in member pages.
 * Logo on the left, Sign out on the right.
 *
 * Defaults to a "floating" variant: fixed to the top of the viewport so
 * it persists during scroll, with a subtle dark scrim and backdrop blur
 * so it stays readable over any hero photography.
 */
export function MemberHeader({
  variant = "floating",
}: {
  variant?: "floating" | "bordered";
} = {}) {
  const wrapperClass =
    variant === "bordered"
      ? "relative border-b border-[var(--border)] bg-[var(--background)] z-10"
      : "fixed top-0 left-0 right-0 z-50 backdrop-blur-md";

  return (
    <header
      className={wrapperClass}
      style={
        variant === "floating"
          ? { background: "rgba(20, 16, 11, 0.65)" }
          : undefined
      }
    >
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center leading-none">
          <Image
            src="/logo-original-botanica.svg"
            alt="Original Botanica"
            width={70}
            height={50}
            priority
            className="h-auto w-[60px] md:w-[70px]"
          />
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/account"
            className="nav-link text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
          >
            Account
          </Link>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="nav-link text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
