"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Route-aware site footer.
 *
 * - Full footer on the public/marketing surfaces (landing, /tools/*, account,
 *   shared card pages) — brand, navigation, shop, and legal links.
 * - Slim footer everywhere else (the immersive member tools, auth/onboarding) —
 *   just copyright + legal, so it never crowds the ritual screens but the
 *   Privacy/Terms links are always one tap away.
 * - Hidden on auth callback routes.
 */

const STORE = "https://originalbotanica.com";
const CONTACT = "mailto:info@originalbotanica.com";
const PHONE_TEL = "tel:+17183679589";
const PHONE_DISPLAY = "(718) 367-9589";

const TOOL_LINKS: { label: string; href: string }[] = [
  { label: "Tarot", href: "/tools/tarot" },
  { label: "Astrology", href: "/tools/astrology" },
  { label: "Dreams", href: "/tools/dreams" },
  { label: "Virtual altar", href: "/tools/virtual-altar" },
  { label: "Ancestors", href: "/tools/ancestors" },
  { label: "Rituals", href: "/tools/rituals" },
];

const LEGAL_LINKS: { label: string; href: string }[] = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Cancellation & refunds", href: "/cancellation" },
];

export function SiteFooter() {
  const pathname = usePathname() || "/";
  if (pathname.startsWith("/auth")) return null;

  const isFull =
    pathname === "/" ||
    pathname.startsWith("/tools") ||
    pathname === "/account" ||
    pathname.startsWith("/card");

  const year = new Date().getFullYear();

  if (!isFull) {
    return (
      <footer className="border-t border-[var(--border)] mt-auto">
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-xs text-[var(--foreground-subtle)]">
            © {year} Original Botanica · the Bronx, since 1959
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {LEGAL_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="nav-link text-xs text-[var(--foreground-subtle)] hover:text-[var(--accent)]"
              >
                {l.label}
              </Link>
            ))}
            <a
              href={CONTACT}
              className="nav-link text-xs text-[var(--foreground-subtle)] hover:text-[var(--accent)]"
            >
              Contact
            </a>
            <a
              href={PHONE_TEL}
              className="nav-link text-xs text-[var(--foreground-subtle)] hover:text-[var(--accent)]"
            >
              {PHONE_DISPLAY}
            </a>
          </nav>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-[var(--border)] mt-auto">
      <div className="max-w-5xl mx-auto px-6 py-14">
        <div className="flex flex-col items-center text-center mb-10">
          <Link href="/" className="display text-2xl text-[var(--foreground)]">
            Original Botanica
          </Link>
          <p className="eyebrow mt-3 text-[var(--foreground-subtle)]">
            Spiritual products · the Bronx, since 1959
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center md:text-left">
          <div>
            <p className="eyebrow mb-4 text-[var(--foreground-subtle)]">Explore</p>
            <ul className="space-y-2.5">
              {TOOL_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="nav-link text-sm text-[var(--foreground-muted)] hover:text-[var(--accent)]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-4 text-[var(--foreground-subtle)]">Shop</p>
            <ul className="space-y-2.5">
              <li>
                <a
                  href={STORE}
                  className="nav-link text-sm text-[var(--foreground-muted)] hover:text-[var(--accent)]"
                >
                  Buy spiritual products
                </a>
              </li>
              <li>
                <Link
                  href="/gift"
                  className="nav-link text-sm text-[var(--foreground-muted)] hover:text-[var(--accent)]"
                >
                  Gift a membership
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-4 text-[var(--foreground-subtle)]">Account</p>
            <ul className="space-y-2.5">
              <li>
                <Link href="/account" className="nav-link text-sm text-[var(--foreground-muted)] hover:text-[var(--accent)]">
                  My account
                </Link>
              </li>
              <li>
                <Link href="/login" className="nav-link text-sm text-[var(--foreground-muted)] hover:text-[var(--accent)]">
                  Sign in
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-4 text-[var(--foreground-subtle)]">Legal</p>
            <ul className="space-y-2.5">
              {LEGAL_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="nav-link text-sm text-[var(--foreground-muted)] hover:text-[var(--accent)]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <a href={CONTACT} className="nav-link text-sm text-[var(--foreground-muted)] hover:text-[var(--accent)]">
                  Contact
                </a>
              </li>
              <li>
                <a href={PHONE_TEL} className="nav-link text-sm text-[var(--foreground-muted)] hover:text-[var(--accent)]">
                  Call {PHONE_DISPLAY}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[var(--border)] mt-12 pt-6 text-center">
          <p className="text-sm md:text-base text-[var(--foreground-muted)] tracking-wide">
            Copyright © {year} Original Botanica. All Rights Reserved.{" "}
            <a href={STORE} className="hover:text-[var(--accent)]">
              originalbotanica.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
