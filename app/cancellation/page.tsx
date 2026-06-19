import { LegalShell } from "@/components/legal-shell";

export const metadata = { title: "Cancellation & Refunds" };

export default function CancellationPage() {
  return (
    <LegalShell title="Cancellation & Refunds" updated="Draft · June 2026">
      <p>
        We want the membership to feel like a welcome, not a trap. Here&apos;s
        exactly how cancelling and refunds work.
      </p>

      <h2 className="display text-xl text-[var(--foreground)] pt-2">How to cancel</h2>
      <p>
        Go to <strong className="text-[var(--foreground)]">Account → Manage billing</strong>{" "}
        and cancel there. You can do it any time, in a couple of clicks. When you
        cancel, you keep access until the end of the period you&apos;ve already paid
        for; you won&apos;t be charged again after that.
      </p>

      <h2 className="display text-xl text-[var(--foreground)] pt-2">Free trial</h2>
      <p>
        New members get a 7-day free trial. If you cancel before the trial ends,
        you won&apos;t be charged. If you keep the membership past the trial, your
        plan begins and renews automatically.
      </p>

      <h2 className="display text-xl text-[var(--foreground)] pt-2">Refunds</h2>
      <p>
        Subscription charges are generally non-refundable, and cancelling stops
        future charges rather than refunding the current period — except where a
        refund is required by law. If you were charged in error or something went
        wrong, reach out and we&apos;ll make it right.
      </p>

      <h2 className="display text-xl text-[var(--foreground)] pt-2">Annual plans</h2>
      <p>
        Annual members keep access through the end of the paid year after
        cancelling, and the plan does not renew once cancelled.
      </p>

      <h2 className="display text-xl text-[var(--foreground)] pt-2">Need help?</h2>
      <p>
        Email{" "}
        <a href="mailto:info@originalbotanica.com" className="text-[var(--accent)] hover:underline">
          info@originalbotanica.com
        </a>{" "}
        or call{" "}
        <a href="tel:+17183679589" className="text-[var(--accent)] hover:underline">
          (718) 367-9589
        </a>
        , and a person from the botanica will help you.
      </p>
    </LegalShell>
  );
}
