/**
 * Decorative zodiac wheel — a self-contained SVG used as the hero graphic
 * on the Astrology hub. No data, no API: it renders identically for every
 * member, so it never slows the page or depends on birth details.
 *
 * Brand-themed via CSS variables. The outer ring of glyphs turns slowly
 * (see .zodiac-spin in globals.css; honors prefers-reduced-motion).
 */

const GLYPHS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

const C = 200; // center
const TWO_PI = Math.PI * 2;

function onCircle(r: number, i: number, n: number, offset = -Math.PI / 2) {
  const a = (i / n) * TWO_PI + offset;
  return { x: C + r * Math.cos(a), y: C + r * Math.sin(a) };
}

export function ZodiacWheel({ className = "" }: { className?: string }) {
  const glyphR = 168;
  const spokeInner = 132;
  const spokeOuter = 186;

  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      role="img"
      aria-label="A zodiac wheel of the twelve signs"
    >
      <defs>
        <radialGradient id="zw-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.20" />
          <stop offset="55%" stopColor="var(--accent)" stopOpacity="0.05" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Soft halo */}
      <circle cx={C} cy={C} r={196} fill="url(#zw-glow)" />

      {/* Static structural rings */}
      <circle
        cx={C}
        cy={C}
        r={188}
        fill="none"
        stroke="var(--accent)"
        strokeOpacity="0.55"
        strokeWidth="1.25"
      />
      <circle
        cx={C}
        cy={C}
        r={150}
        fill="none"
        stroke="var(--border)"
        strokeWidth="1"
      />
      <circle
        cx={C}
        cy={C}
        r={120}
        fill="none"
        stroke="var(--border)"
        strokeWidth="1"
      />

      {/* Slowly rotating layer: spokes + glyphs + a dotted ring */}
      <g className="zodiac-spin" style={{ transformOrigin: "200px 200px" }}>
        <circle
          cx={C}
          cy={C}
          r={170}
          fill="none"
          stroke="var(--accent)"
          strokeOpacity="0.30"
          strokeWidth="1"
          strokeDasharray="1.5 7"
        />
        {GLYPHS.map((_, i) => {
          const a = onCircle(spokeInner, i, 12);
          const b = onCircle(spokeOuter, i, 12);
          return (
            <line
              key={`spoke-${i}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="var(--border)"
              strokeWidth="1"
            />
          );
        })}
        {GLYPHS.map((g, i) => {
          // Offset by half a segment so glyphs sit between the spokes.
          const p = onCircle(glyphR, i + 0.5, 12);
          return (
            <text
              key={`glyph-${i}`}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="19"
              fill="var(--accent)"
              fillOpacity="0.92"
            >
              {g}
            </text>
          );
        })}
      </g>

      {/* Center star */}
      <circle
        cx={C}
        cy={C}
        r={120}
        fill="var(--background)"
        fillOpacity="0.35"
      />
      <text
        x={C}
        y={C + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="46"
        fill="var(--accent)"
      >
        ✦
      </text>

      {/* A few scattered stars */}
      {[
        [62, 78],
        [330, 110],
        [96, 320],
        [318, 300],
        [200, 36],
      ].map(([x, y], i) => (
        <circle
          key={`star-${i}`}
          cx={x}
          cy={y}
          r={i % 2 ? 1.4 : 2}
          fill="var(--foreground)"
          fillOpacity="0.5"
        />
      ))}
    </svg>
  );
}
