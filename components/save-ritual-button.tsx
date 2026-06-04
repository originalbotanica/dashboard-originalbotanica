"use client";

import { useState, useTransition } from "react";
import { setRitualFavorite } from "@/app/rituals/actions";

/**
 * Bookmark / save toggle for a ritual.
 *
 * Optimistic: it flips immediately and reverts if the server write fails.
 * Two looks: "full" (a labeled button for the detail page) and "icon" (a
 * small round button that overlays a ritual card). The card variant is
 * rendered as a sibling of the card's link, not inside it, so clicking it
 * never triggers navigation.
 */
export function SaveRitualButton({
  ritualId,
  initialSaved,
  variant = "full",
}: {
  ritualId: string;
  initialSaved: boolean;
  variant?: "full" | "icon";
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = !saved;
    setSaved(next);
    startTransition(async () => {
      const res = await setRitualFavorite(ritualId, next);
      if (!res.ok) setSaved(!next);
    });
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-pressed={saved}
        aria-label={saved ? "Remove from saved" : "Save ritual"}
        title={saved ? "Saved" : "Save"}
        className={`grid place-items-center w-9 h-9 rounded-full border backdrop-blur transition-colors ${
          saved
            ? "border-[var(--accent)] text-[var(--accent)]"
            : "border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)]"
        }`}
        style={{ background: "rgba(13,10,7,0.55)", opacity: pending ? 0.6 : 1 }}
      >
        <BookmarkIcon filled={saved} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      className="btn-ghost inline-flex items-center gap-2"
      style={{ opacity: pending ? 0.6 : 1 }}
    >
      <BookmarkIcon filled={saved} />
      {saved ? "Saved" : "Save ritual"}
    </button>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}
