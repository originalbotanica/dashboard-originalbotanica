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

// Duotone glyphs: faint filled body for weight + a bold gold detail, so
// each icon reads as a small jewel rather than a thin outline.
const ICON: Record<ToolKey, React.ReactNode> = {
  tarot: (
    <>
      <rect
        x="5.5"
        y="3"
        width="13"
        height="18"
        rx="2.5"
        fill="currentColor"
        fillOpacity="0.16"
      />
      <rect x="5.5" y="3" width="13" height="18" rx="2.5" />
      <path
        d="M12 7l1.25 2.85 3.05.3-2.3 2.05.68 3L12 15.7l-2.66 1.5.68-3-2.3-2.05 3.05-.3z"
        fill="currentColor"
        stroke="none"
      />
    </>
  ),
  astrology: (
    <>
      <circle cx="12" cy="12" r="3.6" fill="currentColor" fillOpacity="0.22" />
      <circle cx="12" cy="12" r="3.6" />
      <path
        d="M12 2.6v2.4M12 19v2.4M21.4 12H19M5 12H2.6M18.7 5.3l-1.7 1.7M7 17l-1.7 1.7M18.7 18.7 17 17M7 7 5.3 5.3"
      />
    </>
  ),
  dreams: (
    <>
      <path
        d="M20.5 14A8.5 8.5 0 1 1 10.3 3.8 6.7 6.7 0 0 0 20.5 14z"
        fill="currentColor"
        fillOpacity="0.18"
      />
      <path d="M20.5 14A8.5 8.5 0 1 1 10.3 3.8 6.7 6.7 0 0 0 20.5 14z" />
      <path
        d="M17.5 4l.7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7z"
        fill="currentColor"
        stroke="none"
      />
    </>
  ),
  altar: (
    <path
      d="M12 2.6c2.9 3.7 4.7 5.7 4.7 8.8A4.7 4.7 0 0 1 12 16.1a4.7 4.7 0 0 1-4.7-4.7c0-1.6.8-3 1.9-4.1.2 1.1.9 1.9 1.8 2.2.4-2.4-.5-4.4 1-6.9z"
      fill="currentColor"
      fillOpacity="0.3"
    />
  ),
  ancestors: (
    <>
      <rect
        x="8.3"
        y="10.5"
        width="7.4"
        height="10"
        rx="1.4"
        fill="currentColor"
        fillOpacity="0.16"
      />
      <rect x="8.3" y="10.5" width="7.4" height="10" rx="1.4" />
      <path
        d="M12 3.2c1.5 1.9 2.4 3 2.4 4.3A2.4 2.4 0 0 1 12 9.9a2.4 2.4 0 0 1-2.4-2.4c0-.9.4-1.7 1.1-2.3.1.6.5 1 .9 1.2.2-1.2 0-2.2.4-3.2z"
        fill="currentColor"
        stroke="none"
      />
      <path d="M12 9.9v.6" />
    </>
  ),
  rituals: (
    <>
      <path
        d="M12 6.4C10.2 5.2 7.6 4.8 5.3 4.8V18c2.3 0 4.9.4 6.7 1.6 1.8-1.2 4.4-1.6 6.7-1.6V4.8c-2.3 0-4.9.4-6.7 1.6z"
        fill="currentColor"
        fillOpacity="0.16"
      />
      <path d="M12 6.4C10.2 5.2 7.6 4.8 5.3 4.8V18c2.3 0 4.9.4 6.7 1.6 1.8-1.2 4.4-1.6 6.7-1.6V4.8c-2.3 0-4.9.4-6.7 1.6z" />
      <path d="M12 6.4v13.2" />
    </>
  ),
};

export function FeatureStrip({ items }: { items: Item[] }) {
  return (
    <ul className="flex flex-wrap justify-center gap-x-7 gap-y-7 max-w-md md:max-w-2xl mb-8">
      {items.map((it) => (
        <li key={it.key} className="w-[4.75rem]">
          <Link
            href={HREF[it.key]}
            className="group flex flex-col items-center gap-2.5 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <span className="feat-badge">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-[30px] h-[30px] text-[var(--accent)]"
                aria-hidden
              >
                {ICON[it.key]}
              </svg>
            </span>
            <span className="text-xs leading-tight text-center">{it.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
