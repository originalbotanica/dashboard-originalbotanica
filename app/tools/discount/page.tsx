import { MarketingToolLayout } from "@/components/marketing-tool-layout";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionary";

export const metadata = {
  title: "Member discount",
  description:
    "10% off everything at originalbotanica.com. Applied automatically at checkout when you sign in.",
};

const OB_CDN = "https://dlkhclkmyx18n.cloudfront.net";

export default async function DiscountToolPage() {
  const locale = await getLocale();
  const tr = (k: string) => t(locale, k);
  return (
    <MarketingToolLayout
      eyebrow={tr("mkt.disc.eyebrow")}
      headline={tr("mkt.disc.headline")}
      subhead={tr("mkt.disc.subhead")}
      heroImageUrl={`${OB_CDN}/spiritual-baths-washes.png`}
    >
      <p className="eyebrow eyebrow-lg mb-3">{tr("mkt.disc.s1Eyebrow")}</p>
      <h2 className="display text-2xl md:text-3xl mb-6 leading-tight">
        {tr("mkt.disc.s1Title")}
      </h2>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        {tr("mkt.disc.s1Body")}
      </p>

      <p className="eyebrow eyebrow-lg mb-3 mt-12">{tr("mkt.disc.s2Eyebrow")}</p>
      <h2 className="display text-2xl md:text-3xl mb-6 leading-tight">
        {tr("mkt.disc.s2Title")}
      </h2>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        {tr("mkt.disc.s2Body")}
      </p>

      <p className="eyebrow eyebrow-lg mb-3 mt-12">{tr("mkt.disc.s3Eyebrow")}</p>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        {tr("mkt.disc.s3Body")}
      </p>
    </MarketingToolLayout>
  );
}
