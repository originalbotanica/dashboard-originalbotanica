import { MarketingToolLayout } from "@/components/marketing-tool-layout";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionary";

export const metadata = {
  title: "Your astrologer",
  description:
    "An AI astrologer trained on your chart and the traditions Original Botanica has served since 1959. Western, Lucumí, Espiritismo, folk Catholic.",
};

const OB_CDN = "https://dlkhclkmyx18n.cloudfront.net";

export default async function AstrologyToolPage() {
  const locale = await getLocale();
  const tr = (k: string) => t(locale, k);
  return (
    <MarketingToolLayout
      eyebrow={tr("mkt.astro.eyebrow")}
      headline={tr("mkt.astro.headline")}
      subhead={tr("mkt.astro.subhead")}
      heroImageUrl={`${OB_CDN}/cta-spiritual-services.jpg`}
    >
      <p className="eyebrow mb-3">{tr("mkt.astro.s1Eyebrow")}</p>
      <h2 className="display text-2xl md:text-3xl mb-6 leading-tight">
        {tr("mkt.astro.s1Title")}
      </h2>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        {tr("mkt.astro.s1Body")}
      </p>

      <p className="eyebrow mb-3 mt-12">{tr("mkt.astro.s2Eyebrow")}</p>
      <h2 className="display text-2xl md:text-3xl mb-6 leading-tight">
        {tr("mkt.astro.s2Title")}
      </h2>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        {tr("mkt.astro.s2Body")}
      </p>

      <p className="eyebrow mb-3 mt-12">{tr("mkt.astro.s3Eyebrow")}</p>
      <h2 className="display text-2xl md:text-3xl mb-6 leading-tight">
        {tr("mkt.astro.s3Title")}
      </h2>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        {tr("mkt.astro.s3Body")}
      </p>

      <p className="eyebrow mb-3 mt-12">{tr("mkt.astro.s4Eyebrow")}</p>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        {tr("mkt.astro.s4Body")}
      </p>
    </MarketingToolLayout>
  );
}
