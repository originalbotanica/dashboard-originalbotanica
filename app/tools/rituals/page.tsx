import { MarketingToolLayout } from "@/components/marketing-tool-layout";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionary";

export const metadata = {
  title: "Rituals library",
  description:
    "Sixty-six years of practice in The Bronx, curated and searchable. For grief, protection, love that needs to land.",
};

const OB_CDN = "https://dlkhclkmyx18n.cloudfront.net";

export default async function RitualsToolPage() {
  const locale = await getLocale();
  const tr = (k: string) => t(locale, k);
  return (
    <MarketingToolLayout
      eyebrow={tr("mkt.rit.eyebrow")}
      headline={tr("mkt.rit.headline")}
      subhead={tr("mkt.rit.subhead")}
      heroImageUrl={`${OB_CDN}/herbs-roots_2022-09-13-200156_sxob.png`}
      graphicSrc="/landing/tile-rituals.jpg"
      graphicAlt="Ritual library"
    >
      <p className="eyebrow mb-3">{tr("mkt.rit.s1Eyebrow")}</p>
      <h2 className="display text-2xl md:text-3xl mb-6 leading-tight">
        {tr("mkt.rit.s1Title")}
      </h2>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        {tr("mkt.rit.s1Body")}
      </p>

      <p className="eyebrow mb-3 mt-12">{tr("mkt.rit.s2Eyebrow")}</p>
      <h2 className="display text-2xl md:text-3xl mb-6 leading-tight">
        {tr("mkt.rit.s2Title")}
      </h2>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        {tr("mkt.rit.s2Body")}
      </p>

      <p className="eyebrow mb-3 mt-12">{tr("mkt.rit.s3Eyebrow")}</p>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        {tr("mkt.rit.s3Body")}
      </p>

      <div className="invocation text-[var(--foreground-muted)] border-l-2 border-[var(--accent)] pl-4 py-2 mt-12">
        {tr("mkt.rit.liveNote")}
      </div>
    </MarketingToolLayout>
  );
}
