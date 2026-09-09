import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { saveProfileAction } from "./actions";

export const metadata = {
  title: "Tell us about you",
};

/**
 * Profile setup — runs after email confirmation, before first dashboard visit.
 *
 * We collect:
 *   - First name (required)
 *   - Date of birth, time of birth, place of birth (optional — only needed
 *     if they want to use the Astrology tool; the form makes that clear)
 *   - Preferred language (en | es)
 *
 * The auto-profile trigger we installed in Supabase already created a
 * profiles row on signup; this form just fills in the human-supplied
 * fields. So we check whether first_name has been set yet (not whether
 * the row exists) to decide if setup is already done.
 */
export default async function ProfileSetupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Two jobs, one page: first-time setup after signup, AND completing the
  // birth details later (the Astrology tool links here when they're missing).
  // Only bounce to the dashboard when there is nothing left to collect —
  // bouncing on first_name alone locked existing members out of ever adding
  // their birth data (the "it just brings me back to the dashboard" loop).
  const { data: existing } = await supabase
    .from("profiles")
    .select("first_name, birth_date, birth_place, locale")
    .eq("id", user.id)
    .maybeSingle();
  const completing = !!existing?.first_name;
  if (existing?.first_name && existing?.birth_date && existing?.birth_place) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="auth-card max-w-xl">
        <Link href="/" className="flex flex-col items-center mb-8 leading-none">
          <Image
            src="/logo-ob-white-banner.png"
            alt="Original Botanica"
            width={100}
            height={70}
            priority
            className="h-auto w-[100px]"
          />
        </Link>

        <h1 className="display text-2xl md:text-3xl mb-2 text-center">
          {completing ? "Your chart is waiting." : "Welcome to the practice."}
        </h1>
        <p className="text-foreground-muted text-center text-sm mb-8 max-w-md mx-auto">
          {completing
            ? "Your birth details are all the astrologer needs to draw your chart. Birth time is the only optional part."
            : "A few details so we can personalize your daily horoscope, your birth chart, and your readings. Birth time is the only optional part."}
        </p>

        <form action={saveProfileAction} className="flex flex-col gap-5">
          {completing && <input type="hidden" name="next" value="/astrology" />}
          <div>
            <label htmlFor="first_name" className="form-label">First name</label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              required
              defaultValue={existing?.first_name ?? ""}
              className="form-input"
              placeholder="What should we call you?"
            />
          </div>

          <div>
            <label htmlFor="locale" className="form-label">Preferred language</label>
            <select
              id="locale"
              name="locale"
              defaultValue={existing?.locale === "es" ? "es" : "en"}
              className="form-input"
            >
              <option value="en">English</option>
              <option value="es">Espa&ntilde;ol</option>
            </select>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col gap-5">
            <p className="form-label" style={{ marginBottom: 0 }}>Birth details</p>
            <div>
              <label htmlFor="birth_date" className="form-label">Date of birth</label>
              <input id="birth_date" name="birth_date" type="date" required className="form-input" />
            </div>
            <div>
              <label htmlFor="birth_place" className="form-label">City of birth</label>
              <input
                id="birth_place"
                name="birth_place"
                type="text"
                required
                className="form-input"
                placeholder="e.g. The Bronx, New York"
              />
            </div>
            <div>
              <label htmlFor="birth_time" className="form-label">
                Time of birth{" "}
                <span className="text-[var(--foreground-subtle)] normal-case tracking-normal">(if you know it)</span>
              </label>
              <input id="birth_time" name="birth_time" type="time" className="form-input" />
              <p className="text-xs text-[var(--foreground-subtle)] mt-2">
                Optional. Your rising sign and houses are more precise with it,
                but your reading works fine without it.
              </p>
            </div>
          </div>

          {params.error && <p className="form-error">{params.error}</p>}

          <button type="submit" className="btn-primary mt-3">
            {completing ? "Save and see your chart" : "Enter the dashboard"}
          </button>
        </form>
      </div>
    </main>
  );
}
