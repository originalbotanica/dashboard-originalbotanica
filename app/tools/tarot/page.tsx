import { MarketingToolLayout } from "@/components/marketing-tool-layout";

export const metadata = {
  title: "Daily tarot | Original Botanica",
  description:
    "A card each morning. A paragraph of reading. A question to sit with. Pulled fresh for the day you are actually living.",
};

const OB_CDN = "https://dlkhclkmyx18n.cloudfront.net";

export default function TarotToolPage() {
  return (
    <MarketingToolLayout
      eyebrow="Tarot"
      headline="A card each morning."
      subhead="One pull. One paragraph. One question to sit with for the day."
      heroImageUrl={`${OB_CDN}/transforms/Blog/_thumbnail/Tarot-Reading.jpg`}
    >
      <p className="eyebrow mb-3">The daily pull</p>
      <h2 className="display text-2xl md:text-3xl mb-6 leading-tight">
        A single card. Read in the voice of the house.
      </h2>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        Not 78 cards in a Celtic cross. One card, pulled for today, with a
        paragraph that addresses what the card is asking of you right now. Read
        it over coffee. Carry it through the day. Notice when the card returns
        in conversation, in a stranger, in the weather.
      </p>

      <p className="eyebrow mb-3 mt-12">The question</p>
      <h2 className="display text-2xl md:text-3xl mb-6 leading-tight">
        Every reading ends with a question to sit with.
      </h2>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        Not a forecast. A reflection. The card opens a door. The question
        keeps it open. You return to it as the day unfolds.
      </p>

      <p className="eyebrow mb-3 mt-12">Pull anytime</p>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        Beyond the morning card, you can pull a card for any question, any
        moment. A decision waiting for clarity. A relationship asking
        attention. The deck is always shuffled in your hand.
      </p>

      <div className="invocation text-[var(--foreground-muted)] border-l-2 border-[var(--accent)] pl-4 py-2 mt-12">
        Coming with the next release. The card you join with today will be
        waiting tomorrow morning.
      </div>
    </MarketingToolLayout>
  );
}
