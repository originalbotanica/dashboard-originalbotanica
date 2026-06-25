"use client";

import { useEffect, useState } from "react";

/**
 * The "Share with family" control on a memorial page. Shows the public link
 * and offers one-tap copy (and the native share sheet on phones), instead of
 * a select-by-hand text box.
 */
export function ShareMemorialLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(
      typeof navigator !== "undefined" && typeof navigator.share === "function",
    );
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked; the link is shown above to copy by hand */
    }
  }

  async function share() {
    try {
      await navigator.share({
        title: "A memorial candle",
        text: "A flame lit in their memory. Add your light.",
        url,
      });
    } catch {
      /* user dismissed the share sheet */
    }
  }

  return (
    <div className="flex flex-col items-center">
      <p className="eyebrow mb-2">Share with family</p>
      <p className="text-sm text-[var(--accent)] break-all max-w-xs mb-3">{url}</p>
      <div className="flex flex-wrap gap-2 justify-center">
        <button type="button" onClick={copy} className="btn-ghost text-sm">
          {copied ? "Copied ✓" : "Copy link"}
        </button>
        {canShare && (
          <button type="button" onClick={share} className="btn-ghost text-sm">
            Share
          </button>
        )}
      </div>
    </div>
  );
}
