import { LegalShell } from "@/components/legal-shell";

export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Service" updated="Last updated: July 2026">
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
        spiritual reflection and entertainment; outcomes are not guaranteed. They
        are <strong className="text-[var(--foreground)]">not</strong> medical,
        psychological, legal, or financial advice, and are not a substitute for a
        qualified professional. If you are facing a serious situation, please
        bring it to a qualified professional as well as to your practice.
      </p>

      <h2 className="display text-xl text-[var(--foreground)] pt-2">Membership &amp; billing</h2>
      <p>
        The membership is a subscription: $29.95 per month or $299.95 per year,
        with a 7-day free trial for new members. After the trial, your plan renews
        automatically each period until you cancel. Payments are processed by
        Stripe. If we change the price, we&apos;ll tell you at least 30 days
        before it takes effect; the new price applies from your next renewal,
        and you can cancel before then.
      </p>

      <h2 className="display text-xl text-[var(--foreground)] pt-2">Gift memberships</h2>
      <p>
        A gift membership is paid once, up front, for its full term. It never
        renews and no one is charged again. Unredeemed gift codes do not
        expire. Gift codes aren&apos;t redeemable for cash except where the law
        requires it.
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

      <h2 className="display text-xl text-[var(--foreground)] pt-2">Sharing on the altars</h2>
      <p>
        If you choose to place a candle on the community altar, the dedication
        you write (and your petition, only if you choose to share it) is shown
        to other members, and you give us permission to display it there. Keep
        shared words kind and lawful: no threats, harassment, hate, or posting
        someone&apos;s private information. We may remove shared content that
        breaks these rules and may suspend accounts that repeatedly do.
      </p>
      <p>
        The ancestors altar lets you memorialize people and share a private
        link with family. By adding a name, story, or photo, you confirm you
        have the right to share it. If something about you or a loved one
        appears on a memorial and you want it removed, email{" "}
        <a href="mailto:info@originalbotanica.com" className="text-[var(--accent)] hover:underline">
          info@originalbotanica.com
        </a>{" "}
        and we&apos;ll take care of it.
      </p>

      <h2 className="display text-xl text-[var(--foreground)] pt-2">Content &amp; ownership</h2>
      <p>
        The site, its writing, and the artwork (including the tarot deck) belong to
        Original Botanica or its creators and are for your personal use within the
        membership. What you write (your dreams and notes) remains yours; you
        grant us permission to store and process it to provide the service.
      </p>

      <h2 className="display text-xl text-[var(--foreground)] pt-2">No guarantees</h2>
      <p>
        The membership is provided &quot;as is.&quot; Spiritual guidance is offered
        in good faith for reflection; we don&apos;t promise particular outcomes. To
        the extent permitted by law, Original Botanica is not liable for indirect
        or consequential damages arising from use of the service, and our total
        liability for any claim is limited to the amount you paid us in the
        twelve months before the claim arose.
      </p>

      <h2 className="display text-xl text-[var(--foreground)] pt-2">Ending an account</h2>
      <p>
        You can stop using the membership any time (see Cancellation). We may
        suspend or close accounts that violate these terms. If we close your
        account without cause, we&apos;ll refund the unused portion of what
        you&apos;ve prepaid.
      </p>

      <h2 className="display text-xl text-[var(--foreground)] pt-2">If we have a dispute</h2>
      <p>
        Talk to us first — email{" "}
        <a href="mailto:info@originalbotanica.com" className="text-[var(--accent)] hover:underline">
          info@originalbotanica.com
        </a>{" "}
        and a person from the botanica will try to make it right within 30
        days. If we can&apos;t resolve it, you and Original Botanica agree to
        resolve the dispute by binding individual arbitration administered by
        the American Arbitration Association under its Consumer Arbitration
        Rules, rather than in court, and each of us waives the right to bring
        or join a class action. You can always bring a qualifying claim in
        small claims court instead, and this section doesn&apos;t limit rights
        that the law doesn&apos;t allow to be waived.
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
