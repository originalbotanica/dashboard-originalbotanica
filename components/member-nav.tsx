"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

/**
 * Shared top navigation for signed-in member pages.
 * Logo (home), the tools across the top, and an account menu on the right.
 * Collapses to a hamburger menu on mobile.
 *
 * variant "floating" sits fixed over hero imagery (dashboard);
 * "bordered" is a solid bar for the tool pages.
 */
const TOOLS = [
  { href: "/tarot", label: "Tarot" },
  { href: "/astrology", label: "Astrology" },
  { href: "/dreams", label: "Dreams" },
  { href: "/altar/virtual", label: "Altar" },
  { href: "/ancestors", label: "Ancestors" },
  { href: "/rituals", label: "Rituals" },
];

export function MemberNav({
  variant = "bordered",
}: {
  variant?: "floating" | "bordered";
} = {}) {
  const pathname = usePathname() || "";
  const [menuOpen, setMenuOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);

  const wrapper =
    variant === "floating"
      ? "fixed top-0 left-0 right-0 z-50 backdrop-blur-md"
      : "relative border-b border-[var(--border)] bg-[var(--background)] z-10";

  const isActive = (href: string) =>
    href === "/altar/virtual"
      ? pathname.startsWith("/altar")
      : pathname.startsWith(href);

  return (
    <header
      className={wrapper}
      style={variant === "floating" ? { background: "rgba(20, 16, 11, 0.65)" } : undefined}
    >
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <Link href="/dashboard" className="flex items-center leading-none shrink-0">
          <Image
            src="/logo-original-botanica.svg"
            alt="Original Botanica"
            width={70}
            height={50}
            priority
            className="h-auto w-[56px] md:w-[64px]"
          />
        </Link>

        {/* Desktop tools */}
        <nav className="hidden md:flex items-center gap-6">
          {TOOLS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={`nav-link transition-colors ${
                isActive(t.href)
                  ? "text-[var(--accent)]"
                  : "text-[var(--foreground)] hover:text-[var(--accent)]"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>

        {/* Desktop account menu */}
        <div className="hidden md:block relative shrink-0">
          <button
            type="button"
            onClick={() => setAcctOpen((v) => !v)}
            onBlur={() => setTimeout(() => setAcctOpen(false), 150)}
            className="nav-link text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
            aria-haspopup="true"
            aria-expanded={acctOpen}
          >
            Account ▾
          </button>
          {acctOpen && (
            <div className="absolute right-0 mt-3 w-60 rounded-lg border border-[var(--border-strong)] bg-[var(--background-elevated)] py-1 shadow-xl overflow-hidden">
              <Link
                href="/account"
                className="nav-link block w-full text-left px-5 py-3 text-[var(--foreground)] hover:text-[var(--accent)] hover:bg-[var(--surface)] transition-colors"
              >
                Account &amp; billing
              </Link>
              <form
                action="/auth/signout"
                method="post"
                className="border-t border-[var(--border)]"
              >
                <button
                  type="submit"
                  className="nav-link block w-full text-left px-5 py-3 text-[var(--foreground)] hover:text-[var(--accent)] hover:bg-[var(--surface)] transition-colors"
                >
                  Sign out
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden nav-link text-[var(--foreground)]"
          aria-label="Menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
      </div>

      {/* Mobile panel */}
      {menuOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--background-elevated)] px-6 py-4">
          <nav className="flex flex-col gap-1">
            {TOOLS.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                onClick={() => setMenuOpen(false)}
                className={`nav-link py-2 ${
                  isActive(t.href) ? "text-[var(--accent)]" : "text-[var(--foreground)]"
                }`}
              >
                {t.label}
              </Link>
            ))}
            <div className="border-t border-[var(--border)] mt-2 pt-2">
              <Link
                href="/account"
                onClick={() => setMenuOpen(false)}
                className="nav-link py-2 block text-[var(--foreground)]"
              >
                Account &amp; billing
              </Link>
              <form action="/auth/signout" method="post">
                <button type="submit" className="nav-link py-2 block text-[var(--foreground)]">
                  Sign out
                </button>
              </form>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
