"use client";

import { useState } from "react";

/**
 * Share the day's tarot card. Opens a menu with explicit social options
 * (X, Facebook, WhatsApp, Pinterest, Reddit) plus copy-link — and, on
 * phones, the native share sheet as a "More…" option. The link points to
 * the public /card page for this card and orientation, so whoever opens it
 * sees the same card and an invite to join.
 */
export function ShareCardButton({
  cardId,
  cardName,
  reversed,
}: {
  cardId: string;
  cardName: string;
  reversed: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const buildUrl = () => {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    return `${base}/card/${cardId}${reversed ? "?r=1" : ""}`;
  };
  const buildText = () =>
    `My Original Botanica tarot card for today: ${cardName}${reversed ? " (upside down)" : ""}.`;

  const hasNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  const openWin = (u: string) => {
    window.open(u, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  const copyLink = () => {
    navigator.clipboard
      ?.writeText(buildUrl())
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      })
      .catch(() => {});
  };

  const nativeShare = async () => {
    try {
      await navigator.share({
        title: "Original Botanica — Tarot Today",
        text: buildText(),
        url: buildUrl(),
      });
    } catch {
      /* dismissed */
    }
    setOpen(false);
  };

  const url = () => encodeURIComponent(buildUrl());
  const text = () => encodeURIComponent(buildText());

  const links: { label: string; onClick: () => void }[] = [
    { label: "Share on X", onClick: () => openWin(`https://twitter.com/intent/tweet?text=${text()}&url=${url()}`) },
    { label: "Share on Facebook", onClick: () => openWin(`https://www.facebook.com/sharer/sharer.php?u=${url()}`) },
    { label: "Share on WhatsApp", onClick: () => openWin(`https://wa.me/?text=${text()}%20${url()}`) },
    { label: "Share on Pinterest", onClick: () => openWin(`https://www.pinterest.com/pin/create/button/?url=${url()}&description=${text()}`) },
    { label: "Share on Reddit", onClick: () => openWin(`https://www.reddit.com/submit?url=${url()}&title=${text()}`) },
  ];

  return (
    <div className="relative inline-flex flex-col items-center">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="btn-ghost inline-flex items-center gap-2"
      >
        <ShareIcon />
        Share this card
      </button>

      {open ? (
        <div
          className="absolute top-full mt-2 z-30 rounded-lg border border-[var(--border)] bg-[var(--surface)] py-1 shadow-lg"
          style={{ minWidth: 190 }}
        >
          {links.map((l) => (
            <button
              key={l.label}
              type="button"
              onClick={l.onClick}
              className="nav-link block w-full text-left px-4 py-2.5 text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            >
              {l.label}
            </button>
          ))}
          <button
            type="button"
            onClick={copyLink}
            className="nav-link block w-full text-left px-4 py-2.5 text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          >
            {copied ? "Link copied" : "Copy link"}
          </button>
          {hasNativeShare && (
            <button
              type="button"
              onClick={nativeShare}
              className="nav-link block w-full text-left px-4 py-2.5 text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            >
              More…
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4M15.4 6.5 8.6 10.5" />
    </svg>
  );
}
