"use client";

import { useEffect, useState } from "react";
import { useT } from "@/components/locale-provider";

/**
 * The "Share with family" control on a memorial page. Shows the public link
 * with one-tap copy, the native share sheet on phones, and explicit links to
 * popular places families share (WhatsApp, Facebook, X, email) so desktop
 * users — who have no native share sheet — can still share in one click.
 */
export function ShareMemorialLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const t = useT();

  useEffect(() => {
    setCanShare(
      typeof navigator !== "undefined" && typeof navigator.share === "function",
    );
  }, []);

  const shareText = t("share.text");
  const u = encodeURIComponent(url);
  const tEnc = encodeURIComponent(shareText);

  // Instagram has no link-based share (you can't pre-fill a post from the web),
  // so its button copies the link and opens Instagram, ready to paste into a
  // story, DM, or bio. The rest use their normal web share intents.
  async function instagram() {
    await copy();
    window.open("https://www.instagram.com", "_blank", "noopener,noreferrer");
  }

  const socials: { label: string; href?: string; onClick?: () => void }[] = [
    { label: "Instagram", onClick: instagram },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { label: "X", href: `https://twitter.com/intent/tweet?text=${tEnc}&url=${u}` },
    {
      label: "Email",
      href: `mailto:?subject=${encodeURIComponent(
        t("share.emailSubject"),
      )}&body=${tEnc}%20${u}`,
    },
  ];

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
        title: t("share.nativeTitle"),
        text: shareText,
        url,
      });
    } catch {
      /* user dismissed the share sheet */
    }
  }

  return (
    <div className="flex flex-col items-center">
      <p className="eyebrow mb-2">{t("share.withFamily")}</p>
      <p className="text-sm text-[var(--accent)] break-all max-w-xs mb-3">{url}</p>

      <div className="flex flex-wrap gap-2 justify-center">
        <button type="button" onClick={copy} className="btn-ghost text-sm">
          {copied ? t("share.copied") : t("share.copy")}
        </button>
        {canShare && (
          <button type="button" onClick={share} className="btn-ghost text-sm">
            {t("share.share")}
          </button>
        )}
      </div>

      <p className="eyebrow text-[var(--foreground-subtle)] mt-5 mb-2">
        {t("share.orShareOn")}
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {socials.map((s) =>
          s.href ? (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost text-sm"
            >
              {s.label}
            </a>
          ) : (
            <button
              key={s.label}
              type="button"
              onClick={s.onClick}
              className="btn-ghost text-sm"
            >
              {s.label}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
