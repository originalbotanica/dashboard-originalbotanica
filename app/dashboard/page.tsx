import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionStatus, trialDaysLeft } from "@/lib/subscription";

/**
 * The member dashboard — the daily devotional surface.
 *
 * Structure: vertical scroll, mobile-first, reads like a daily practice.
 *
 *   1. Hero altar moment    — full-screen candle + today's invocation
 *   2. Today's card         — large tarot pull with a paragraph reading
 *   3. Today's reading      — personal astrological note for the day
 *   4. Your altar           — currently burning candles + ancestor flame
 *   5. A ritual for today   — one curated ritual by day/moon/season
 *   6. Your member benefit  — 10% discount, prominent but quiet
 *
 * In this scaffold each section is a PLACEHOLDER block. The real widgets
 * arrive across Phase 1 (Altar, Rituals stub), Phase 2 (Tarot, Astrology),
 * and Phase 3 (Ancestors).
 *
 * Middleware guarantees only authenticated users reach this route.
 * We still re-fetch the user here to render their name and gate the
 * page behind an active subscription if Phase 0 wiring is complete.
 */
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware shouldn't let us get here without a user, but be defensive.
  if (!user) {
    return null;
  }

  const sub = await getSubscriptionStatus(user.id);
  const trialLeft = trialDaysLeft(sub);

  // The user's first name lives in the profiles table (set during
  // profile-setup), not in Supabase auth metadata. Read it from there.
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name")
    .eq("id", user.id)
    .maybeSingle();

  // Time-of-day greeting in the user's locale. We'll wire i18n properly
  // later; for now, English-only.
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const displayName = profile?.first_name || "friend";

  return (
    <main className="flex-1">
      {/* ── 1. Hero altar moment ──────────────────────────────────────── */}
      <section
        aria-label="Today"
        className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-16"
      >
        <p className="sublabel mb-4">{greeting}, {displayName}</p>

        <div className="candle-glow my-8" aria-hidden>
          {/* TODO: real candle SVG once we have it. Placeholder for now. */}
          <div
            className="w-20 h-32 mx-auto rounded-md"
            style={{
              background:
                "linear-gradient(180deg, #f6e8c8 0%, #e8d4a0 65%, #c9a86a 100%)",
              boxShadow: "0 0 60px rgba(232, 172, 124, 0.5)",
            }}
          />
        </div>

        <h1 className="display text-4xl md:text-5xl max-w-xl">
          Today the moon waxes in Scorpio.
        </h1>
        <p className="invocation text-lg text-[var(--foreground-muted)] mt-4 max-w-md">
          A good day for inward work.
        </p>

        {sub.isTrialing && trialLeft !== null && (
          <p className="eyebrow mt-12 text-[var(--accent)]">
            {trialLeft} {trialLeft === 1 ? "day" : "days"} left in your trial
          </p>
        )}
      </section>

      {/* ── 2. Today's card ──────────────────────────────────────────── */}
      <section
        aria-label="Today's tarot card"
        className="px-6 py-16 max-w-3xl mx-auto border-t border-[var(--border)]"
      >
        <p className="eyebrow mb-4">Your card today</p>
        <h2 className="display text-3xl mb-4">[Tarot card name]</h2>
        <p className="text-[var(--foreground-muted)] leading-relaxed">
          [Placeholder — a single paragraph of reading, pulled from the Tarot
          tool once it&apos;s built in Phase 2. Tappable to deepen.]
        </p>
        <Link href="/tarot" className="nav-link mt-6 inline-block text-[var(--accent)]">
          Pull a new card →
        </Link>
      </section>

      {/* ── 3. Today's reading ───────────────────────────────────────── */}
      <section
        aria-label="Today's astrological reading"
        className="px-6 py-16 max-w-3xl mx-auto border-t border-[var(--border)]"
      >
        <p className="eyebrow mb-4">Today&apos;s reading</p>
        <h2 className="display text-3xl mb-4">[Astrological note]</h2>
        <p className="text-[var(--foreground-muted)] leading-relaxed">
          [Placeholder — personalized to your chart. Comes from the Astrology
          module once we port it in Phase 2.]
        </p>
        <Link href="/astrology" className="nav-link mt-6 inline-block text-[var(--accent)]">
          Ask your astrologer →
        </Link>
      </section>

      {/* ── 4. Your altar ────────────────────────────────────────────── */}
      <section
        aria-label="Your altar"
        className="px-6 py-16 max-w-3xl mx-auto border-t border-[var(--border)]"
      >
        <p className="eyebrow mb-4">Your altar</p>
        <h2 className="display text-3xl mb-4">No candles burning yet</h2>
        <p className="text-[var(--foreground-muted)] leading-relaxed">
          [Placeholder — list of currently lit candles + ancestor flame.
          Built in Phase 1.]
        </p>
        <Link href="/altar" className="nav-link mt-6 inline-block text-[var(--accent)]">
          Tend your altar →
        </Link>
      </section>

      {/* ── 5. A ritual for today ────────────────────────────────────── */}
      <section
        aria-label="A ritual for today"
        className="px-6 py-16 max-w-3xl mx-auto border-t border-[var(--border)]"
      >
        <p className="eyebrow mb-4">A ritual for today</p>
        <h2 className="display text-3xl mb-4">[Ritual title]</h2>
        <p className="text-[var(--foreground-muted)] leading-relaxed">
          [Placeholder — one curated ritual surfaced by day-of-week, moon
          phase, or season. Comes from the rituals library in Phase 3.]
        </p>
        <Link href="/rituals" className="nav-link mt-6 inline-block text-[var(--accent)]">
          Browse the library →
        </Link>
      </section>

      {/* ── 6. Member benefit ────────────────────────────────────────── */}
      <section
        aria-label="Your member benefit"
        className="px-6 py-16 max-w-3xl mx-auto border-t border-[var(--border)]"
      >
        <p className="eyebrow mb-4">Your member benefit</p>
        <h2 className="display text-3xl mb-4">10% off at the botanica</h2>
        <p className="text-[var(--foreground-muted)] leading-relaxed">
          As a member, your 10% discount is applied automatically at
          checkout when you sign in to originalbotanica.com.
        </p>
        <a
          href="https://originalbotanica.com"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost mt-6 inline-block"
        >
          Shop the botanica
        </a>
      </section>
    </main>
  );
}
