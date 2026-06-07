import { MarketingToolLayout } from "@/components/marketing-tool-layout";

export const metadata = {
  title: "Rituals library | Original Botanica",
  description:
    "Sixty-six years of practice in the Bronx, curated and searchable. For grief, protection, love that needs to land.",
};

const OB_CDN = "https://dlkhclkmyx18n.cloudfront.net";

export default function RitualsToolPage() {
  return (
    <MarketingToolLayout
      eyebrow="Rituals"
      headline="Sixty-six years of practice."
      subhead="Curated and searchable. Real entries from Original Botanica's archive."
      heroImageUrl={`${OB_CDN}/herbs-roots_2022-09-13-200156_sxob.png`}
    >
      <p className="eyebrow mb-3">The archive</p>
      <h2 className="display text-2xl md:text-3xl mb-6 leading-tight">
        Three generations of practice, finally indexed.
      </h2>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        Since 1959 the botanica has guided people through cleansings,
        protections, love work, court work, road openings, ancestor work. The
        rituals library brings the most-asked-for of those rituals into a
        searchable shelf you can reach from anywhere.
      </p>

      <p className="eyebrow mb-3 mt-12">Search by need</p>
      <h2 className="display text-2xl md:text-3xl mb-6 leading-tight">
        For grief. For protection. For love that needs to land.
      </h2>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        Type the situation. The rituals that have served that situation for
        decades appear, ordered by relevance. Each entry tells you what you
        need, how to prepare, what day of the week, what to say, what to do
        with what is left over.
      </p>

      <p className="eyebrow mb-3 mt-12">Save your favorites</p>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        Tap the bookmark on any ritual and it lives on your saved shelf.
        Build the practice you keep coming back to.
      </p>

      <div className="invocation text-[var(--foreground-muted)] border-l-2 border-[var(--accent)] pl-4 py-2 mt-12">
        Live now for members. More than four hundred rituals from the
        botanica&apos;s archive, organized by purpose: money drawing,
        uncrossing, road opening, protection, love, and more.
      </div>
    </MarketingToolLayout>
  );
}
