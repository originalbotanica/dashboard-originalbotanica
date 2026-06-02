import { MarketingToolLayout } from "@/components/marketing-tool-layout";

export const metadata = {
  title: "Virtual altar | Original Botanica",
  description:
    "Light a candle from anywhere. For an intention. For protection. For someone you love who needs the prayer.",
};

const OB_CDN = "https://dlkhclkmyx18n.cloudfront.net";

export default function VirtualAltarToolPage() {
  return (
    <MarketingToolLayout
      eyebrow="Altar"
      headline="Light a candle."
      subhead="For an intention. For protection. For someone you love who needs the prayer."
      heroImageUrl={`${OB_CDN}/transforms/_miscImage/virtual-candle-altar.jpg`}
    >
      <p className="eyebrow mb-3">The flame</p>
      <h2 className="display text-2xl md:text-3xl mb-6 leading-tight">
        A candle lit and tended on your behalf.
      </h2>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        Choose the color for the work you are calling in. Set the intention.
        The candle burns at the botanica for the days you choose. You see it
        lit on your altar surface every time you open the app.
      </p>

      <p className="eyebrow mb-3 mt-12">When to light one</p>
      <h2 className="display text-2xl md:text-3xl mb-6 leading-tight">
        For the work that asks for fire.
      </h2>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        A petition you have been carrying. A friend in crisis. A court date.
        A surgery. A cleansing after a hard week. The first day of a new
        year. The traditions Original Botanica serves have used candles for
        all of it. The virtual altar carries that practice into the days you
        cannot visit the botanica in person.
      </p>

      <p className="eyebrow mb-3 mt-12">Your altar surface</p>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        Every candle you light appears on your altar in the dashboard. Names
        of intentions. Days remaining. The light stays with you between
        sessions. The practice travels with you.
      </p>

      <div className="invocation text-[var(--foreground-muted)] border-l-2 border-[var(--accent)] pl-4 py-2 mt-12">
        Coming soon. The virtual altar tool is being woven into this
        membership.
      </div>
    </MarketingToolLayout>
  );
}
