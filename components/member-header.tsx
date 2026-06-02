import Link from "next/link";
import Image from "next/image";

/**
 * Header bar for signed-in member pages.
 * Logo on the left (links to dashboard), Sign out on the right.
 *
 * The header is transparent so it can float over hero photography
 * without a hard visual break. Pages that need a solid header bar
 * (chat, chart, etc.) wrap this in their own border-bottom container.
 */
export function MemberHeader({
  variant = "transparent",
}: {
  variant?: "transparent" | "bordered";
} = {}) {
  const wrapperClass =
    variant === "bordered"
      ? "border-b border-[var(--border)] bg-[var(--background)]"
      : "absolute top-0 left-0 right-0 z-10";

  return (
    <header className={wrapperClass}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center leading-none">
          <Image
            src="/logo-original-botanica.svg"
            alt="Original Botanica"
            width={70}
            height={50}
            priority
            className="h-auto w-[70px]"
          />
        </Link>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="nav-link text-[var(--foreground-muted)] hover:text-[var(--accent)] transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
