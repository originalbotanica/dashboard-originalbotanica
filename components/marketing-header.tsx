import Link from "next/link";
import Image from "next/image";

/**
 * Top header for logged-out marketing pages.
 * Logo links back to /. CTAs route to signup + login.
 *
 * Floating + translucent so it sits cleanly over hero photography.
 */
export function MarketingHeader() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md"
      style={{ background: "rgba(20, 16, 11, 0.65)" }}
    >
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center leading-none">
          <Image
            src="/logo-original-botanica.svg"
            alt="Original Botanica"
            width={70}
            height={50}
            priority
            className="h-auto w-[60px] md:w-[70px]"
          />
        </Link>
        <nav className="flex items-center gap-4 md:gap-6">
          <Link
            href="/login"
            className="nav-link text-[var(--foreground-muted)] hover:text-[var(--accent)] transition-colors"
          >
            Sign in
          </Link>
          <Link href="/signup" className="btn-primary text-xs px-5 py-2.5">
            Start trial
          </Link>
        </nav>
      </div>
    </header>
  );
}
