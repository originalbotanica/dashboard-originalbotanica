import Link from "next/link";
import { redirect } from "next/navigation";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/utils/supabase/admin";
import { termLabel, formatLongDate } from "@/lib/gift";

export const metadata = { title: "Your Original Botanica gift is confirmed" };

export default async function GiftSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  if (!session_id) redirect("/gift");

  const stripe = getStripe();
  let paid = false;
  let giftId: string | null = null;
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    paid = session.payment_status === "paid";
    giftId = session.metadata?.gift_id ?? null;
  } catch {
    redirect("/gift");
  }

  const admin = createAdminClient();
  const { data: gift } = giftId
    ? await admin
        .from("gift_purchases")
        .select("code, term_months, recipient_name, recipient_email, deliver_on")
        .eq("id", giftId)
        .maybeSingle()
    : { data: null };

  const who = gift?.recipient_name || gift?.recipient_email || "your recipient";
  const scheduled =
    gift?.deliver_on && gift.deliver_on > new Date().toISOString().slice(0, 10)
      ? formatLongDate(new Date(gift.deliver_on + "T00:00:00"))
      : null;

  return (
    <main className="min-h-screen">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center">
          <Link href="/" className="display text-lg tracking-wide text-[var(--foreground)]">
            Original Botanica
          </Link>
        </div>
      </header>

      <section className="max-w-xl mx-auto px-6 pt-20 pb-24 text-center">
        <p className="eyebrow mb-3 text-[var(--foreground-muted)]">
          {paid ? "Gift confirmed" : "Almost there"}
        </p>
        <h1 className="display text-3xl md:text-4xl leading-tight mb-5">
          {paid ? "The gift is given." : "Finishing up your gift…"}
        </h1>

        {paid ? (
          <>
            <p className="text-[var(--foreground-muted)] leading-relaxed mb-8">
              Thank you. You&apos;ve gifted {who}{" "}
              {gift ? termLabel(gift.term_months) : "a"} membership.{" "}
              {scheduled
                ? `We'll deliver it on ${scheduled}.`
                : "We've emailed it to them, and a copy to you."}
            </p>

            {gift?.code ? (
              <div className="mx-auto max-w-sm mb-8 rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface)] py-5 px-6">
                <p className="eyebrow mb-2 text-[var(--foreground-subtle)]">Gift code</p>
                <p className="display text-2xl tracking-wider text-[var(--accent)]">
                  {gift.code}
                </p>
                <p className="text-[var(--foreground-subtle)] text-xs mt-3">
                  Keep this in case you&apos;d like to share or print it yourself. It can be
                  redeemed at {""}
                  <span className="text-[var(--foreground-muted)]">/redeem</span>.
                </p>
              </div>
            ) : null}

            <Link href="/" className="btn-ghost inline-flex">
              Back to Original Botanica
            </Link>
          </>
        ) : (
          <p className="text-[var(--foreground-muted)] leading-relaxed">
            Your payment is still processing. If you completed checkout, your gift email
            will arrive shortly. You can close this page.
          </p>
        )}
      </section>
    </main>
  );
}
