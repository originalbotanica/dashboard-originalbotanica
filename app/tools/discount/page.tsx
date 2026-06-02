import { MarketingToolLayout } from "@/components/marketing-tool-layout";

export const metadata = {
  title: "Member discount | Original Botanica",
  description:
    "10% off everything at originalbotanica.com. Applied automatically at checkout when you sign in.",
};

const OB_CDN = "https://dlkhclkmyx18n.cloudfront.net";

export default function DiscountToolPage() {
  return (
    <MarketingToolLayout
      eyebrow="Member benefit"
      headline="10% off everything."
      subhead="At originalbotanica.com. Applied automatically at checkout when you sign in with the same email."
      heroImageUrl={`${OB_CDN}/spiritual-baths-washes.png`}
    >
      <p className="eyebrow mb-3">How it works</p>
      <h2 className="display text-2xl md:text-3xl mb-6 leading-tight">
        Sign in to the shop. The discount is already there.
      </h2>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        Your membership account links to your shop account by email. When
        you check out at originalbotanica.com, the 10% is already applied to
        your cart. No code to remember. No coupon to clip.
      </p>

      <p className="eyebrow mb-3 mt-12">What it covers</p>
      <h2 className="display text-2xl md:text-3xl mb-6 leading-tight">
        Every candle. Every oil. Every spiritual bath.
      </h2>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        The full catalog. Candles for every working. Oils and waters for
        cleansings, attractions, protections, road openings. Herbs and roots,
        loose and bundled. Spiritual baths and washes. Incense, resins,
        sahumerios. Statues of the Orishas and the Saints. Amulets and
        talismans.
      </p>

      <p className="eyebrow mb-3 mt-12">Pays for itself</p>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
        For most members, the discount alone covers the membership. Buy two
        7-day candles, a despojo bath, and a Florida Water across the year,
        and you have already saved more than you spent on the membership. The
        tools are the rest.
      </p>
    </MarketingToolLayout>
  );
}
