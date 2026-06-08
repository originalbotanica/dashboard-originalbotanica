/**
 * Moon phase visual — an SVG disc showing tonight's illuminated lune.
 *
 * The lit region is drawn as a true lune: the outer limb is a semicircle and
 * the terminator is a semi-ellipse whose width tracks illumination, so both
 * crescents and gibbous moons render correctly. Pure SVG, no client JS.
 */
export function MoonPhase({
  illumination,
  waxing,
  size = 120,
}: {
  illumination: number; // 0..1
  waxing: boolean;
  size?: number;
}) {
  const r = 50;
  const f = Math.min(1, Math.max(0, illumination));
  const litPath = lunePath(r, f, waxing);

  return (
    <svg
      viewBox="-60 -60 120 120"
      width={size}
      height={size}
      role="img"
      aria-label={`Moon, ${Math.round(f * 100)} percent illuminated`}
      style={{ filter: "drop-shadow(0 0 18px rgba(232,172,124,0.25))" }}
    >
      {/* Dark disc (the shadowed moon) */}
      <circle cx="0" cy="0" r={r} fill="#1a140f" stroke="#2d251c" strokeWidth="1.5" />
      {/* Lit lune */}
      {f > 0.005 && (
        <path d={litPath} fill="url(#moonLit)" />
      )}
      <defs>
        <radialGradient id="moonLit" cx="50%" cy="42%" r="65%">
          <stop offset="0%" stopColor="#fbf1dc" />
          <stop offset="70%" stopColor="#e8ac7c" />
          <stop offset="100%" stopColor="#d4a24c" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/**
 * SVG path for the lit region of a moon of radius r.
 * f = illuminated fraction (0..1), waxing = lit on the right (N. hemisphere).
 */
function lunePath(r: number, f: number, waxing: boolean): string {
  const rx = Math.abs(r * (1 - 2 * f)); // terminator semi-minor axis
  const outerSweep = waxing ? 1 : 0;
  const innerSweep = f > 0.5 ? (waxing ? 1 : 0) : waxing ? 0 : 1;
  return `M 0 ${-r} A ${r} ${r} 0 0 ${outerSweep} 0 ${r} A ${rx} ${r} 0 0 ${innerSweep} 0 ${-r} Z`;
}
