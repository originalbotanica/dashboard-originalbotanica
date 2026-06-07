import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionStatus } from "@/lib/subscription";
import { createCompatibilityAction } from "./actions";

export const metadata = {
  title: "Compatibility",
};

const OB_CDN = "https://dlkhclkmyx18n.cloudfront.net";

/**
 * Compatibility hub — past readings + form to create a new one.
 *
 * Submitting the form takes ~10-15 seconds (AstrologyAPI chart compute
 * + Claude generation). The browser sees a normal POST + redirect; for
 * a future polish pass we could add an "Reading the charts…" interim
 * state, but for now we let the server action be synchronous.
 */
export default async function CompatibilityHubPage({
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, birth_date, birth_place")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.first_name) redirect("/profile-setup");
  if (!profile.birth_date || !profile.birth_place) redirect("/astrology");

  const sub = await getSubscriptionStatus(user.id);
  if (!sub.isActive) redirect("/astrology");

  const { data: readings } = await supabase
    .from("compatibility_readings")
    .select(
      "id, other_name, other_birth_date, other_birth_city, created_at",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen relative">
      <div className="absolute inset-0 -z-10">
        <Image
          src={`${OB_CDN}/cta-spiritual-services.jpg`}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-15"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(20,16,11,0.94) 0%, rgba(20,16,11,0.97) 100%)",
          }}
        />
      </div>

      <header className="border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/astrology" className="nav-link text-[var(--accent)]">
            ← Astrology
          </Link>
          <p className="sublabel text-xs">Compatibility</p>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 pt-20 pb-20">
        <p className="eyebrow mb-4">Compatibility</p>
        <h1 className="display text-4xl md:text-5xl mb-4 leading-tight">
          Two charts, read together.
        </h1>
        <p className="text-[var(--foreground-muted)] text-lg leading-relaxed max-w-2xl mb-10">
          A synastry reading. Where the energies harmonize, where they grind,
          what the work between you asks. The chart describes the terrain,
          not the outcome.
        </p>

        {params.error && (
          <p className="form-error mb-6">{params.error}</p>
        )}

        {/* New reading form */}
        <form
          action={createCompatibilityAction}
          className="flex flex-col gap-5 border border-[var(--border)] rounded-xl p-6 bg-[var(--surface)] mb-16"
        >
          <p className="eyebrow">New reading</p>
          <div>
            <label htmlFor="other_name" className="form-label">
              Their name
            </label>
            <input
              id="other_name"
              name="other_name"
              type="text"
              required
              className="form-input"
              placeholder="e.g. Maria"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="other_birth_date" className="form-label">
                Their birth date
              </label>
              <input
                id="other_birth_date"
                name="other_birth_date"
                type="date"
                required
                className="form-input"
              />
            </div>
            <div>
              <label htmlFor="other_birth_time" className="form-label">
                Their birth time{" "}
                <span className="text-[var(--foreground-subtle)] normal-case tracking-normal">
                  (if known)
                </span>
              </label>
              <input
                id="other_birth_time"
                name="other_birth_time"
                type="time"
                className="form-input"
              />
            </div>
          </div>
          <div>
            <label htmlFor="other_birth_city" className="form-label">
              Their birth city
            </label>
            <input
              id="other_birth_city"
              name="other_birth_city"
              type="text"
              required
              className="form-input"
              placeholder="e.g. Havana, Cuba"
            />
          </div>
          <div>
            <label htmlFor="relationship_note" className="form-label">
              What you want the reading to address{" "}
              <span className="text-[var(--foreground-subtle)] normal-case tracking-normal">
                (optional)
              </span>
            </label>
            <textarea
              id="relationship_note"
              name="relationship_note"
              rows={3}
              className="form-input"
              placeholder="e.g. We've been dating six months. The chemistry is real but we communicate badly."
            />
          </div>
          <button type="submit" className="btn-primary mt-2">
            Read the dynamic
          </button>
          <p className="text-xs text-[var(--foreground-subtle)]">
            Takes about 15 seconds while the charts are read.
          </p>
        </form>

        {/* Past readings */}
        {readings && readings.length > 0 && (
          <section>
            <p className="eyebrow mb-6">Past readings</p>
            <ul className="space-y-3">
              {readings.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/astrology/compatibility/${r.id}`}
                    className="block border border-[var(--border)] rounded-lg px-5 py-4 hover:border-[var(--accent)] hover:bg-[var(--surface)] transition-colors"
                  >
                    <p className="display text-lg mb-1">
                      You and {r.other_name}
                    </p>
                    <p className="text-xs text-[var(--foreground-subtle)]">
                      {formatRelative(r.created_at)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </section>
    </main>
  );
}

function formatRelative(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  const diffD = Math.floor(diffH / 24);
  if (diffH < 1) return "Just now";
  if (diffH < 24) return `${diffH} ${diffH === 1 ? "hour" : "hours"} ago`;
  if (diffD < 7) return `${diffD} ${diffD === 1 ? "day" : "days"} ago`;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
