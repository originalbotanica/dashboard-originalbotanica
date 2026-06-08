import { getColor } from "@/lib/altar/altar";

/**
 * A lit glass candle for the virtual altar, tinted to the chosen color.
 *
 * Drawn in CSS (glass body + layered flame) so any color works and it never
 * waits on an image. Reuses the flame-flicker keyframes from globals.css.
 * The .altarc-* styles live in globals.css.
 */
export function AltarCandle({
  color,
  size = "wall",
}: {
  color: string | null;
  size?: "wall" | "hero";
}) {
  const c = getColor(color);
  return (
    <span
      className={`altarc ${size === "hero" ? "altarc-hero" : ""}`}
      style={
        {
          ["--glass" as string]: c.hex,
          ["--wax" as string]: c.wax,
        } as React.CSSProperties
      }
      aria-hidden
    >
      <span className="altarc-flame">
        <span className="altarc-halo" />
        <span className="altarc-outer" />
        <span className="altarc-inner" />
      </span>
      <span className="altarc-glass">
        <span className="altarc-pool" />
        <span className="altarc-label" />
      </span>
    </span>
  );
}
