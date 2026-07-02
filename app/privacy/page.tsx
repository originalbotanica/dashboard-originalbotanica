import { LegalShell } from "@/components/legal-shell";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="Draft · June 2026">
      <p>
        This policy explains what Original Botanica collects when you use the
        membership at members.originalbotanica.com, how we use it, and the
        choices you have. Questions: email{" "}
        <a href="mailto:info@originalbotanica.com" className="text-[var(--accent)] hover:underline">
          info@originalbotanica.com
        </a>
        .
      </p>

      <h2 className="display text-xl text-[var(--foreground)] pt-2">What we collect</h2>
      <p>
        <strong className="text-[var(--foreground)]">Account.</strong> Your email
        address and a password, handled by our authentication provider.
      </p>
      <p>
        <strong className="text-[var(--foreground)]">Profile.</strong> Your first
        name and, for your astrology readings, your birth date, birth time (if you
        provide it), and birth place.
      </p>
      <p>
        <strong className="text-[var(--foreground)]">What you create.</strong> The
        dreams you submit for interpretation, the ancestors and candles you add to
        your altars, the rituals you save, and related notes.
      </p>
      <p>
        <strong className="text-[var(--foreground)]">Payments.</strong> Your
        subscription is processed by Stripe. Stripe handles your card details; we
        do not see or store full card numbers.
      </p>
      <p>
        <strong className="text-[var(--foreground)]">Usage.</strong> Basic
        analytics about how the site is used, to keep it working and improve it.
      </p>

      <h2 className="display text-xl text-[var(--foreground)] pt-2">How we use it</h2>
      <p>
        To provide the membership and personalize your readings; to process your
        subscription; to keep your altars and journal saved for you; to operate,
        secure, and improve the service; and to contact you about your account.
      </p>

      <h2 className="display text-xl text-[var(--foreground)] pt-2">AI-generated readings</h2>
      <p>
        Some readings, including your dream interpretations and parts of your
        astrology guidance, are generated with the help of AI. Content you submit (for
        example, a dream you describe) may be processed by our AI provider to
        generate your reading. These readings are for reflection, not professional
        advice.
      </p>

      <h2 className="display text-xl text-[var(--foreground)] pt-2">Who we share with</h2>
      <p>
        We share information only with the service providers that make the
        membership work: our hosting and database provider, Stripe for payments,
        and our AI provider for readings. We also share where required by law or
        in connection with a business transfer. <strong className="text-[var(--foreground)]">We do not sell your personal information.</strong>
      </p>

      <h2 className="display text-xl text-[var(--foreground)] pt-2">Your choices</h2>
      <p>
        You can view and update your profile in the app, and you can ask us to
        access or delete your personal data by emailing{" "}
        <a href="mailto:info@originalbotanica.com" className="text-[var(--accent)] hover:underline">
          info@originalbotanica.com
        </a>
        . Deleting your account removes your journal, altars, and profile.
      </p>

      <h2 className="display text-xl text-[var(--foreground)] pt-2">Children</h2>
      <p>
        The membership is for adults. It is not intended for anyone under 18, and
        we do not knowingly collect information from minors.
      </p>

      <h2 className="display text-xl text-[var(--foreground)] pt-2">Security &amp; changes</h2>
      <p>
        We take reasonable measures to protect your information, though no online
        service can promise perfect security. If this policy changes, we&apos;ll
        update this page and the date above.
      </p>
    </LegalShell>
  );
}
