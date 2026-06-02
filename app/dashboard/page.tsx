import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionStatus, trialDaysLeft } from "@/lib/subscription";
import { getOrGenerateDailyHoroscope } from "@/lib/daily-horoscope/generate";
import { isValidSign } from "@/lib/daily-horoscope/prompt";
import { MemberHeader } from "@/components/member-header";

/**
 * The member dashboard — the daily devotional surface.
 *
 * Design language: candlelit, reverent, atmospheric. Like stepping into
 * the botanica at dawn. Each section has its own visual treatment so
 * the eye keeps moving instead of scanning identical cards.
 *
 * Imagery comes from originalbotanica.com's CloudFront CDN (same shots
 * used on the marketing site). Falls back gracefully if those URLs
 * change later.
 */

const OB_CDN = "https://dlkhclkmyx18n.cloudfront.net";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const sub = await getSubscriptionStatus(user.id);
  const trialLeft = trialDaysLeft(sub);

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, sun_sign")
    .eq("id", user.id)
    .maybeSingle();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const displayName = profile?.first_name || "friend";

  const sunSign = profile?.sun_sign || null;
  const dailyHoroscope =
    sunSign && isValidSign(sunSign)
      ? await getOrGenerateDailyHoroscope(sunSign).catch(() => null)
      : null;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="flex-1">
      {/* ── 1. Hero — candlelit invocation ────────────────────────────── */}
      <section
        aria-label="Today"
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-28 pb-16 overflow-hidden"
      >
        <MemberHeader />
        {/* Background candle photograph, dimmed for legibility */}
        <div className="absolute inset-0 -z-10">
          <Image
            src={`${OB_CDN}/spiritual-candles.png`}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
            style={{ objectPosition: "center" }}
          />
          {/* Warm vignette overlay to keep text readable on any image area */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(20,16,11,0.55) 0%, rgba(20,16,11,0.92) 75%, rgba(20,16,11,1) 100%)",
            }}
          />
        </div>

        <p className="eyebrow mb-3 text-[var(--foreground-muted)]">
          {today}
        </p>
        <p className="sublabel mb-10">{greeting}, {displayName}</p>

        <div className="candle-glow mb-10" aria-hidden>
          <Image
            src="/white-candle.png"
            alt=""
            width={120}
            height={200}
            priority
            className="h-auto"
          />
        </div>

        {sunSign && dailyHoroscope ? (
          <>
            <h1 className="display text-3xl md:text-4xl max-w-xl leading-tight">
              {sunSign}. Today the focus is{" "}
              <span className="italic text-[var(--accent)]">
                {dailyHoroscope.content.focus}
              </span>
              .
            </h1>
            <p className="invocation text-base md:text-lg text-[var(--foreground-muted)] mt-6 max-w-lg leading-relaxed">
              {dailyHoroscope.content.summary}
            </p>
          </>
        ) : (
          <>
            <h1 className="display text-3xl md:text-4xl max-w-xl leading-tight">
              Welcome to the practice.
            </h1>
            <p className="invocation text-base md:text-lg text-[var(--foreground-muted)] mt-6 max-w-lg leading-relaxed">
              Add your birth details and the astrologer will read for you each
              morning.
            </p>
          </>
        )}

        {sub.isTrialing && trialLeft !== null && (
          <p className="eyebrow mt-12 text-[var(--accent)]">
            {trialLeft} {trialLeft === 1 ? "day" : "days"} left in your trial
          </p>
        )}
      </section>

      {/* ── 2. Today's reading (astrology) — split layout ─────────────── */}
      <section
        aria-label="Today's astrological reading"
        className="border-t border-[var(--border)]"
      >
        <div className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="eyebrow mb-4">Today&apos;s reading</p>
            {dailyHoroscope ? (
              <>
                <h2 className="display text-2xl md:text-3xl mb-5 leading-tight">
                  {dailyHoroscope.content.action}
                </h2>
                <p className="text-[var(--foreground-muted)] leading-relaxed mb-6">
                  Drawn from your {sunSign} placement. For a longer reading
                  rooted in your full chart, speak with the astrologer.
                </p>
              </>
            ) : (
              <>
                <h2 className="display text-2xl md:text-3xl mb-5 leading-tight">
                  Your chart, your reading.
                </h2>
                <p className="text-[var(--foreground-muted)] leading-relaxed mb-6">
                  Add your birth date and city to receive a daily reading
                  personal to you, and to begin conversations with the
                  astrologer.
                </p>
              </>
            )}
            <Link
              href="/astrology"
              className="nav-link text-[var(--accent)] inline-flex items-center gap-2"
            >
              Ask your astrologer
              <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="relative aspect-[4/5] rounded-xl overflow-hidden border border-[var(--border)]">
            <Image
              src={`${OB_CDN}/cta-spiritual-services.jpg`}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(20,16,11,0) 50%, rgba(20,16,11,0.55) 100%)",
              }}
            />
          </div>
        </div>
      </section>

      {/* ── 3. Dreams — smoky liminal section ─────────────────────────── */}
      <section
        aria-label="Interpret a dream"
        className="relative border-t border-[var(--border)] overflow-hidden"
      >
        <div className="absolute inset-0 -z-10">
          <Image
            src={`${OB_CDN}/incense-smudges-resins.png`}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-25"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(20,16,11,0.7) 0%, rgba(20,16,11,0.95) 80%)",
            }}
          />
        </div>
        <div className="max-w-2xl mx-auto px-6 py-24 text-center">
          <p className="eyebrow mb-4">Dreams</p>
          <h2 className="display text-2xl md:text-3xl mb-4 leading-tight">
            What did the night bring?
          </h2>
          <p className="invocation text-[var(--foreground-muted)] mb-8 max-w-md mx-auto leading-relaxed">
            Describe a dream while it&apos;s still fresh. The interpretation
            honors Lucum&iacute;, Espiritismo, folk Catholic, and Western
            traditions. Every dream ends with a ritual.
          </p>
          <Link href="/dreams/new" className="btn-primary inline-flex">
            Interpret a dream
          </Link>
        </div>
      </section>

      {/* ── 4. Today's card (tarot) — centered composition ────────────── */}
      <section
        aria-label="Today's tarot card"
        className="border-t border-[var(--border)]"
        style={{
          background:
            "radial-gradient(ellipse at center top, rgba(232,172,124,0.06) 0%, transparent 60%)",
        }}
      >
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <p className="eyebrow mb-4">Your card today</p>
          <h2 className="display text-2xl md:text-3xl mb-3">
            The card is waiting.
          </h2>
          <p className="invocation text-[var(--foreground-muted)] mb-8 max-w-md mx-auto">
            Daily tarot arrives in Phase 2. One card, a paragraph of reading,
            and a question to sit with.
          </p>
          <Link
            href="/tarot"
            className="btn-ghost inline-flex"
          >
            Pull a card
          </Link>
        </div>
      </section>

      {/* ── 5. Your altar — two distinct surfaces ─────────────────────── */}
      <section
        aria-label="Your altar"
        className="relative border-t border-[var(--border)] overflow-hidden"
      >
        <div className="max-w-5xl mx-auto px-6 py-20">
          <p className="eyebrow mb-3 text-center">Your altar</p>
          <h2 className="display text-3xl md:text-4xl mb-4 text-center max-w-xl mx-auto leading-tight">
            Two surfaces, one practice.
          </h2>
          <p className="text-[var(--foreground-muted)] leading-relaxed text-center max-w-lg mx-auto mb-14">
            Your altar travels with you. Light a candle for an intention. Keep
            a flame for those who came before.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Virtual altar card */}
            <Link
              href="/altar/virtual"
              className="group relative aspect-[4/5] rounded-xl overflow-hidden border border-[var(--border)] hover:border-[var(--accent)] transition-colors"
            >
              <Image
                src={`${OB_CDN}/transforms/_miscImage/virtual-candle-altar.jpg`}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(20,16,11,0.15) 0%, rgba(20,16,11,0.9) 75%, rgba(20,16,11,0.98) 100%)",
                }}
              />
              <div className="absolute inset-x-0 bottom-0 p-8 text-center">
                <p className="eyebrow mb-2 text-[var(--accent)]">
                  Virtual altar
                </p>
                <h3 className="display text-2xl md:text-3xl mb-3 leading-tight">
                  Light a candle.
                </h3>
                <p className="text-[var(--foreground-muted)] text-sm leading-relaxed max-w-xs mx-auto">
                  For an intention. For protection. For someone you love who
                  needs the prayer.
                </p>
              </div>
            </Link>

            {/* Ancestors altar card */}
            <Link
              href="/ancestors"
              className="group relative aspect-[4/5] rounded-xl overflow-hidden border border-[var(--border)] hover:border-[var(--accent)] transition-colors"
            >
              <Image
                src={`${OB_CDN}/spiritual-candles.png`}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(20,16,11,0.15) 0%, rgba(20,16,11,0.9) 75%, rgba(20,16,11,0.98) 100%)",
                }}
              />
              <div className="absolute inset-x-0 bottom-0 p-8 text-center">
                <p className="eyebrow mb-2 text-[var(--accent)]">
                  Ancestors altar
                </p>
                <h3 className="display text-2xl md:text-3xl mb-3 leading-tight">
                  A flame for those who came before.
                </h3>
                <p className="text-[var(--foreground-muted)] text-sm leading-relaxed max-w-xs mx-auto">
                  Memorialize the ones you carry. Their names lit. Their stories
                  with you.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 6. A ritual for today — side-by-side with herbs imagery ───── */}
      <section
        aria-label="A ritual for today"
        className="border-t border-[var(--border)]"
      >
        <div className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-5 gap-10 items-center">
          <div className="md:col-span-2 relative aspect-square rounded-xl overflow-hidden border border-[var(--border)]">
            <Image
              src={`${OB_CDN}/herbs-roots_2022-09-13-200156_sxob.png`}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
          <div className="md:col-span-3">
            <p className="eyebrow mb-4">A ritual for today</p>
            <h2 className="display text-2xl md:text-3xl mb-5 leading-tight">
              The rituals library is coming.
            </h2>
            <p className="text-[var(--foreground-muted)] leading-relaxed mb-6">
              Sixty-six years of practice in the Bronx, curated and searchable.
              For grief. For protection. For love that needs to land. Each
              ritual a real entry from the botanica&apos;s archive.
            </p>
            <Link
              href="/rituals"
              className="nav-link text-[var(--accent)] inline-flex items-center gap-2"
            >
              Browse the library
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 7. Member benefit — quiet card ────────────────────────────── */}
      <section
        aria-label="Your member benefit"
        className="border-t border-[var(--border)] bg-[var(--background-elevated)]"
      >
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <p className="eyebrow mb-3">A member benefit</p>
          <h2 className="display text-2xl mb-3">10% off at the botanica</h2>
          <p className="text-[var(--foreground-muted)] leading-relaxed max-w-lg mx-auto mb-8">
            Sign in to originalbotanica.com with the same email and your
            discount applies automatically at checkout.
          </p>
          <a
            href="https://originalbotanica.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost inline-flex"
          >
            Shop the botanica
          </a>
        </div>
      </section>
    </main>
  );
}
