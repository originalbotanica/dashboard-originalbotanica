import { MarketingToolLayout } from "@/components/marketing-tool-layout";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionary";

export const metadata = {
  title: "Dream interpretation",
  description:
    "Describe a dream while it's still fresh. Symbols read through Lucumí, Espiritismo, folk Catholic, and Western dream traditions. Every dream ends with a ritual.",
};

const OB_CDN = "https://dlkhclkmyx18n.cloudfront.net";

export default async function DreamsToolPage() {
  const locale = await getLocale();
  const tr = (k: string) => t(locale, k);
  return (
    <MarketingToolLayout
      eyebrow={tr("mkt.dreams.eyebrow")}
      headline={tr("mkt.dreams.headline")}
      subhead={tr("mkt.dreams.subhead")}
      heroImageUrl="/landing/gfx-dreams.jpg"
      graphicSrc="/landing/gfx-dreams.jpg"
      graphicAlt="Dream interpreter"
    >
      <p className="eyebrow mb-3">{tr("mkt.dreams.s1Eyebrow")}</p>
      <h2 className="display text-2xl md:text-3xl mb-6 leading-tight">
        {tr("mkt.dreams.s1Title")}
      </h2>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        {tr("mkt.dreams.s1Body")}
      </p>

      <p className="eyebrow mb-3 mt-12">{tr("mkt.dreams.s2Eyebrow")}</p>
      <h2 className="display text-2xl md:text-3xl mb-6 leading-tight">
        {tr("mkt.dreams.s2Title")}
      </h2>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        {tr("mkt.dreams.s2Body")}
      </p>

      <p className="eyebrow mb-3 mt-12">{tr("mkt.dreams.s3Eyebrow")}</p>
      <h2 className="display text-2xl md:text-3xl mb-6 leading-tight">
        {tr("mkt.dreams.s3Title")}
      </h2>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        {tr("mkt.dreams.s3Body")}
      </p>

      <p className="eyebrow mb-3 mt-12">{tr("mkt.dreams.s4Eyebrow")}</p>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        {tr("mkt.dreams.s4Body")}
      </p>
    </MarketingToolLayout>
  );
}
