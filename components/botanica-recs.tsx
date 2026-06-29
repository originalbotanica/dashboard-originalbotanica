import { getProductCards } from "@/lib/rag/retrieve";
import {
  getLibraryRitualsBySlugs,
  getSavedRitualIds,
} from "@/lib/rituals/queries";
import { RitualCard } from "@/components/ritual-card";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionary";

/**
 * "From the botanica" — inline ritual and product recommendations under a
 * reading.
 *
 * Every generated reading (forecast, compatibility, horoscope) already
 * retrieves the blog rituals and products that ground it. This component
 * surfaces them: rituals as library cards (the same slugs now live in the
 * curated /rituals library, so they link in-app), and products as cards
 * linking to the shop. Renders nothing when there is nothing to recommend.
 */
export async function BotanicaRecs({
  userId,
  productSlugs = [],
  sourceSlugs = [],
  headingKey = "recs.fromBotanica",
}: {
  userId?: string;
  productSlugs?: string[];
  sourceSlugs?: string[];
  /** Dictionary key for the section heading. */
  headingKey?: string;
}) {
  const [rituals, products, savedIds, locale] = await Promise.all([
    getLibraryRitualsBySlugs(sourceSlugs),
    getProductCards(productSlugs.slice(0, 4)),
    userId ? getSavedRitualIds(userId) : Promise.resolve(new Set<string>()),
    getLocale(),
  ]);

  if (rituals.length === 0 && products.length === 0) return null;

  return (
    <section className="mt-16 border-t border-[var(--border)] pt-10">
      <p className="eyebrow mb-2">{t(locale, headingKey)}</p>
      <p className="text-[var(--foreground-muted)] leading-relaxed mb-8 max-w-2xl">
        {t(locale, "recs.body")}
      </p>

      {rituals.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-6 mb-10">
          {rituals.slice(0, 2).map((r) => (
            <RitualCard key={r.slug} ritual={r} saved={savedIds.has(r.id)} locale={locale} />
          ))}
        </div>
      ) : null}

      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {products.map((p) => (
            <a
              key={p.slug}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-xl overflow-hidden border border-[var(--border)] hover:border-[var(--accent)] transition-colors"
            >
              <div className="relative aspect-square bg-[var(--surface)]">
                {p.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.image_url}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  />
                ) : null}
              </div>
              <div className="p-3">
                <p className="text-sm leading-snug text-[var(--foreground)]">
                  {p.name}
                </p>
                <p className="eyebrow text-[var(--accent)] mt-2">{t(locale, "recs.shop")}</p>
              </div>
            </a>
          ))}
        </div>
      ) : null}
    </section>
  );
}
