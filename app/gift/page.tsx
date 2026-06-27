import Link from "next/link";
import { GiftForm } from "@/components/gift-form";

export const metadata = {
  title: "Give the gift of guidance — Original Botanica",
  description:
    "Gift a membership to Original Botanica: daily tarot, your birth chart, dream interpretation, a virtual altar, ancestor veneration, and a library of rituals. A prepaid gift — nothing renews.",
};

export default async function GiftPage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string }>;
}) {
  const { canceled } = await searchParams;

  return (
    <main className="min-h-screen">
      {/* Light public header */}
      <header className="border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="display text-lg tracking-wide text-[var(--foreground)]">
            Original Botanica
          </Link>
          <Link href="/redeem" className="nav-link text-[var(--foreground-muted)] hover:text-[var(--accent)]">
            Redeem a gift
          </Link>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 pt-16 pb-10 text-center">
        <p className="eyebrow mb-3 text-[var(--foreground-muted)]">Give the gift of guidance</p>
        <h1 className="display text-3xl md:text-5xl leading-tight mb-5">
          Give someone a season of light.
        </h1>
        <p className="invocation text-[var(--foreground-muted)] max-w-xl mx-auto leading-relaxed">
          A membership to Original Botanica — the Bronx botánica serving practitioners since 1959.
          A gift for a new practitioner, a grieving friend, or anyone walking a spiritual road.
        </p>
      </section>

      {canceled ? (
        <div className="max-w-xl mx-auto px-6 mb-8">
          <p className="text-center text-[var(--foreground-muted)] border border-[var(--border)] rounded-lg py-3 px-4 bg-[var(--surface)]">
            No worries — your gift wasn&apos;t purchased. Your details are below whenever you&apos;re ready.
          </p>
        </div>
      ) : null}

      <div className="max-w-5xl mx-auto px-6 pb-24 grid md:grid-cols-5 gap-12 md:gap-16 items-start">
        {/* What's inside */}
        <aside className="md:col-span-2">
          <p className="eyebrow mb-4">What&apos;s inside</p>
          <ul className="space-y-3 text-[var(--foreground-muted)] leading-relaxed">
            <li>A daily tarot pull from a hand-painted wheel</li>
            <li>Their birth chart, and an astrologer to talk with</li>
            <li>Dream interpretation in the tradition</li>
            <li>A virtual altar to light candles</li>
            <li>A place to honor their ancestors</li>
            <li>A library of rituals — with everything they need to do the work</li>
          </ul>
          <p className="text-[var(--foreground-subtle)] text-sm mt-6 leading-relaxed">
            A gift is prepaid for the full term and never renews. When it ends, it&apos;s
            entirely up to them whether to continue.
          </p>
        </aside>

        {/* Purchase form */}
        <div className="md:col-span-3 border border-[var(--border)] rounded-2xl bg-[var(--surface)] p-6 md:p-8">
          <GiftForm />
        </div>
      </div>
    </main>
  );
}
