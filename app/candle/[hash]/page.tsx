import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/admin";
import { Candle } from "@/components/candle";
import { addLightAction } from "../../ancestors/actions";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/dictionary";

const OB_CDN = "https://dlkhclkmyx18n.cloudfront.net";

/**
 * Public memorial page — accessible to anyone with the URL, no auth needed.
 *
 * Used by members to share a loved one's candle with family who aren't
 * members. Visitors see the candle + name + dedication, and can "add
 * their light" (an anonymous +1 to the memorial's light_count).
 *
 * Memorials with is_public = false 404 here (the RLS policy
 * "ancestors_select_public" also enforces this at the DB level).
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ hash: string }>;
}) {
  const { hash } = await params;
  const admin = createAdminClient();
  const { data } = await admin
    .from("ancestors")
    .select("name, is_public")
    .eq("hash", hash)
    .maybeSingle();
  if (!data?.is_public) {
    return { title: "Memorial" };
  }
  return {
    title: `In memory of ${data.name} | Original Botanica`,
    description: `A flame lit in memory of ${data.name}. Add your light.`,
  };
}

export default async function PublicMemorialPage({
  params,
}: {
  params: Promise<{ hash: string }>;
}) {
  const { hash } = await params;

  // Use admin client to bypass RLS for the read; we still enforce
  // is_public below before rendering or 404'ing.
  const admin = createAdminClient();
  const { data: memorial } = await admin
    .from("ancestors")
    .select(
      "id, name, relation, birth_date, death_date, dedication, photo_url, hash, is_public, flame_lit, light_count, added_at",
    )
    .eq("hash", hash)
    .maybeSingle();

  if (!memorial || !memorial.is_public) notFound();

  const locale = await getLocale();
  const dates = formatDates(memorial.birth_date, memorial.death_date, locale);

  async function light() {
    "use server";
    await addLightAction(hash);
  }

  return (
    <main className="min-h-screen relative">
      {/* Atmospheric backdrop */}
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
              "radial-gradient(ellipse at center, rgba(20,16,11,0.75) 0%, rgba(20,16,11,0.96) 80%)",
          }}
        />
      </div>

      <header className="border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center leading-none">
            <Image
              src="/logo-ob-white-banner.png"
              alt="Original Botanica"
              width={70}
              height={50}
              className="h-auto w-[60px] md:w-[70px]"
            />
          </Link>
          <p className="sublabel text-xs">{t(locale, "cand.inMemory")}</p>
        </div>
      </header>

      <section className="max-w-2xl mx-auto px-6 pt-16 pb-16 text-center">
        <Candle
          size="large"
          lit={!!memorial.flame_lit}
          photoUrl={memorial.photo_url}
          alt={`Candle for ${memorial.name}`}
        />

        <p className="eyebrow mt-10 mb-3">{t(locale, "cand.inMemoryOf")}</p>
        <h1 className="display text-3xl md:text-5xl mb-3 leading-tight">
          {memorial.name}
        </h1>
        {memorial.relation && (
          <p className="invocation text-base text-[var(--foreground-muted)] mb-2">
            {memorial.relation}
          </p>
        )}
        {dates && (
          <p className="text-sm text-[var(--foreground-subtle)] mb-10">
            {dates}
          </p>
        )}
        {memorial.dedication && (
          <p className="text-[var(--foreground-muted)] leading-relaxed max-w-xl mx-auto whitespace-pre-wrap mb-10">
            {memorial.dedication}
          </p>
        )}

        <form action={light} className="mt-8">
          <button type="submit" className="btn-primary inline-flex">
            {t(locale, "cand.addLight")}
          </button>
        </form>
        {memorial.light_count > 0 && (
          <p className="text-xs text-[var(--foreground-subtle)] mt-4">
            {t(locale, memorial.light_count === 1 ? "cand.lightsOne" : "cand.lightsMany", { n: memorial.light_count })}
          </p>
        )}
      </section>

      <section className="border-t border-[var(--border)] mt-12">
        <div className="max-w-xl mx-auto px-6 py-16 text-center">
          <p className="invocation text-[var(--foreground-muted)] mb-6 leading-relaxed">
            {t(locale, "cand.houseLine")}
          </p>
          <Link href="/" className="btn-ghost inline-flex">
            {t(locale, "cand.about")}
          </Link>
        </div>
      </section>
    </main>
  );
}

function formatDates(birth: string | null | undefined, death: string | null | undefined, locale: Locale): string {
  const fmt = (s?: string | null) =>
    s
      ? new Date(s + "T00:00:00Z").toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
          timeZone: "UTC",
        })
      : null;
  const b = fmt(birth);
  const d = fmt(death);
  if (b && d) return `${b} - ${d}`;
  if (d) return t(locale, "anc.passed", { y: d });
  if (b) return t(locale, "anc.born", { y: b });
  return "";
}
