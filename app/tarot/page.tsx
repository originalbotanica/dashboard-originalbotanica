import { MemberNav } from "@/components/member-nav";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { TarotDrawSwitch } from "@/components/tarot-draw-switch";
import {
  drawDailyCardForUser,
  botanicaDayKey,
  tarotImagePath,
} from "@/lib/tarot/deck";
import { drawWheelForUser } from "@/lib/tarot/wheel-deck";
import { getOrGenerateDailyTarotReading } from "@/lib/daily-tarot/generate";

export const metadata = {
  title: "Your daily tarot",
  description:
    "Pull your card for today, your way — shuffle the deck or spin the wheel.",
};

/**
 * The dedicated daily tarot pull.
 *
 * TESTING PHASE: both draws are wired and selectable via TarotDrawSwitch so
 * the team can compare the shuffle deck (current live) and the spinning wheel
 * before launch. The card is drawn per member per day (deterministic) for
 * both. Once a winner is chosen, render the chosen draw directly and remove
 * the switch (see step 4 of the rollout).
 */
export default async function TarotPullPage({
  searchParams,
}: {
  searchParams: Promise<{ draw?: string }>;
}) {
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

  const dayKey = botanicaDayKey();

  // Shuffle deck (current live): 78-card deck, personalized reading, RWS art.
  const card = drawDailyCardForUser(user.id, dayKey);
  const reading = await getOrGenerateDailyTarotReading({
    userId: user.id,
    card,
    firstName: profile.first_name,
    sunSign: profile.sun_sign,
    locale: profile.locale,
  }).catch(() => null);
  const interpretation = reading?.interpretation || card.reading;
  const question = reading?.question || card.question;

  // Spinning wheel: Chris's 21-card deck with upright/reversed readings.
  const wheel = drawWheelForUser(user.id, dayKey);

  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  });

  const draw = (await searchParams)?.draw;
  const fromQuery = draw === "wheel" || draw === "shuffle";
  const initialMode: "shuffle" | "wheel" = draw === "wheel" ? "wheel" : "shuffle";

  return (
    <main className="min-h-screen">
      <MemberNav />

      <div className="max-w-5xl mx-auto px-6 pt-16 text-center">
        <p className="eyebrow mb-3 text-[var(--foreground-muted)]">{dateLabel}</p>
        <h1 className="display text-3xl md:text-5xl leading-tight">
          Your card for today.
        </h1>
        <p className="invocation text-[var(--foreground-muted)] mt-5 max-w-xl mx-auto leading-relaxed">
          Take a breath. When you are ready, draw your card.
        </p>
      </div>

      <TarotDrawSwitch
        initialMode={initialMode}
        fromQuery={fromQuery}
        shuffle={{
          card,
          dateLabel,
          imageSrc: tarotImagePath(card),
          reading: interpretation,
          question,
        }}
        wheel={{
          index: wheel.index,
          reversed: wheel.reversed,
          reading: wheel.reading,
          dayKey,
          dateLabel,
        }}
      />
    </main>
  );
}
