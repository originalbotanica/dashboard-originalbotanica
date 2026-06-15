"use client";

import { useState } from "react";

/**
 * The natal chart wheel image.
 *
 * Two things make this tricky:
 *  1. AstrologyAPI's wheel URLs are temporary, so we capture the SVG to our
 *     own Supabase Storage at generation time (see lib/astrologer/context).
 *  2. The wheel is drawn in dark grey ink (#333 / #404040) for a white
 *     background, so it's invisible on our dark page — we sit it on a warm
 *     parchment panel so the chart reads like ink on paper.
 *
 * If the image ever genuinely fails to load, we hide the whole frame rather
 * than leave an empty box; the placements below carry the chart on their own.
 */
export function ChartWheel({ src }: { src: string }) {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;

  return (
    <div
      className="rounded-xl overflow-hidden border border-[var(--border-strong)] p-4 mb-12 flex justify-center"
      style={{ background: "#efe7d3" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Your natal chart wheel"
        width={520}
        height={520}
        className="w-full max-w-[520px] h-auto"
        onError={() => setHidden(true)}
      />
    </div>
  );
}
