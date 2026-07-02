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
      style={{ background: "rgba(10, 8, 6, 0.9) " }}
    >
      <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center leading-none shrink-0">
          <Image
            src="/logo-original-botanica-white.svg"
            alt="Original Botanica"
            width={70}
            height={50}
            priority
            className="h-auto w-[56px] md:w-[70px]"
          />
        </Link>
        {/* Tool links, center — desktop only (the tiles cover mobile). */}
        <nav className="hidden lg:flex items-center gap-8 text-[0.78rem] font-semibold tracking-[0.12em] uppercase">
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
              className="nav-link !text-[#d2ac66] hover:!text-[#f0d9a6] transition-colors"
            >
              {t(locale, key)}
            </Link>
          ))}
        </nav>
        <nav className="flex items-center gap-3 md:gap-4">
          <span className="flex items-center gap-2 text-[0.78rem] font-semibold tracking-[0.12em] uppercase">
            <LanguageToggle className="!text-[#d2ac66] hover:!text-[#f0d9a6]" />
            <span aria-hidden className="text-[#d2ac66]">/</span>
            <Link
              href="/login"
              className="nav-link !text-[#d2ac66] hover:!text-[#f0d9a6] transition-colors hidden sm:inline-flex"
            >
              {t(locale, "lp.signIn")}
            </Link>
          </span>
          <Link
            href="/signup"
            className="rounded-md px-6 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-[#241a08] border border-[#f0d9a6]/70 transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(180deg, #e8c983 0%, #c69a4e 100%)" }}
          >
            {t(locale, "lp.startTrial")}
          </Link>
        </nav>
      </div>
    </header>
  );
}
