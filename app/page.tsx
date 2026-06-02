import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

/**
 * Marketing homepage (logged out).
 *
 * Visual treatment matches the member dashboard. Candle photograph as
 * a backdrop, minimal text on a warm vignette. The whole page reads
 * like an invocation, not a SaaS landing.
 */

const OB_CDN = "https://dlkhclkmyx18n.cloudfront.net";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  // Case 1: arriving with ?code=... — exchange it for a session.
  if (params.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(params.code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name")
          .eq("id", user.id)
          .maybeSingle();
        if (!profile?.first_name) redirect("/profile-setup");
        redirect("/dashboard");
      }
    }
  }

  // Case 2: already signed in — route them onward.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile?.first_name) redirect("/profile-setup");
    redirect("/dashboard");
  }

  // Case 3: logged out — marketing.
  return (
    <main className="flex-1">
      {/* Hero with candle backdrop */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 py-24 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src={`${OB_CDN}/spiritual-candles.png`}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(20,16,11,0.55) 0%, rgba(20,16,11,0.92) 75%, rgba(20,16,11,1) 100%)",
            }}
          />
        </div>

        <p className="sublabel mb-6">Original Botanica</p>
        <h1 className="display text-5xl md:text-6xl mb-8 max-w-3xl leading-tight">
          Your spiritual home, online.
        </h1>
        <p className="text-lg md:text-xl text-[var(--foreground-muted)] leading-relaxed mb-12 max-w-2xl">
          Daily tarot. Personal astrology. Dream interpretation. Your virtual
          altar. A flame for those who came before. A library of rituals from
          sixty-six years of practice in the Bronx.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/signup" className="btn-primary">
            Start 7-day free trial
          </Link>
          <Link href="/login" className="btn-ghost">
            Sign in
          </Link>
        </div>
        <p className="eyebrow mt-16 text-[var(--foreground-subtle)]">
          The Bronx, since 1959
        </p>
      </section>

      {/* What's inside — three-up with imagery */}
      <section
        aria-label="What's inside the membership"
        className="border-t border-[var(--border)]"
      >
        <div className="max-w-5xl mx-auto px-6 py-24">
          <p className="eyebrow mb-3 text-center">What you join</p>
          <h2 className="display text-3xl md:text-4xl mb-16 text-center max-w-2xl mx-auto leading-tight">
            Seven tools. One practice.
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              imageSrc={`${OB_CDN}/cta-spiritual-services.jpg`}
              title="Your astrologer"
              body="Trained on your chart. Speaks Western, Lucumí, Espiritismo, folk Catholic. Honest about hard transits."
            />
            <FeatureCard
              imageSrc={`${OB_CDN}/incense-smudges-resins.png`}
              title="Dream interpretation"
              body="Describe a dream while it's still fresh. Symbols read through the traditions. A small ritual to honor it."
            />
            <FeatureCard
              imageSrc={`${OB_CDN}/transforms/Blog/_thumbnail/Tarot-Reading.jpg`}
              title="Daily tarot"
              body="A card each morning, a paragraph of reading, a question to sit with."
            />
            <FeatureCard
              imageSrc={`${OB_CDN}/transforms/_miscImage/virtual-candle-altar.jpg`}
              title="Virtual altar"
              body="Light a candle for an intention. For protection. For someone you love who needs the prayer."
            />
            <FeatureCard
              imageSrc={`${OB_CDN}/spiritual-candles.png`}
              title="Ancestors altar"
              body="A flame for those who came before. Memorialize the ones you carry. Their names lit, their stories with you."
            />
            <FeatureCard
              imageSrc={`${OB_CDN}/herbs-roots_2022-09-13-200156_sxob.png`}
              title="Rituals library"
              body="Sixty-six years of practice in the Bronx. Searchable. For grief, protection, love that needs to land."
            />
            <FeatureCard
              imageSrc={`${OB_CDN}/spiritual-baths-washes.png`}
              title="Member discount"
              body="10% off everything at originalbotanica.com. Applied automatically at checkout."
            />
          </div>
        </div>
      </section>

      {/* Closing CTA on warm backdrop */}
      <section className="relative border-t border-[var(--border)] overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src={`${OB_CDN}/herbs-roots_2022-09-13-200156_sxob.png`}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-25"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(20,16,11,0.75) 0%, rgba(20,16,11,0.96) 80%, rgba(20,16,11,1) 100%)",
            }}
          />
        </div>
        <div className="max-w-2xl mx-auto px-6 py-24 text-center">
          <h2 className="display text-3xl md:text-4xl mb-6 leading-tight">
            Try it for seven days.
          </h2>
          <p className="text-[var(--foreground-muted)] leading-relaxed mb-10 max-w-lg mx-auto">
            No charge until day eight. Cancel any time. The chart, the
            astrologer, the altar, all open the moment you join.
          </p>
          <Link href="/signup" className="btn-primary inline-flex">
            Start your trial
          </Link>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  imageSrc,
  title,
  body,
}: {
  imageSrc: string;
  title: string;
  body: string;
}) {
  return (
    <div className="group">
      <div className="relative aspect-[4/3] mb-5 rounded-xl overflow-hidden border border-[var(--border)]">
        <Image
          src={imageSrc}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(20,16,11,0) 50%, rgba(20,16,11,0.45) 100%)",
          }}
        />
      </div>
      <h3 className="display text-xl mb-2">{title}</h3>
      <p className="text-[var(--foreground-muted)] leading-relaxed text-sm">
        {body}
      </p>
    </div>
  );
}
