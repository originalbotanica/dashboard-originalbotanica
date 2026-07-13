import { MarketingToolLayout } from "@/components/marketing-tool-layout";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionary";

export const metadata = {
  title: "Virtual altar",
  description:
    "Light a candle from anywhere. For an intention. For protection. For someone you love who needs the prayer.",
};

const OB_CDN = "https://dlkhclkmyx18n.cloudfront.net";

export default async function VirtualAltarToolPage() {
  const locale = await getLocale();
  const tr = (k: string) => t(locale, k);
  return (
    <MarketingToolLayout
      eyebrow={tr("mkt.altar.eyebrow")}
      headline={tr("mkt.altar.headline")}
      subhead={tr("mkt.altar.subhead")}
      heroImageUrl={`${OB_CDN}/transforms/_miscImage/virtual-candle-altar.jpg`}
      graphicSrc="/landing/tile-altar.jpg"
      graphicAlt="Virtual altar"
    >
      <p className="eyebrow eyebrow-lg mb-3">{tr("mkt.altar.s1Eyebrow")}</p>
      <h2 className="display text-2xl md:text-3xl mb-6 leading-tight">
        {tr("mkt.altar.s1Title")}
      </h2>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        {tr("mkt.altar.s1Body")}
      </p>

      <p className="eyebrow eyebrow-lg mb-3 mt-12">{tr("mkt.altar.s2Eyebrow")}</p>
      <h2 className="display text-2xl md:text-3xl mb-6 leading-tight">
        {tr("mkt.altar.s2Title")}
      </h2>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        {tr("mkt.altar.s2Body")}
      </p>

      <p className="eyebrow eyebrow-lg mb-3 mt-12">{tr("mkt.altar.s3Eyebrow")}</p>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        {tr("mkt.altar.s3Body")}
      </p>

      <div className="invocation text-[var(--foreground-muted)] border-l-2 border-[var(--accent)] pl-4 py-2 mt-12">
        {tr("mkt.altar.liveNote")}
      </div>
    </MarketingToolLayout>
  );
}
