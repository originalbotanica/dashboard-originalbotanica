import { MarketingToolLayout } from "@/components/marketing-tool-layout";

export const metadata = {
  title: "Ancestors altar",
  description:
    "A flame for those who came before. Memorialize the ones you carry. Their names lit, their stories with you.",
};

const OB_CDN = "https://dlkhclkmyx18n.cloudfront.net";

export default function AncestorsToolPage() {
  return (
    <MarketingToolLayout
      eyebrow="Ancestors"
      headline="A flame for those who came before."
      subhead="Memorialize the ones you carry. Their names lit. Their stories with you."
      heroImageUrl={`${OB_CDN}/spiritual-candles.png`}
    >
      <p className="eyebrow mb-3">The practice</p>
      <h2 className="display text-2xl md:text-3xl mb-6 leading-tight">
        Honoring the dead is not a metaphor in the traditions we serve.
      </h2>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        Espiritismo, Lucum&iacute;, folk Catholic. Each tradition places the
        ancestors at the center. They guide. They protect. They ask to be
        remembered. The ancestors altar gives you a place to remember them
        well, every day, wherever you are.
      </p>

      <p className="eyebrow mb-3 mt-12">What you do</p>
      <h2 className="display text-2xl md:text-3xl mb-6 leading-tight">
        Add a name. Add a photo. Light their flame.
      </h2>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        Your grandmother. Your father. A child you lost. A teacher. A
        friend taken too early. Their face on your altar, their name spoken,
        their flame lit on the days that matter. Birthdays. Death dates. The
        ordinary Tuesdays when you miss them most.
      </p>

      <p className="eyebrow mb-3 mt-12">A flame that stays</p>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        Your ancestors altar travels with you between devices. Their candles
        keep burning between visits. The work of remembering them is part of
        your daily practice, not a one-time gesture.
      </p>

      <p className="eyebrow mb-3 mt-12">Share with family</p>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        Each memorial gets a private link you can send to family. They can
        view the candle and add their own light. They do not need to be
        members. Honoring is something the whole family can do together.
      </p>
    </MarketingToolLayout>
  );
}
