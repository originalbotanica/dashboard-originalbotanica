import { LegalShell } from "@/components/legal-shell";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="Last updated: July 2026">
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

      <h2 className="display text-xl text-[var(--foreground)] pt-2">The private things you share</h2>
      <p>
        Your practice is intimate — prayers, dreams, the people you grieve — and
        we treat it that way. Your petitions and dreams are private by default:
        a candle appears on the community altar only if you choose to share it,
        and your petition stays private even then unless you separately choose
        to share it too. Memorial pages are visible only to people you give the
        private link. We never use what you write in your practice for
        advertising, and we never use it to train AI models.
      </p>

      <h2 className="display text-xl text-[var(--foreground)] pt-2">How we use it</h2>
      <p>
        To provide the membership and personalize your readings; to process your
        subscription; to keep your altars and journal saved for you; to operate,
        secure, and improve the service; and to contact you about your account.
      </p>
      <p>
        <strong className="text-[var(--foreground)]">Email.</strong> As a member
        you&apos;ll also receive our newsletter — the botanica&apos;s teachings,
        seasonal workings, and offers, usually twice a week. Every one has an
        unsubscribe link, and opting out of the newsletter never affects your
        membership or account emails.
      </p>

      <h2 className="display text-xl text-[var(--foreground)] pt-2">AI-generated readings</h2>
      <p>
        Some readings, including your dream interpretations and parts of your
        astrology guidance, are generated with the help of AI. Content you submit (for
        example, a dream you describe) may be processed by our AI provider to
        generate your reading. Under our agreement with our AI provider, what
        you submit is not used to train AI models. These readings are for
        reflection, not professional advice.
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

      <h2 className="display text-xl text-[var(--foreground)] pt-2">Cookies &amp; retention</h2>
      <p>
        We use only the cookies needed to keep you signed in and the site
        working — no advertising or cross-site tracking cookies. We keep your
        information while your account is active; when you delete your account,
        your journal, altars, and profile are removed, and we keep only what the
        law requires us to keep (like payment records).
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
