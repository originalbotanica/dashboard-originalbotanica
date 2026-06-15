"use client";

import { useState } from "react";

/**
 * The natal chart wheel image (an external SVG from AstrologyAPI).
 *
 * These SVGs sometimes fail to paint in an <img> (broken/expired URL, or
 * an SVG with no intrinsic dimensions). When that happens we hide the whole
 * frame rather than leaving a large empty bordered box on the page — the
 * placements below carry the chart on their own.
 */
export function ChartWheel({ src }: { src: string }) {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;

  return (
    <div className="rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--surface)] p-4 mb-12 flex justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Your natal chart wheel"
        width={520}
        height={520}
        loading="lazy"
        className="w-full max-w-[520px] h-auto"
        onError={() => setHidden(true)}
        onLoad={(e) => {
          // A successfully fetched but zero-size SVG still reads as broken
          // to the viewer — treat it the same as a load error.
          if (!e.currentTarget.naturalWidth) setHidden(true);
        }}
      />
    </div>
  );
}
