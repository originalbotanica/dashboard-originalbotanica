import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionStatus } from "@/lib/subscription";
import { DESIRES, COLORS, DURATIONS } from "@/lib/altar/altar";
import { lightCandleAction } from "../actions";

export const metadata = { title: "Light a candle" };

export default async function LightCandlePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
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

  const sub = await getSubscriptionStatus(user.id);
  if (!sub.isActive) redirect("/tools/virtual-altar");

  return (
    <main className="min-h-screen">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/altar/virtual" className="nav-link text-[var(--accent)]">
            ← Altar
          </Link>
          <p className="sublabel text-xs">Light a candle</p>
        </div>
      </header>

      <section className="max-w-2xl mx-auto px-6 pt-14 pb-24">
        <p className="eyebrow mb-3 text-[var(--foreground-muted)]">The virtual altar</p>
        <h1 className="display text-3xl md:text-4xl leading-tight mb-3">
          Light a candle.
        </h1>
        <p className="text-[var(--foreground-muted)] leading-relaxed mb-10">
          Set your intention, write your petition, and let the flame carry it.
          The candle burns here on the altar for the days you choose.
        </p>

        {error ? <p className="form-error mb-8">{error}</p> : null}

        <form action={lightCandleAction} className="space-y-10">
          {/* Intention */}
          <fieldset>
            <legend className="form-label mb-3">Choose your intention</legend>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {DESIRES.map((d, i) => (
                <label key={d.slug} className="altar-choice">
                  <input
                    type="radio"
                    name="candle_type"
                    value={d.slug}
                    defaultChecked={i === 0}
                    required
                  />
                  <span>{d.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Color */}
          <fieldset>
            <legend className="form-label mb-3">Candle color</legend>
            <div className="flex flex-wrap gap-3">
              {COLORS.map((c, i) => (
                <label key={c.slug} className="altar-swatch" title={c.label}>
                  <input
                    type="radio"
                    name="candle_color"
                    value={c.slug}
                    defaultChecked={i === 0}
                  />
                  <span
                    className="altar-swatch-dot"
                    style={{ background: c.hex }}
                  />
                  <span className="altar-swatch-label">{c.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Dedication */}
          <div>
            <label htmlFor="intention" className="form-label">
              Dedication
            </label>
            <input
              id="intention"
              name="intention"
              type="text"
              required
              maxLength={200}
              placeholder="For my mother's healing"
              className="form-input"
            />
            <p className="text-xs text-[var(--foreground-subtle)] mt-2">
              Shown beneath your candle. Keep it short.
            </p>
          </div>

          {/* Petition */}
          <div>
            <label htmlFor="petition" className="form-label">
              Your petition <span className="normal-case text-[var(--foreground-subtle)]">(optional)</span>
            </label>
            <textarea
              id="petition"
              name="petition"
              rows={5}
              maxLength={2000}
              placeholder="Speak your prayer here. What are you asking for, and for whom."
              className="form-input"
            />
          </div>

          {/* Duration */}
          <fieldset>
            <legend className="form-label mb-3">How long it burns</legend>
            <div className="flex flex-wrap gap-3">
              {DURATIONS.map((d, i) => (
                <label key={d.days} className="altar-choice altar-choice-sm">
                  <input
                    type="radio"
                    name="days"
                    value={d.days}
                    defaultChecked={i === 0}
                  />
                  <span>{d.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Public toggle */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="is_public"
              defaultChecked
              className="mt-1"
            />
            <span className="text-[var(--foreground-muted)] leading-relaxed text-sm">
              Add my candle to the community altar, so others can see its flame
              and hold the intention with me. Uncheck to keep it private to your
              own altar.
            </span>
          </label>

          <button type="submit" className="btn-primary inline-flex">
            Light the candle
          </button>
        </form>
      </section>
    </main>
  );
}
