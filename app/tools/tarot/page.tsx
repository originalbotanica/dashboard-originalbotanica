import { MarketingToolLayout } from "@/components/marketing-tool-layout";

export const metadata = {
  title: "Daily tarot",
  description:
    "Spin the wheel for your card today. One card a day from a hand-painted deck, with its meaning to carry with you.",
};

const OB_CDN = "https://dlkhclkmyx18n.cloudfront.net";

export default function TarotToolPage() {
  return (
    <MarketingToolLayout
      eyebrow="Tarot"
      headline="Spin the wheel. Meet your card."
      subhead="One card a day, drawn on a hand-painted wheel — its meaning to carry with you."
      heroImageUrl={`${OB_CDN}/transforms/Blog/_thumbnail/Tarot-Reading.jpg`}
    >
      <p className="eyebrow mb-3">The daily spin</p>
      <h2 className="display text-2xl md:text-3xl mb-6 leading-tight">
        Set the wheel turning. Stop it when the moment feels right.
      </h2>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        Twenty-one hand-painted Major Arcana cards ring the wheel. Touch the
        center to spin it, and stop it when your gut says so. It comes to rest
        on the card meant for your day. Stopping chooses the moment, not the
        card — the pull is already yours.
      </p>

      <p className="eyebrow mb-3 mt-12">Upright or upside down</p>
      <h2 className="display text-2xl md:text-3xl mb-6 leading-tight">
        Every card speaks two ways.
      </h2>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        A card that lands upright carries one message; the same card upside
        down turns it. The wheel reads whichever way yours falls and gives you
        its meaning in plain words — something to sit with, not a forecast.
      </p>

      <p className="eyebrow mb-3 mt-12">One card a day</p>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        Your card is drawn for you, and it holds steady from morning to night.
        Once you have turned the wheel, today's card stays with you. A new one
        waits when the wheel comes around again tomorrow.
      </p>

      <div className="invocation text-[var(--foreground-muted)] border-l-2 border-[var(--accent)] pl-4 py-2 mt-12">
        Live now for members. Your wheel is waiting on your dashboard.
      </div>
    </MarketingToolLayout>
  );
}
