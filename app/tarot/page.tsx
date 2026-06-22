import { MemberNav } from "@/components/member-nav";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { TarotWheel } from "@/components/tarot-wheel";
import { drawWheelForUser, botanicaDayKey } from "@/lib/tarot/wheel-deck";

export const metadata = {
  title: "Your daily tarot",
  description:
    "Spin the wheel for your card today. One card a day, drawn for you, with its reading upright or upside down.",
};

/**
 * The dedicated daily tarot pull — Chris's spinning wheel.
 *
 * The card and its orientation are drawn per member per day (deterministic,
 * seeded by user id + date), so the wheel always lands on today's card and it
 * holds steady from morning to night. One pull a day.
 */
export default async function TarotPullPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.first_name) redirect("/profile-setup");

  const dayKey = botanicaDayKey();
  const draw = drawWheelForUser(user.id, dayKey);

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
        <h1 className="display text-3xl md:text-5xl leading-tight tracking-wide">
          TAROT TODAY
        </h1>
        <p className="invocation text-[var(--foreground-muted)] mt-5 max-w-xl mx-auto leading-relaxed">
          Take a deep cleansing breath &amp; spin the Tarot Fortune Wheel.
        </p>
      </div>

      <TarotWheel
        index={draw.index}
        reversed={draw.reversed}
        reading={draw.reading}
        dayKey={dayKey}
        dateLabel={dateLabel}
      />
    </main>
  );
}
