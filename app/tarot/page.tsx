import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { DailyTarotCard } from "@/components/daily-tarot-card";
import {
  drawDailyCardForUser,
  botanicaDayKey,
  tarotImagePath,
} from "@/lib/tarot/deck";
import { getOrGenerateDailyTarotReading } from "@/lib/daily-tarot/generate";

export const metadata = {
  title: "Your daily tarot",
  description:
    "Pull your card for today. One card, a reading in the voice of the house, and a question to sit with.",
};

/**
 * The dedicated daily tarot pull.
 *
 * Reached from the dashboard teaser. This is where the ritual happens: the
 * card waits face down, the member turns it, and behind it is the real
 * Rider-Waite image with a reading written for them today.
 *
 * The card is drawn per member per day (deterministic) and the personalized
 * reading is generated and cached here on first view of the day.
 */
export default async function TarotPullPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, sun_sign, locale")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.first_name) redirect("/profile-setup");

  const card = drawDailyCardForUser(user.id, botanicaDayKey());

  const reading = await getOrGenerateDailyTarotReading({
    userId: user.id,
    card,
    firstName: profile.first_name,
    sunSign: profile.sun_sign,
    locale: profile.locale,
  }).catch(() => null);

  const interpretation = reading?.interpretation || card.reading;
  const question = reading?.question || card.question;

  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  });

  return (
    <main className="min-h-screen">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="nav-link text-[var(--accent)]">
            ← Dashboard
          </Link>
          <p className="sublabel text-xs">Daily tarot</p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 pt-16 text-center">
        <p className="eyebrow mb-3 text-[var(--foreground-muted)]">{dateLabel}</p>
        <h1 className="display text-3xl md:text-5xl leading-tight">
          Your card for today.
        </h1>
        <p className="invocation text-[var(--foreground-muted)] mt-5 max-w-xl mx-auto leading-relaxed">
          Take a breath. When you are ready, turn the card.
        </p>
      </div>

      {/* The interactive pull. Tap the card to reveal its meaning. */}
      <DailyTarotCard
        card={card}
        dateLabel={dateLabel}
        imageSrc={tarotImagePath(card)}
        reading={interpretation}
        question={question}
      />
    </main>
  );
}
