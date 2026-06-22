import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { WHEEL_DECK } from "@/lib/tarot/wheel-deck";

/**
 * Public, no-login "card of the day" page — the destination for shared cards.
 *
 * A member shares their card; whoever opens the link sees the same card and
 * its meaning (upright, or upside down via ?r=1), framed with an invitation
 * to pull their own. Uses Chris's deck art and readings. No personal data,
 * no auth — this is the front door for word-of-mouth.
 */

const OB_STORE = "https://originalbotanica.com";

function resolve(id: string, r?: string) {
  const card = WHEEL_DECK.find((c) => c.id === id);
  if (!card) return null;
  const reversed = r === "1";
  // A side may be a single fortune or a list; show the first as the canonical
  // reading on the shared card so the link is stable.
  const side = reversed ? card.reversed : card.upright;
  const reading = Array.isArray(side) ? side[0] : side;
  return { card, reversed, reading };
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ r?: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { r } = await searchParams;
  const found = resolve(id, r);
  if (!found) return { title: "Tarot — Original Botanica" };
  const orient = found.reversed ? " (upside down)" : "";
  const title = `${found.card.name}${orient} — Original Botanica Tarot`;
  return {
    title,
    description: found.reading,
    openGraph: { title, description: found.reading },
    twitter: { card: "summary_large_image", title, description: found.reading },
  };
}

export default async function PublicCardPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ r?: string }>;
}) {
  const { id } = await params;
  const { r } = await searchParams;
  const found = resolve(id, r);
  if (!found) notFound();
  const { card, reversed, reading } = found;

  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="display text-lg text-[var(--foreground)]">
            Original Botanica
          </Link>
          <Link href="/signup" className="btn-ghost">
            Start free trial
          </Link>
        </div>
      </header>

      <section className="flex-1 max-w-2xl w-full mx-auto px-6 py-14 flex flex-col items-center text-center">
        <p className="eyebrow mb-6 text-[var(--foreground-muted)]">
          A card from Original Botanica
        </p>

        <img
          src={card.image}
          alt={card.name}
          draggable={false}
          style={{
            width: "min(64vw, 280px)",
            borderRadius: "12px",
            boxShadow: "0 12px 48px rgba(0,0,0,0.6)",
            transform: reversed ? "rotate(180deg)" : "none",
          }}
        />

        <p className="eyebrow mt-7 mb-2 text-[var(--accent)]">
          {reversed ? "Upside down" : "Upright"}
        </p>
        <h1 className="display text-3xl md:text-4xl leading-tight mb-5">
          {card.name}
        </h1>
        <p className="text-[var(--foreground-muted)] leading-relaxed max-w-xl text-lg">
          {reading}
        </p>

        <div className="mt-12 border-t border-[var(--border)] pt-10 w-full flex flex-col items-center">
          <h2 className="display text-2xl md:text-3xl leading-tight mb-3">
            Pull your own card today.
          </h2>
          <p className="text-[var(--foreground-muted)] leading-relaxed max-w-md mb-6">
            A daily card, your natal chart, dream interpretation, a virtual
            altar, and sixty-six years of rituals from the Bronx — your
            spiritual home, online.
          </p>
          <Link href="/signup" className="btn-primary">
            Start your 7-day free trial
          </Link>
          <p className="text-xs text-[var(--foreground-subtle)] mt-3">
            $24.95/month or $199.95/year. Cancel anytime.
          </p>
          <p className="text-sm mt-5">
            <Link href="/gift" className="text-[var(--accent)] hover:underline">
              Or give a membership as a gift →
            </Link>
          </p>
        </div>
      </section>

      <footer className="border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-6 py-6 text-center">
          <p className="eyebrow text-[var(--foreground-subtle)]">
            Original Botanica · the Bronx, since 1959 ·{" "}
            <a href={OB_STORE} className="hover:text-[var(--accent)]">
              originalbotanica.com
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
