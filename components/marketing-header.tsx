import Link from "next/link";
import Image from "next/image";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionary";
import { LanguageToggle } from "./language-toggle";

/**
 * Top header for logged-out marketing pages.
 * Logo links back to /. CTAs route to signup + login. Language toggle.
 * Floating + translucent so it sits cleanly over hero photography.
 */
export async function MarketingHeader() {
  const locale = await getLocale();
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md"
      style={{ background: "rgba(20, 16, 11, 0.65)" }}
    >
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center leading-none shrink-0">
          <Image
            src="/logo-original-botanica.svg"
            alt="Original Botanica"
            width={70}
            height={50}
            priority
            className="h-auto w-[56px] md:w-[70px]"
          />
        </Link>
        {/* Tool links, center — desktop only (the tiles cover mobile). */}
        <nav className="hidden lg:flex items-center gap-5 text-[0.72rem] tracking-[0.14em] uppercase">
          {(
            [
              ["lp.featTarot", "/tools/tarot"],
              ["lp.featAstrology", "/tools/astrology"],
              ["lp.featDreams", "/tools/dreams"],
              ["lp.featAltar", "/tools/virtual-altar"],
              ["lp.featAncestors", "/tools/ancestors"],
              ["lp.featRituals", "/tools/rituals"],
            ] as const
          ).map(([key, href]) => (
            <Link
              key={href}
              href={href}
              className="nav-link text-[var(--foreground-muted)] hover:text-[var(--accent)] transition-colors"
            >
              {t(locale, key)}
            </Link>
          ))}
        </nav>
        <nav className="flex items-center gap-3 md:gap-5">
          <LanguageToggle />
          <Link
            href="/login"
            className="nav-link text-[var(--foreground-muted)] hover:text-[var(--accent)] transition-colors hidden sm:inline-flex"
          >
            {t(locale, "lp.signIn")}
          </Link>
          <Link href="/signup" className="btn-primary text-xs px-5 py-2.5">
            {t(locale, "lp.startTrial")}
          </Link>
        </nav>
      </div>
    </header>
  );
}
