/**
 * Ornate zodiac wheel — the hero graphic on the Astrology hub.
 *
 * Self-contained SVG (no data, no API), so it renders identically and
 * instantly for every member. The twelve astrological symbols ride a
 * segmented, depth-shaded band in glowing gold medallions; a radiant core
 * pulses at the center and a ring of stars turns slowly around the rim.
 * Brand-themed via CSS variables; all motion honors prefers-reduced-motion.
 */

const GLYPHS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

const C = 200;

/** Point on a circle. deg measured from the top (12 o'clock), clockwise. */
function pol(r: number, deg: number) {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x: C + r * Math.cos(a), y: C + r * Math.sin(a) };
}

/** Annular sector path (a ring "wedge") from d0→d1 between radii ri and ro. */
function wedge(ri: number, ro: number, d0: number, d1: number) {
  const o0 = pol(ro, d0);
  const o1 = pol(ro, d1);
  const i1 = pol(ri, d1);
  const i0 = pol(ri, d0);
  return [
    `M ${o0.x} ${o0.y}`,
    `A ${ro} ${ro} 0 0 1 ${o1.x} ${o1.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${ri} ${ri} 0 0 0 ${i0.x} ${i0.y}`,
    "Z",
  ].join(" ");
}

export function ZodiacWheel({ className = "" }: { className?: string }) {
  const bandInner = 118;
  const bandOuter = 172;
  const medallionR = 145;
  const rays = Array.from({ length: 12 });
  const rimStars = Array.from({ length: 24 });

  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      role="img"
      aria-label="An ornate zodiac wheel of the twelve signs"
    >
      <defs>
        <linearGradient id="zw-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f7dcb6" />
          <stop offset="55%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="#c8854a" />
        </linearGradient>
        <radialGradient id="zw-disc" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--surface)" stopOpacity="0.65" />
          <stop offset="70%" stopColor="var(--background)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--background)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="zw-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f7dcb6" />
          <stop offset="45%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="zw-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
          <stop offset="60%" stopColor="var(--accent)" stopOpacity="0.08" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
        <filter id="zw-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ambient halo + base disc for depth */}
      <circle cx={C} cy={C} r={198} fill="url(#zw-halo)" />
      <circle cx={C} cy={C} r={186} fill="url(#zw-disc)" />

      {/* Segmented sign band with alternating depth shading */}
      <g>
        {GLYPHS.map((_, i) => (
          <path
            key={`seg-${i}`}
            d={wedge(bandInner, bandOuter, i * 30, (i + 1) * 30)}
            fill="var(--accent)"
            fillOpacity={i % 2 === 0 ? 0.1 : 0.03}
            stroke="var(--accent)"
            strokeOpacity="0.22"
            strokeWidth="0.75"
          />
        ))}
      </g>

      {/* Framing rings */}
      <circle cx={C} cy={C} r={bandOuter} fill="none" stroke="url(#zw-gold)" strokeWidth="2" />
      <circle cx={C} cy={C} r={bandInner} fill="none" stroke="url(#zw-gold)" strokeWidth="1.5" />
      <circle cx={C} cy={C} r={190} fill="none" stroke="var(--accent)" strokeOpacity="0.4" strokeWidth="1" />

      {/* Slowly turning ring of stars around the rim */}
      <g className="zodiac-spin" style={{ transformOrigin: "200px 200px" }}>
        {rimStars.map((_, i) => {
          const p = pol(181, i * 15);
          return (
            <circle
              key={`rim-${i}`}
              cx={p.x}
              cy={p.y}
              r={i % 2 ? 1 : 1.8}
              fill={i % 2 ? "var(--foreground)" : "url(#zw-gold)"}
              fillOpacity={i % 2 ? 0.45 : 0.9}
            />
          );
        })}
      </g>

      {/* Sign medallions — the glyphs as glowing gold "logos" */}
      <g filter="url(#zw-glow)">
        {GLYPHS.map((g, i) => {
          const deg = i * 30 + 15;
          const p = pol(medallionR, deg);
          return (
            <g key={`med-${i}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r={16}
                fill="var(--background)"
                fillOpacity="0.55"
                stroke="url(#zw-gold)"
                strokeWidth="1.25"
              />
              <text
                x={p.x}
                y={p.y + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="20"
                fontWeight="700"
                fill="url(#zw-gold)"
              >
                {g}
              </text>
            </g>
          );
        })}
      </g>

      {/* Radiant core */}
      <circle cx={C} cy={C} r={96} className="zodiac-pulse" fill="url(#zw-core)" />
      <g filter="url(#zw-glow)">
        {rays.map((_, i) => {
          const inner = pol(34, i * 30);
          const outer = pol(i % 2 ? 60 : 50, i * 30);
          return (
            <line
              key={`ray-${i}`}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="url(#zw-gold)"
              strokeWidth={i % 2 ? 1 : 2}
              strokeLinecap="round"
              strokeOpacity="0.85"
            />
          );
        })}
        <circle cx={C} cy={C} r={26} fill="var(--background)" stroke="url(#zw-gold)" strokeWidth="1.5" />
        <text
          x={C}
          y={C + 1}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="30"
          fill="url(#zw-gold)"
        >
          ✦
        </text>
      </g>
    </svg>
  );
}
