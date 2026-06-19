"use client";

import { useState } from "react";

/**
 * Share the day's tarot card. On phones, the native share sheet (texts,
 * Instagram, WhatsApp, etc.). On desktop, a small menu: copy link, X,
 * Facebook. The link points to the public /card page for this card and
 * orientation, so whoever opens it sees the same card and an invite to join.
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

  const onShare = async () => {
    const url = buildUrl();
    const text = buildText();
    const nav = typeof navigator !== "undefined" ? navigator : undefined;
    if (nav && typeof nav.share === "function") {
      try {
        await nav.share({ title: "Original Botanica — Tarot Today", text, url });
      } catch {
        /* user dismissed; ignore */
      }
      return;
    }
    setOpen((o) => !o);
  };

  const copyLink = () => {
    const url = buildUrl();
    navigator.clipboard
      ?.writeText(url)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      })
      .catch(() => {});
  };

  const openX = () => {
    const u = `https://twitter.com/intent/tweet?text=${encodeURIComponent(buildText())}&url=${encodeURIComponent(buildUrl())}`;
    window.open(u, "_blank", "noopener,noreferrer");
    setOpen(false);
  };
  const openFb = () => {
    const u = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(buildUrl())}`;
    window.open(u, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  return (
    <div className="relative inline-flex flex-col items-center">
      <button type="button" onClick={onShare} className="btn-ghost inline-flex items-center gap-2">
        <ShareIcon />
        Share this card
      </button>

      {open ? (
        <div
          className="absolute top-full mt-2 z-30 rounded-lg border border-[var(--border)] bg-[var(--surface)] py-1"
          style={{ minWidth: 180 }}
        >
          <button type="button" onClick={copyLink} className="nav-link block w-full text-left px-4 py-2.5 text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
            {copied ? "Link copied" : "Copy link"}
          </button>
          <button type="button" onClick={openX} className="nav-link block w-full text-left px-4 py-2.5 text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
            Share on X
          </button>
          <button type="button" onClick={openFb} className="nav-link block w-full text-left px-4 py-2.5 text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
            Share on Facebook
          </button>
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
