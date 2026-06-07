import { MarketingToolLayout } from "@/components/marketing-tool-layout";

export const metadata = {
  title: "Daily tarot",
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

      <p className="eyebrow mb-3 mt-12">Written for you</p>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        Your card is yours alone, drawn for you each day. The reading speaks
        to you by name, colored by your sign, in English or Spanish. The same
        card holds for you all day, and a new one waits at midnight.
      </p>

      <div className="invocation text-[var(--foreground-muted)] border-l-2 border-[var(--accent)] pl-4 py-2 mt-12">
        Live now for members. Your card is waiting on your dashboard.
      </div>
    </MarketingToolLayout>
  );
}
