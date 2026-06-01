import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { loadAstrologerContext } from "@/lib/astrologer/context";

export const metadata = {
  title: "Your Natal Chart | Original Botanica",
};

/**
 * Natal chart display.
 *
 * Calling loadAstrologerContext both fetches the cached chart and
 * computes it on the fly the first time. If credentials are missing,
 * the astrology-api lib falls back to mocked data so the page still
 * renders something instead of erroring.
 */
export default async function ChartPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, birth_date, birth_place")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.first_name) redirect("/profile-setup");
  if (!profile.birth_date || !profile.birth_place) {
    redirect("/astrology");
  }

  const context = await loadAstrologerContext(user.id);
  if (!context) redirect("/astrology");

  const { chart, birthDate, birthCity, birthTime, isUnderEighteen } = context;

  // Group placements into Big Three vs the rest
  const bigThreeNames = new Set(["Sun", "Moon", "Ascendant"]);
  const otherPlacements = chart.placements.filter(
    (p) => !bigThreeNames.has(p.name) && !/^asc$/i.test(p.name),
  );

  return (
    <main className="min-h-screen">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/astrology" className="nav-link text-[var(--accent)]">
            ← Astrology
          </Link>
          <p className="sublabel text-xs">Your chart</p>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 pt-16 pb-24">
        <p className="eyebrow mb-4">Your natal chart</p>
        <h1 className="display text-4xl md:text-5xl mb-3">
          {profile.first_name}
        </h1>
        <p className="text-[var(--foreground-muted)] mb-10">
          Born {formatDate(birthDate)}
          {birthTime ? ` at ${birthTime}` : ""} in {birthCity}.
          {!birthTime && (
            <span className="block text-sm mt-1 text-[var(--foreground-subtle)]">
              Birth time unknown. Sun and Moon are accurate. Rising and houses
              are not available without it.
            </span>
          )}
          {chart.isMocked && (
            <span className="block text-sm mt-2 text-[var(--ember)]">
              Astrology API not configured. Showing example data.
            </span>
          )}
        </p>

        {isUnderEighteen && (
          <div className="form-error mb-10">
            We do not provide chart readings for anyone under 18. If this birth
            date is incorrect, please update it in your profile.
          </div>
        )}

        {chart.chartImageUrl && (
          <div className="rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--surface)] p-4 mb-12 flex justify-center">
            <Image
              src={chart.chartImageUrl}
              alt="Your natal chart wheel"
              width={520}
              height={520}
              unoptimized
              className="max-w-full h-auto"
            />
          </div>
        )}

        <section className="mb-12">
          <p className="eyebrow mb-3">Big three</p>
          <ul className="space-y-3">
            <li className="flex justify-between border-b border-[var(--border)] pb-3">
              <span className="text-[var(--foreground-muted)]">Sun</span>
              <span className="display text-xl">{chart.sunSign}</span>
            </li>
            <li className="flex justify-between border-b border-[var(--border)] pb-3">
              <span className="text-[var(--foreground-muted)]">Moon</span>
              <span className="display text-xl">{chart.moonSign}</span>
            </li>
            <li className="flex justify-between border-b border-[var(--border)] pb-3">
              <span className="text-[var(--foreground-muted)]">Rising</span>
              <span className="display text-xl">
                {chart.risingSign ?? "—"}
              </span>
            </li>
          </ul>
        </section>

        {otherPlacements.length > 0 && (
          <section className="mb-12">
            <p className="eyebrow mb-3">Other placements</p>
            <ul className="space-y-2 text-[var(--foreground-muted)]">
              {otherPlacements.map((p) => (
                <li key={p.name} className="flex justify-between text-sm">
                  <span>{p.name}</span>
                  <span>
                    {p.sign}
                    {p.house != null ? ` · ${ordinal(p.house)} house` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-12 flex gap-4 flex-wrap">
          <Link
            href="/astrology/astrologer"
            className="btn-primary inline-flex"
          >
            Talk to Your Astrologer
          </Link>
          <Link href="/astrology" className="btn-ghost inline-flex">
            Back to Astrology
          </Link>
        </div>
      </section>
    </main>
  );
}

function formatDate(yyyyMmDd: string): string {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
