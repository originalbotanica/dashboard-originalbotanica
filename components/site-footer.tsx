"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "./locale-provider";

/**
 * Route-aware site footer.
 *
 * - Full footer on the public/marketing surfaces (landing, /tools/*, account,
 *   shared card pages) — brand, navigation, shop, and legal links.
 * - Slim footer everywhere else (the immersive member tools, auth/onboarding).
 * - Hidden on auth callback routes. Labels localized (EN/ES).
 */

const STORE = "https://originalbotanica.com";
const CONTACT = "mailto:info@originalbotanica.com";
const PHONE_TEL = "tel:+17183679589";
const PHONE_DISPLAY = "(718) 367-9589";

const TOOL_LINKS: { key: string; href: string }[] = [
  { key: "nav.tarot", href: "/tools/tarot" },
  { key: "nav.astrology", href: "/tools/astrology" },
  { key: "nav.dreams", href: "/tools/dreams" },
  { key: "nav.altar", href: "/tools/virtual-altar" },
  { key: "nav.ancestors", href: "/tools/ancestors" },
  { key: "nav.rituals", href: "/tools/rituals" },
];

const LEGAL_LINKS: { key: string; href: string }[] = [
  { key: "footer.privacy", href: "/privacy" },
  { key: "footer.terms", href: "/terms" },
  { key: "footer.cancellation", href: "/cancellation" },
];

export function SiteFooter() {
  const pathname = usePathname() || "/";
  const t = useT();
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
            © {year} Original Botanica · 2486-88 Webster Avenue, The Bronx, NY 10458 · since 1959
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {LEGAL_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="nav-link text-xs text-[var(--foreground-subtle)] hover:text-[var(--accent)]"
              >
                {t(l.key)}
              </Link>
            ))}
            <a
              href={CONTACT}
              className="nav-link text-xs text-[var(--foreground-subtle)] hover:text-[var(--accent)]"
            >
              {t("footer.contact")}
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
            The Practice
          </Link>
          <p className="text-xs text-[var(--foreground-subtle)] mt-1">
            {t("footer.fromOB")}
          </p>
          <p className="eyebrow mt-3 text-[var(--foreground-subtle)]">
            {t("footer.tagline")}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center md:text-left">
          <div>
            <p className="eyebrow mb-4 text-[var(--foreground-subtle)]">{t("footer.explore")}</p>
            <ul className="space-y-2.5">
              {TOOL_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="nav-link text-sm text-[var(--foreground-muted)] hover:text-[var(--accent)]"
                  >
                    {t(l.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-4 text-[var(--foreground-subtle)]">{t("footer.shop")}</p>
            <ul className="space-y-2.5">
              <li>
                <a
                  href={STORE}
                  className="nav-link text-sm text-[var(--foreground-muted)] hover:text-[var(--accent)]"
                >
                  {t("footer.shopProducts")}
                </a>
              </li>
              <li>
                <Link
                  href="/gift"
                  className="nav-link text-sm text-[var(--foreground-muted)] hover:text-[var(--accent)]"
                >
                  {t("footer.giftMembership")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-4 text-[var(--foreground-subtle)]">{t("footer.account")}</p>
            <ul className="space-y-2.5">
              <li>
                <Link href="/account" className="nav-link text-sm text-[var(--foreground-muted)] hover:text-[var(--accent)]">
                  {t("footer.myAccount")}
                </Link>
              </li>
              <li>
                <Link href="/login" className="nav-link text-sm text-[var(--foreground-muted)] hover:text-[var(--accent)]">
                  {t("footer.signIn")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-4 text-[var(--foreground-subtle)]">{t("footer.legal")}</p>
            <ul className="space-y-2.5">
              {LEGAL_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="nav-link text-sm text-[var(--foreground-muted)] hover:text-[var(--accent)]"
                  >
                    {t(l.key)}
                  </Link>
                </li>
              ))}
              <li>
                <a href={CONTACT} className="nav-link text-sm text-[var(--foreground-muted)] hover:text-[var(--accent)]">
                  {t("footer.contact")}
                </a>
              </li>
              <li>
                <a href={PHONE_TEL} className="nav-link text-sm text-[var(--foreground-muted)] hover:text-[var(--accent)]">
                  {t("footer.callPhone", { phone: PHONE_DISPLAY })}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[var(--border)] mt-12 pt-6 text-center">
          <p className="text-xs text-[var(--foreground-subtle)]">
            © {year} Original Botanica. All rights reserved.{" "}
            <a href={STORE} className="hover:text-[var(--accent)]">
              originalbotanica.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
