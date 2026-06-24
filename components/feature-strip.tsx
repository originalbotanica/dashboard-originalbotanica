import Link from "next/link";

/**
 * Above-the-fold feature strip for the landing hero: the six tools shown
 * as small line icons with labels, so a visitor grasps the whole offer at
 * a glance instead of reading a sentence. Each links to its detail page.
 * Icons are inline SVG (stroke = accent), labels come from the dictionary.
 */

type Item = { key: ToolKey; label: string };
type ToolKey =
  | "tarot"
  | "astrology"
  | "dreams"
  | "altar"
  | "ancestors"
  | "rituals";

const HREF: Record<ToolKey, string> = {
  tarot: "/tools/tarot",
  astrology: "/tools/astrology",
  dreams: "/tools/dreams",
  altar: "/tools/virtual-altar",
  ancestors: "/tools/ancestors",
  rituals: "/tools/rituals",
};

const ICON: Record<ToolKey, React.ReactNode> = {
  tarot: (
    <>
      <rect x="6" y="3" width="12" height="18" rx="2" />
      <path d="M12 8.2l.8 2 2 .2-1.5 1.4.4 2-1.7-1-1.7 1 .4-2L9.2 10.4l2-.2z" />
    </>
  ),
  astrology: (
    <path d="M12 3.2l2.4 5 5.4.6-4 3.7 1.1 5.3L12 20.2 7.1 17.8l1.1-5.3-4-3.7 5.4-.6z" />
  ),
  dreams: (
    <>
      <path d="M20 14.2A8 8 0 1 1 10.6 4.2 6.3 6.3 0 0 0 20 14.2z" />
      <path d="M17 4.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4L15 6.5l1.4-.6z" />
    </>
  ),
  altar: (
    <path d="M12 3.5c2.6 3.4 4.3 5.2 4.3 8.1A4.3 4.3 0 0 1 12 16a4.3 4.3 0 0 1-4.3-4.4c0-1.5.7-2.7 1.7-3.8.2 1 .8 1.7 1.6 2 .3-2.1-.4-4 1-6.3z" />
  ),
  ancestors: (
    <>
      <path d="M12 3.6c1.3 1.7 2.1 2.7 2.1 3.9A2.1 2.1 0 0 1 12 9.6a2.1 2.1 0 0 1-2.1-2.1c0-.8.4-1.5 1-2 .1.5.4.9.8 1 .1-1 0-1.9.3-2.9z" />
      <rect x="8.5" y="11" width="7" height="9.5" rx="1.2" />
    </>
  ),
  rituals: (
    <>
      <path d="M12 6.5C10.3 5.4 7.8 5 5.5 5V18c2.3 0 4.8.4 6.5 1.5 1.7-1.1 4.2-1.5 6.5-1.5V5c-2.3 0-4.8.4-6.5 1.5z" />
      <path d="M12 6.5v13" />
    </>
  ),
};

export function FeatureStrip({ items }: { items: Item[] }) {
  return (
    <ul className="flex flex-wrap justify-center gap-x-6 gap-y-6 max-w-md md:max-w-2xl mb-8">
      {items.map((it) => (
        <li key={it.key} className="w-[4.5rem]">
          <Link
            href={HREF[it.key]}
            className="group flex flex-col items-center gap-2 text-[var(--foreground-muted)] hover:text-[var(--accent)] transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-7 h-7 text-[var(--accent)]"
              aria-hidden
            >
              {ICON[it.key]}
            </svg>
            <span className="text-xs leading-tight text-center">{it.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
