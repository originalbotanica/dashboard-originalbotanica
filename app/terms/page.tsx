import { LegalShell } from "@/components/legal-shell";

export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Service" updated="Draft · June 2026">
      <p>
        These terms govern your use of the Original Botanica membership at
        members.originalbotanica.com. By creating an account, you agree to them.
      </p>

      <h2 className="display text-xl text-[var(--foreground)] pt-2">Who can join</h2>
      <p>
        You must be 18 or older to use the membership. The readings and tools are
        offered for adults.
      </p>

      <h2 className="display text-xl text-[var(--foreground)] pt-2">What the membership is</h2>
      <p>
        The membership offers daily tarot, personal astrology, dream
        interpretation, a virtual altar, an ancestor altar, and a library of
        rituals drawn from Original Botanica&apos;s practice. These are offered for
        spiritual reflection and personal guidance. They are{" "}
        <strong className="text-[var(--foreground)]">not</strong> medical,
        psychological, legal, or financial advice, and are not a substitute for a
        qualified professional.
      </p>

      <h2 className="display text-xl text-[var(--foreground)] pt-2">Membership &amp; billing</h2>
      <p>
        The membership is a subscription: $24.95 per month or $199.95 per year,
        with a 7-day free trial for new members. After the trial, your plan renews
        automatically each period until you cancel. Payments are processed by
        Stripe. Prices may change with notice.
      </p>

      <h2 className="display text-xl text-[var(--foreground)] pt-2">Cancellation</h2>
      <p>
        You can cancel anytime from your account&apos;s billing portal. See our{" "}
        <a href="/cancellation" className="text-[var(--accent)] hover:underline">
          Cancellation &amp; Refunds
        </a>{" "}
        page for details.
      </p>

      <h2 className="display text-xl text-[var(--foreground)] pt-2">Using the service fairly</h2>
      <p>
        Your account is for you. Please don&apos;t share login credentials,
        attempt to disrupt the service, scrape it, or copy its content for
        redistribution.
      </p>

      <h2 className="display text-xl text-[var(--foreground)] pt-2">Content &amp; ownership</h2>
      <p>
        The site, its writing, and the artwork (including the tarot deck) belong to
        Original Botanica or its creators and are for your personal use within the
        membership. What you write — your dreams and notes — remains yours; you
        grant us permission to store and process it to provide the service.
      </p>

      <h2 className="display text-xl text-[var(--foreground)] pt-2">No guarantees</h2>
      <p>
        The membership is provided &quot;as is.&quot; Spiritual guidance is offered
        in good faith for reflection; we don&apos;t promise particular outcomes. To
        the extent permitted by law, Original Botanica is not liable for indirect
        or consequential damages arising from use of the service.
      </p>

      <h2 className="display text-xl text-[var(--foreground)] pt-2">Changes &amp; contact</h2>
      <p>
        We may update these terms; we&apos;ll post changes here with a new date.
        These terms are governed by the laws of the State of New York. Questions:{" "}
        <a href="mailto:info@originalbotanica.com" className="text-[var(--accent)] hover:underline">
          info@originalbotanica.com
        </a>
        .
      </p>
    </LegalShell>
  );
}
