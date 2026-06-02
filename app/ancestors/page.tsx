import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Candle } from "@/components/candle";

export const metadata = {
  title: "Ancestors altar | Original Botanica",
};

const OB_CDN = "https://dlkhclkmyx18n.cloudfront.net";

/**
 * The Ancestors altar — list of all the member's memorials.
 *
 * Each memorial is rendered as a small candle card with the loved one's
 * photo overlaid on the candle and their name beneath. Clicking a card
 * opens the memorial detail page.
 */
export default async function AncestorsHubPage() {
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

  const { data: memorials } = await supabase
    .from("ancestors")
    .select(
      "id, name, relation, photo_url, birth_date, death_date, flame_lit, added_at",
    )
    .eq("user_id", user.id)
    .order("added_at", { ascending: false });

  const list = memorials || [];

  return (
    <main className="min-h-screen relative">
      <div className="absolute inset-0 -z-10">
        <Image
          src={`${OB_CDN}/spiritual-candles.png`}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-20"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(20,16,11,0.92) 0%, rgba(20,16,11,0.97) 100%)",
          }}
        />
      </div>

      <header className="border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="nav-link text-[var(--accent)]">
            ← Dashboard
          </Link>
          <p className="sublabel text-xs">Ancestors altar</p>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 pt-20 pb-24">
        <p className="eyebrow mb-4 text-center">Ancestors altar</p>
        <h1 className="display text-4xl md:text-5xl mb-4 text-center max-w-2xl mx-auto leading-tight">
          A flame for those who came before.
        </h1>
        <p className="text-[var(--foreground-muted)] text-lg leading-relaxed text-center max-w-xl mx-auto mb-12">
          Add the people you carry. Their flame lit. Their stories with you.
        </p>

        <div className="flex justify-center mb-16">
          <Link href="/ancestors/new" className="btn-primary inline-flex">
            Add an ancestor
          </Link>
        </div>

        {list.length === 0 ? (
          <div className="invocation text-[var(--foreground-muted)] text-center max-w-md mx-auto pt-12 leading-relaxed">
            Your altar is bare. The first flame is the hardest to light.
            When you are ready, add a name.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12 pt-8">
            {list.map((m) => (
              <Link
                key={m.id}
                href={`/ancestors/${m.id}`}
                className="group flex flex-col items-center text-center"
              >
                <Candle
                  lit={!!m.flame_lit}
                  photoUrl={m.photo_url}
                  alt={`Candle for ${m.name}`}
                />
                <p className="display text-base mt-6 group-hover:text-[var(--accent)] transition-colors">
                  {m.name}
                </p>
                {m.relation && (
                  <p className="text-xs text-[var(--foreground-subtle)] mt-1">
                    {m.relation}
                  </p>
                )}
                <p className="text-xs text-[var(--foreground-subtle)] mt-1">
                  {formatYears(m.birth_date, m.death_date)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function formatYears(birth?: string | null, death?: string | null): string {
  const b = birth ? new Date(birth).getUTCFullYear() : null;
  const d = death ? new Date(death).getUTCFullYear() : null;
  if (b && d) return `${b} — ${d}`;
  if (d) return `Passed ${d}`;
  if (b) return `Born ${b}`;
  return "";
}
