import Link from "next/link";
import { getPurpose } from "@/lib/rituals/purposes";

/**
 * A ritual card for purpose shelves and search results. Links to the ritual
 * detail page. Uses a plain img for the source image since blog og:images can
 * come from hosts not configured for next/image.
 */
export function RitualCard({
  ritual,
}: {
  ritual: {
    slug: string;
    title_en: string;
    summary: string | null;
    purpose: string | null;
    tradition: string | null;
    difficulty: string | null;
    image_url: string | null;
  };
}) {
  const purpose = ritual.purpose ? getPurpose(ritual.purpose) : undefined;
  const tradition = ritual.tradition ? prettyTradition(ritual.tradition) : null;

  return (
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
        {purpose ? <p className="eyebrow mb-2">{purpose.label}</p> : null}
        <h3 className="display text-lg leading-tight mb-2">{ritual.title_en}</h3>
        {ritual.summary ? (
          <p className="text-[var(--foreground-muted)] text-sm leading-relaxed line-clamp-3">
            {ritual.summary}
          </p>
        ) : null}
        <div className="mt-auto pt-4 flex items-center gap-3 text-[var(--foreground-subtle)]">
          {tradition ? <span className="eyebrow">{tradition}</span> : null}
          {ritual.difficulty ? (
            <span className="eyebrow">{ritual.difficulty}</span>
          ) : null}
        </div>
      </div>
    </Link>
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
