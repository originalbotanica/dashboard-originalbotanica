import { MarketingToolLayout } from "@/components/marketing-tool-layout";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionary";

export const metadata = {
  title: "Ancestors altar",
  description:
    "A flame for those who came before. Memorialize the ones you carry. Their names lit, their stories with you.",
};

const OB_CDN = "https://dlkhclkmyx18n.cloudfront.net";

export default async function AncestorsToolPage() {
  const locale = await getLocale();
  const tr = (k: string) => t(locale, k);
  return (
    <MarketingToolLayout
      eyebrow={tr("mkt.anc.eyebrow")}
      headline={tr("mkt.anc.headline")}
      subhead={tr("mkt.anc.subhead")}
      heroImageUrl={`${OB_CDN}/spiritual-candles.png`}
      graphicSrc="/landing/tile-ancestors.jpg"
      graphicAlt="Ancestor connection"
    >
      <p className="eyebrow mb-3">{tr("mkt.anc.s1Eyebrow")}</p>
      <h2 className="display text-2xl md:text-3xl mb-6 leading-tight">
        {tr("mkt.anc.s1Title")}
      </h2>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        {tr("mkt.anc.s1Body")}
      </p>

      <p className="eyebrow mb-3 mt-12">{tr("mkt.anc.s2Eyebrow")}</p>
      <h2 className="display text-2xl md:text-3xl mb-6 leading-tight">
        {tr("mkt.anc.s2Title")}
      </h2>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        {tr("mkt.anc.s2Body")}
      </p>

      <p className="eyebrow mb-3 mt-12">{tr("mkt.anc.s3Eyebrow")}</p>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        {tr("mkt.anc.s3Body")}
      </p>

      <p className="eyebrow mb-3 mt-12">{tr("mkt.anc.s4Eyebrow")}</p>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        {tr("mkt.anc.s4Body")}
      </p>
    </MarketingToolLayout>
  );
}
