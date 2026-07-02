import { MarketingToolLayout } from "@/components/marketing-tool-layout";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionary";

export const metadata = {
  title: "Daily tarot",
  description:
    "Spin the wheel for your card today. One card a day from a hand-painted deck, with its meaning to carry with you.",
};

const OB_CDN = "https://dlkhclkmyx18n.cloudfront.net";

export default async function TarotToolPage() {
  const locale = await getLocale();
  const tr = (k: string) => t(locale, k);
  return (
    <MarketingToolLayout
      eyebrow={tr("mkt.tarot.eyebrow")}
      headline={tr("mkt.tarot.headline")}
      subhead={tr("mkt.tarot.subhead")}
      heroImageUrl={`${OB_CDN}/transforms/Blog/_thumbnail/Tarot-Reading.jpg`}
      graphicSrc="/tarot-wheel/wheel_full.png"
      graphicAlt="The daily tarot wheel"
      graphicFit="contain"
    >
      <p className="eyebrow mb-3">{tr("mkt.tarot.s1Eyebrow")}</p>
      <h2 className="display text-2xl md:text-3xl mb-6 leading-tight">
        {tr("mkt.tarot.s1Title")}
      </h2>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        {tr("mkt.tarot.s1Body")}
      </p>

      <p className="eyebrow mb-3 mt-12">{tr("mkt.tarot.s2Eyebrow")}</p>
      <h2 className="display text-2xl md:text-3xl mb-6 leading-tight">
        {tr("mkt.tarot.s2Title")}
      </h2>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        {tr("mkt.tarot.s2Body")}
      </p>

      <p className="eyebrow mb-3 mt-12">{tr("mkt.tarot.s3Eyebrow")}</p>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        {tr("mkt.tarot.s3Body")}
      </p>

      <div className="invocation text-[var(--foreground-muted)] border-l-2 border-[var(--accent)] pl-4 py-2 mt-12">
        {tr("mkt.tarot.liveNote")}
      </div>
    </MarketingToolLayout>
  );
}
