import { MarketingToolLayout } from "@/components/marketing-tool-layout";

export const metadata = {
  title: "Dream interpretation",
  description:
    "Describe a dream while it's still fresh. Symbols read through Lucumí, Espiritismo, folk Catholic, and Western dream traditions. Every dream ends with a ritual.",
};

const OB_CDN = "https://dlkhclkmyx18n.cloudfront.net";

export default function DreamsToolPage() {
  return (
    <MarketingToolLayout
      eyebrow="Dreams"
      headline="What did the night bring?"
      subhead="Describe a dream while it's still fresh. The interpretation honors the traditions Original Botanica has practiced for three generations."
      heroImageUrl={`${OB_CDN}/incense-smudges-resins.png`}
    >
      <p className="eyebrow mb-3">How it works</p>
      <h2 className="display text-2xl md:text-3xl mb-6 leading-tight">
        Type the dream in any order. The interpreter listens for what is
        charged.
      </h2>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        Water. Fire. Animals. The dead. Falling. Flying. Doors. Mirrors. The
        symbols carry weight in the traditions we serve. We name them, place
        them, and tell you what the dream is asking you to notice in waking
        life.
      </p>

      <p className="eyebrow mb-3 mt-12">The traditions</p>
      <h2 className="display text-2xl md:text-3xl mb-6 leading-tight">
        Four lineages of dreamwork, woven together.
      </h2>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        Lucum&iacute; dream symbols. Espiritismo. Folk Catholic dreamwork.
        Western Jungian. The interpretation draws on whichever tradition
        carries the meaning best for the dream you brought. A dream of a dead
        loved one is almost always treated as a real visit. We honor that
        frame.
      </p>

      <p className="eyebrow mb-3 mt-12">Your journal</p>
      <h2 className="display text-2xl md:text-3xl mb-6 leading-tight">
        Every dream you interpret is saved.
      </h2>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        Come back later. Reread. Notice the patterns. The same symbol
        appearing across months. The same person showing up at the same
        threshold. The journal is yours, private to your account, searchable
        when the library grows.
      </p>

      <p className="eyebrow mb-3 mt-12">Crisis-aware</p>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        If a conversation surfaces suicidal ideation, abuse, or trauma, the
        interpreter pauses the dream work and offers real-world resources.
        The dream can wait. Your safety cannot.
      </p>
    </MarketingToolLayout>
  );
}
