import { MemberNav } from "@/components/member-nav";
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
    "Pull your card for today. Shuffle the deck, turn the card, and read it in the voice of the house.",
};

/**
 * The dedicated daily tarot pull.
 *
 * Reached from the dashboard teaser. This is where the ritual happens: the
 * member shuffles the deck, the card waits face down, they turn it, and
 * behind it is the real Rider-Waite image with a reading written for them
 * today.
 *
 * The card is drawn per member per day (deterministic) and the personalized
 * reading is generated and cached here on first view of the day. The shuffle
 * is the ritual flourish before the reveal; the card it lands on is already
 * decided, so a shuffle never changes today's pull.
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
      <MemberNav />

      <div className="max-w-5xl mx-auto px-6 pt-16 text-center">
        <p className="eyebrow mb-3 text-[var(--foreground-muted)]">{dateLabel}</p>
        <h1 className="display text-3xl md:text-5xl leading-tight">
          Your card for today.
        </h1>
        <p className="invocation text-[var(--foreground-muted)] mt-5 max-w-xl mx-auto leading-relaxed">
          Take a breath. When you are ready, shuffle the deck.
        </p>
      </div>

      {/* The interactive pull: shuffle the deck, then turn the card. */}
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
