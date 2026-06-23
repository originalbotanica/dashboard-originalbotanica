import Image from "next/image";
import Link from "next/link";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionary";

/**
 * The dashboard teaser for the daily tarot card.
 *
 * Shows the tarot wheel and invites the member to pull their card. The spin
 * and the reveal happen on the dedicated /tarot page. Localized (EN/ES).
 */
export async function DailyTarotTeaser() {
  const locale = await getLocale();
  const tr = (key: string, vars?: Record<string, string | number>) =>
    t(locale, key, vars);

  const day = new Date().toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
    weekday: "long",
    timeZone: "America/New_York",
  });

  return (
    <section aria-label={tr("teaser.eyebrow")} className="border-t border-[var(--border)]">
      <div className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-5 gap-10 md:gap-14 items-center">
        {/* The tarot wheel — links to the pull page. */}
        <div className="md:col-span-2 flex justify-center">
          <Link
            href="/tarot"
            className="group block w-full max-w-[320px]"
            aria-label={tr("teaser.cta")}
          >
            <Image
              src="/tarot-wheel/wheel_full.png"
              alt="The Original Botanica tarot wheel"
              width={320}
              height={323}
              className="w-full h-auto drop-shadow-[0_18px_40px_rgba(0,0,0,0.45)] transition-transform duration-700 ease-out group-hover:scale-[1.04] group-hover:rotate-12"
            />
            <span className="mt-5 block text-center text-[0.62rem] tracking-[0.24em] uppercase text-[var(--foreground-subtle)]">
              {tr("teaser.cta")}
            </span>
          </Link>
        </div>

        {/* Invitation. */}
        <div className="md:col-span-3">
          <p className="eyebrow mb-4">{tr("teaser.eyebrow")}</p>
          <h2 className="display text-2xl md:text-3xl mb-5 leading-tight">
            {tr("teaser.title")}
          </h2>
          <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
            {tr("teaser.body", { day })}
          </p>
          <Link href="/tarot" className="btn-ghost inline-flex">
            {tr("teaser.cta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
