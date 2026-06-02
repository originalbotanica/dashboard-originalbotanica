import { MarketingToolLayout } from "@/components/marketing-tool-layout";

export const metadata = {
  title: "Your astrologer | Original Botanica",
  description:
    "An AI astrologer trained on your chart and the traditions Original Botanica has served since 1959. Western, Lucumí, Espiritismo, folk Catholic.",
};

const OB_CDN = "https://dlkhclkmyx18n.cloudfront.net";

export default function AstrologyToolPage() {
  return (
    <MarketingToolLayout
      eyebrow="Astrology"
      headline="Your astrologer."
      subhead="Trained on your chart. Speaks the traditions Original Botanica has served since 1959."
      heroImageUrl={`${OB_CDN}/cta-spiritual-services.jpg`}
    >
      <p className="eyebrow mb-3">What it does</p>
      <h2 className="display text-2xl md:text-3xl mb-6 leading-tight">
        A reading rooted in your actual chart, not a generic horoscope.
      </h2>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        Tell us when and where you were born. We calculate your full natal
        chart, then load it into a conversation you can come back to. The
        astrologer references your specific placements. Sun in Scorpio, Moon
        in the 4th house, Saturn squaring your Venus. Not vibes. Real chart
        work.
      </p>

      <p className="eyebrow mb-3 mt-12">The voice</p>
      <h2 className="display text-2xl md:text-3xl mb-6 leading-tight">
        Grounded, direct, warm. Honest about hard transits.
      </h2>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        Trained on the traditions the botanica has served for three
        generations. Western astrology, Lucum&iacute;, Espiritismo, folk
        Catholic. Spanish appears where it fits. No love-and-light jargon. No
        empty reassurance. When a placement is hard, the reading says so.
      </p>

      <p className="eyebrow mb-3 mt-12">How readings end</p>
      <h2 className="display text-2xl md:text-3xl mb-6 leading-tight">
        Every reading ends with a ritual.
      </h2>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        Not abstract advice. A specific, concrete ritual for this week. Which
        candle to burn, what day of the week, what intention to set, where to
        place it. The kind of guidance you used to get from an elder at the
        kitchen table.
      </p>

      <p className="eyebrow mb-3 mt-12">What it will not do</p>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        No medical, legal, or financial advice. No predictions of death,
        catastrophic harm, or pregnancy outcomes. No analysis of named third
        parties. No readings for anyone under 18. If a conversation enters
        crisis territory, it pauses and offers real-world resources.
      </p>
    </MarketingToolLayout>
  );
}
