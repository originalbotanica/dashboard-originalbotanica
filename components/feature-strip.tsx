import Link from "next/link";

/**
 * Above-the-fold feature strip for the landing hero: the six tools shown as
 * jewel-toned line icons in glowing medallions, so the offer reads at a
 * glance and catches the eye. Each tool has its own color (gradient-filled
 * glyph + matching medallion glow) and links to its detail page.
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

// Per-tool jewel tones. main = stroke/border, light = gradient top,
// glow = "r,g,b" for the medallion's rgba() halo.
const COLORS: Record<ToolKey, { main: string; light: string; glow: string }> = {
  tarot: { main: "#e8ac7c", light: "#f9dcb6", glow: "232,172,124" },
  astrology: { main: "#7bb6f2", light: "#c6e2ff", glow: "123,182,242" },
  dreams: { main: "#b98cf0", light: "#ddc6ff", glow: "185,140,240" },
  altar: { main: "#f0855a", light: "#ffc1a1", glow: "240,133,90" },
  ancestors: { main: "#ec9aa6", light: "#ffccd3", glow: "236,154,166" },
  rituals: { main: "#86cf9a", light: "#c6f0cf", glow: "134,207,154" },
};

function shapes(k: ToolKey, gid: string, light: string) {
  const grad = `url(#${gid})`;
  switch (k) {
    case "tarot":
      return (
        <>
          <rect x="5.5" y="3" width="13" height="18" rx="2.5" fill={grad} fillOpacity="0.25" />
          <rect x="5.5" y="3" width="13" height="18" rx="2.5" />
          <path
            d="M12 7l1.25 2.85 3.05.3-2.3 2.05.68 3L12 15.7l-2.66 1.5.68-3-2.3-2.05 3.05-.3z"
            fill={grad}
            stroke="none"
          />
        </>
      );
    case "astrology":
      return (
        <>
          <circle cx="12" cy="12" r="3.7" fill={grad} stroke="none" />
          <circle cx="12" cy="12" r="3.7" />
          <path d="M12 2.4v2.6M12 19v2.6M21.6 12H19M5 12H2.4M18.9 5.1l-1.8 1.8M6.9 17.1l-1.8 1.8M18.9 18.9 17.1 17.1M6.9 6.9 5.1 5.1" />
        </>
      );
    case "dreams":
      return (
        <>
          <path
            d="M20.5 14A8.5 8.5 0 1 1 10.3 3.8 6.7 6.7 0 0 0 20.5 14z"
            fill={grad}
            fillOpacity="0.9"
          />
          <path d="M20.5 14A8.5 8.5 0 1 1 10.3 3.8 6.7 6.7 0 0 0 20.5 14z" />
          <path
            d="M17.5 4l.7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7z"
            fill={light}
            stroke="none"
          />
        </>
      );
    case "altar":
      return (
        <>
          <path
            d="M12 2.6c2.9 3.7 4.7 5.7 4.7 8.8A4.7 4.7 0 0 1 12 16.1a4.7 4.7 0 0 1-4.7-4.7c0-1.6.8-3 1.9-4.1.2 1.1.9 1.9 1.8 2.2.4-2.4-.5-4.4 1-6.9z"
            fill={grad}
            fillOpacity="0.9"
          />
          <path d="M12 2.6c2.9 3.7 4.7 5.7 4.7 8.8A4.7 4.7 0 0 1 12 16.1a4.7 4.7 0 0 1-4.7-4.7c0-1.6.8-3 1.9-4.1.2 1.1.9 1.9 1.8 2.2.4-2.4-.5-4.4 1-6.9z" />
        </>
      );
    case "ancestors":
      return (
        <>
          <rect x="8.3" y="10.5" width="7.4" height="10" rx="1.4" fill={grad} fillOpacity="0.22" />
          <rect x="8.3" y="10.5" width="7.4" height="10" rx="1.4" />
          <path
            d="M12 3.2c1.5 1.9 2.4 3 2.4 4.3A2.4 2.4 0 0 1 12 9.9a2.4 2.4 0 0 1-2.4-2.4c0-.9.4-1.7 1.1-2.3.1.6.5 1 .9 1.2.2-1.2 0-2.2.4-3.2z"
            fill={grad}
            stroke="none"
          />
          <path d="M12 9.9v.6" />
        </>
      );
    case "rituals":
      return (
        <>
          <path
            d="M12 6.4C10.2 5.2 7.6 4.8 5.3 4.8V18c2.3 0 4.9.4 6.7 1.6 1.8-1.2 4.4-1.6 6.7-1.6V4.8c-2.3 0-4.9.4-6.7 1.6z"
            fill={grad}
            fillOpacity="0.45"
          />
          <path d="M12 6.4C10.2 5.2 7.6 4.8 5.3 4.8V18c2.3 0 4.9.4 6.7 1.6 1.8-1.2 4.4-1.6 6.7-1.6V4.8c-2.3 0-4.9.4-6.7 1.6z" />
          <path d="M12 6.4v13.2" />
        </>
      );
  }
}

export function FeatureStrip({ items }: { items: Item[] }) {
  return (
    <ul className="flex flex-wrap justify-center gap-x-7 gap-y-7 max-w-md md:max-w-2xl mb-8">
      {items.map((it) => {
        const c = COLORS[it.key];
        const gid = `feat-grad-${it.key}`;
        return (
          <li key={it.key} className="w-[4.75rem]">
            <Link
              href={HREF[it.key]}
              className="group flex flex-col items-center gap-2.5 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
            >
              <span
                className="feat-badge"
                style={{ "--tc": c.main, "--tg": c.glow } as React.CSSProperties}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={c.main}
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-[30px] h-[30px]"
                  aria-hidden
                >
                  <defs>
                    <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={c.light} />
                      <stop offset="100%" stopColor={c.main} />
                    </linearGradient>
                  </defs>
                  {shapes(it.key, gid, c.light)}
                </svg>
              </span>
              <span className="text-xs leading-tight text-center">{it.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
