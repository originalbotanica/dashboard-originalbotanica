import Link from "next/link";
import { getPurpose, purposeLabel } from "@/lib/rituals/purposes";
import type { RitualCardData } from "@/lib/rituals/queries";
import { SaveRitualButton } from "@/components/save-ritual-button";
import { t, type Locale } from "@/lib/i18n/dictionary";

/**
 * A ritual card for purpose shelves and search results. Links to the ritual
 * detail page, with a bookmark toggle overlaid in the corner. The bookmark is
 * a sibling of the link (not nested inside it), so saving never navigates.
 * Uses a plain img for the source image since blog og:images can come from
 * hosts not configured for next/image.
 */
export function RitualCard({
  ritual,
  saved = false,
  locale = "en",
}: {
  ritual: RitualCardData;
  saved?: boolean;
  locale?: Locale;
}) {
  const purpose = ritual.purpose ? getPurpose(ritual.purpose) : undefined;
  const tradition = ritual.tradition ? prettyTradition(ritual.tradition) : null;

  return (
    <div className="relative h-full">
      <div className="absolute top-3 right-3 z-10">
        <SaveRitualButton ritualId={ritual.id} initialSaved={saved} variant="icon" />
      </div>
      <Link
        href={`/rituals/r/${ritual.slug}`}
        className="group flex flex-col rounded-xl overflow-hidden border border-[var(--border)] hover:border-[var(--accent)] transition-colors h-full"
      >
      {ritual.image_url ? (
        <div className="relative aspect-[16/9] overflow-hidden bg-[var(--surface)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ritual.image_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity"
          />
        </div>
      ) : null}
      <div className="p-5 flex flex-col flex-1">
        {purpose ? <p className="eyebrow mb-2">{purposeLabel(purpose, locale)}</p> : null}
        <h3 className="display text-lg leading-tight mb-2">{ritual.title_en}</h3>
        {ritual.summary ? (
          <p className="text-[var(--foreground-muted)] text-sm leading-relaxed line-clamp-3">
            {ritual.summary}
          </p>
        ) : null}
        <div className="mt-auto pt-4 flex items-center gap-3 text-[var(--foreground-subtle)]">
          {ritual.source_type === "youtube" ? (
            <span className="eyebrow text-[var(--accent)]">▶ {t(locale, "rit.video")}</span>
          ) : null}
          {tradition ? <span className="eyebrow">{tradition}</span> : null}
          {ritual.difficulty ? (
            <span className="eyebrow">{ritual.difficulty}</span>
          ) : null}
        </div>
      </div>
      </Link>
    </div>
  );
}

function prettyTradition(t: string): string {
  switch (t) {
    case "lucumi":
      return "Lucumí";
    case "espiritismo":
      return "Espiritismo";
    case "hoodoo":
      return "Hoodoo";
    case "folk_catholic":
      return "Folk Catholic";
    default:
      return "General";
  }
}
