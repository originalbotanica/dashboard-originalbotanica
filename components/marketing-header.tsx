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
      <div className="w-full px-4 sm:px-6 md:px-12 py-3 flex items-center justify-between gap-3 md:gap-4">
        <Link href="/" className="flex items-center leading-none shrink-0">
          <Image
            src="/logo-ob-white-banner.png"
            alt="Original Botanica — Spiritual Products, est. 1959"
            width={943}
            height={685}
            priority
            className="h-auto w-[72px] md:w-[92px]"
          />
        </Link>
        {/* Tool links, center — desktop only (the tiles cover mobile). */}
        <nav className="hidden lg:flex flex-1 items-center justify-evenly gap-4 px-6 text-[20px] font-semibold tracking-[0.12em] uppercase whitespace-nowrap">
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
              className="nav-link !text-[20px] !text-[#d2ac66] hover:!text-[#f0d9a6] transition-colors"
            >
              {t(locale, key)}
            </Link>
          ))}
        </nav>
        <nav className="flex items-center gap-2 md:gap-4 shrink-0">
          <span className="flex items-center gap-1.5 md:gap-2 text-[15px] md:text-[20px] font-semibold tracking-[0.12em] uppercase whitespace-nowrap">
            <LanguageToggle className="!text-[15px] md:!text-[20px] !text-[#d2ac66] hover:!text-[#f0d9a6]" />
            <span aria-hidden className="text-[#d2ac66]">/</span>
            <Link
              href="/login"
              className="nav-link !text-[15px] md:!text-[20px] !text-[#d2ac66] hover:!text-[#f0d9a6] transition-colors hidden sm:inline-flex"
            >
              {t(locale, "lp.signIn")}
            </Link>
          </span>
          <Link
            href="/signup"
            className="rounded-md px-4 py-2.5 text-xs md:px-7 md:py-3 md:text-sm font-bold uppercase tracking-[0.12em] text-[#241a08] border border-[#f0d9a6]/70 transition-opacity hover:opacity-90 whitespace-nowrap shrink-0"
            style={{ background: "linear-gradient(180deg, #e8c983 0%, #c69a4e 100%)" }}
          >
            {t(locale, "lp.startTrial")}
          </Link>
        </nav>
      </div>
    </header>
  );
}
