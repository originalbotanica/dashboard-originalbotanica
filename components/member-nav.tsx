"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useT } from "./locale-provider";
import { LanguageToggle } from "./language-toggle";

/**
 * Shared top navigation for signed-in member pages.
 * Logo (home), the tools across the top, and an account menu on the right.
 * Collapses to a hamburger menu on mobile. Labels are localized (EN/ES).
 *
 * variant "floating" sits fixed over hero imagery (dashboard);
 * "bordered" is a solid bar for the tool pages.
 */
const TOOLS = [
  { href: "/dashboard", key: "nav.dashboard" },
  { href: "/tarot", key: "nav.tarot" },
  { href: "/astrology", key: "nav.astrology" },
  { href: "/dreams", key: "nav.dreams" },
  { href: "/altar/virtual", key: "nav.altar" },
  { href: "/ancestors", key: "nav.ancestors" },
  { href: "/rituals", key: "nav.rituals" },
  { href: "/calendar", key: "nav.calendar" },
];

export function MemberNav({
  variant = "bordered",
}: {
  variant?: "floating" | "bordered";
} = {}) {
  const pathname = usePathname() || "";
  const [menuOpen, setMenuOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);
  const t = useT();

  // Close the account menu when the page scrolls (a wheel scroll doesn't
  // blur the button, so without this the menu lingers over the page).
  useEffect(() => {
    if (!acctOpen) return;
    const close = () => setAcctOpen(false);
    window.addEventListener("scroll", close, { passive: true });
    return () => window.removeEventListener("scroll", close);
  }, [acctOpen]);

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
      <div className="w-full px-4 sm:px-6 md:px-10 py-3 flex items-center justify-between gap-4">
        <Link href="/dashboard" className="flex items-center leading-none shrink-0">
          <Image
            src="/logo-ob-white-banner.png"
            alt="Original Botanica"
            width={70}
            height={50}
            priority
            className="h-auto w-[56px] md:w-[64px]"
          />
        </Link>

        {/* Desktop tools */}
        <nav className="hidden md:flex flex-1 items-center justify-evenly gap-4 px-4 whitespace-nowrap">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className={`nav-link !text-[15px] lg:!text-[17px] xl:!text-[20px] transition-colors ${
                isActive(tool.href)
                  ? "text-[var(--accent)]"
                  : "text-[var(--foreground)] hover:text-[var(--accent)]"
              }`}
            >
              {t(tool.key)}
            </Link>
          ))}
        </nav>

        {/* Desktop language toggle + account menu */}
        <div className="hidden md:flex items-center gap-5 shrink-0 whitespace-nowrap">
          <LanguageToggle className="!text-[15px] lg:!text-[17px] xl:!text-[20px]" />
          <div className="relative">
            <button
              type="button"
              onClick={() => setAcctOpen((v) => !v)}
              onBlur={() => setTimeout(() => setAcctOpen(false), 150)}
              className="nav-link !text-[15px] lg:!text-[17px] xl:!text-[20px] text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
              aria-haspopup="true"
              aria-expanded={acctOpen}
            >
              {t("nav.account")} ▾
            </button>
            {acctOpen && (
              <div className="absolute right-0 mt-3 w-60 rounded-lg border border-[var(--border-strong)] bg-[var(--background-elevated)] py-1 shadow-xl overflow-hidden">
                <Link
                  href="/account"
                  className="nav-link block w-full text-left px-5 py-3 text-[var(--foreground)] hover:text-[var(--accent)] hover:bg-[var(--surface)] transition-colors"
                >
                  {t("nav.accountBilling")}
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
                    {t("nav.signOut")}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden nav-link text-[var(--foreground)]"
          aria-label="Menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? t("nav.close") : t("nav.menu")}
        </button>
      </div>

      {/* Mobile panel */}
      {menuOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--background-elevated)] px-6 py-4">
          <nav className="flex flex-col gap-1">
            {TOOLS.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                onClick={() => setMenuOpen(false)}
                className={`nav-link !text-[15px] py-2 text-center ${
                  isActive(tool.href) ? "text-[var(--accent)]" : "text-[var(--foreground)]"
                }`}
              >
                {t(tool.key)}
              </Link>
            ))}
            <div className="border-t border-[var(--border)] mt-2 pt-2">
              <Link
                href="/account"
                onClick={() => setMenuOpen(false)}
                className="nav-link !text-[15px] py-2 block text-center text-[var(--foreground)]"
              >
                {t("nav.accountBilling")}
              </Link>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="nav-link !text-[15px] py-2 block w-full text-center text-[var(--foreground)]"
                >
                  {t("nav.signOut")}
                </button>
              </form>
              <div className="pt-3 flex justify-center">
                <LanguageToggle className="!text-[15px]" />
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
