"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useT } from "./locale-provider";
import { submitFeedbackAction } from "@/app/feedback/actions";

/**
 * The quiet "Share your thoughts" box — a small floating link in the
 * member area that opens a card, saves the member's words to
 * member_feedback, and thanks them warmly.
 *
 * TO REMOVE AT LAUNCH: set FEEDBACK_ENABLED to false. That's it — the
 * button disappears everywhere and all collected feedback stays safe in
 * the database.
 */
const FEEDBACK_ENABLED = true;

/** Member surfaces only — marketing pages never show the box. */
const MEMBER_PREFIXES = [
  "/dashboard",
  "/altar",
  "/ancestors",
  "/tarot",
  "/astrology",
  "/dreams",
  "/rituals",
  "/calendar",
  "/account",
];

export function FeedbackBox() {
  const pathname = usePathname() || "/";
  const t = useT();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );

  if (!FEEDBACK_ENABLED) return null;
  if (!MEMBER_PREFIXES.some((p) => pathname.startsWith(p))) return null;

  async function send() {
    if (!message.trim() || state === "sending") return;
    setState("sending");
    // Record the exact URL (including the specific candle, memorial,
    // etc.) so feedback can always be traced to the page it came from.
    const res = await submitFeedbackAction(message, window.location.href);
    if (res.ok) {
      setState("done");
      setMessage("");
      setTimeout(() => {
        setOpen(false);
        setState("idle");
      }, 2600);
    } else {
      setState("error");
    }
  }

  return (
    <div
      className="fixed right-3 md:right-4 z-40 flex flex-col items-end"
      style={{ bottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      {open && (
        <div className="mb-2 w-[min(19rem,calc(100vw-1.5rem))] rounded-lg border border-[var(--border-strong)] bg-[var(--background)] shadow-2xl p-4">
          {state === "done" ? (
            <p className="invocation text-sm text-[var(--accent)] leading-relaxed py-2">
              {t("fb.thanks")}
            </p>
          ) : (
            <>
              <p className="text-sm text-[var(--foreground-muted)] leading-relaxed mb-3">
                {t("fb.prompt")}
              </p>
              <textarea
                rows={4}
                maxLength={4000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("fb.placeholder")}
                className="form-input text-sm"
                autoFocus
              />
              {state === "error" && (
                <p className="form-error mt-2 text-xs">{t("fb.error")}</p>
              )}
              <div className="flex items-center justify-end gap-3 mt-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="nav-link text-xs text-[var(--foreground-subtle)] hover:text-[var(--accent)]"
                >
                  {t("fb.close")}
                </button>
                <button
                  type="button"
                  onClick={send}
                  disabled={!message.trim() || state === "sending"}
                  className="btn-primary text-sm px-4 py-2 disabled:opacity-50"
                >
                  {state === "sending" ? t("fb.sending") : t("fb.send")}
                </button>
              </div>
            </>
          )}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("fb.link")}
        className="rounded-full border border-[var(--border-strong)] bg-[var(--surface)]/85 backdrop-blur text-[var(--foreground-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors shadow-lg opacity-70 hover:opacity-100 flex items-center justify-center h-10 w-10 md:h-auto md:w-auto md:px-4 md:py-2 md:text-xs"
      >
        {/* On phones this is a small round mark — a text pill kept landing
            on top of the page's own links at the bottom of the screen. */}
        <svg
          className="md:hidden h-[18px] w-[18px]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.9 8.9 0 0 1-3.8-.9L3 21l1.9-4.1A8.4 8.4 0 0 1 12 3.5a8.4 8.4 0 0 1 9 8z" />
        </svg>
        <span className="hidden md:inline">{t("fb.link")}</span>
      </button>
    </div>
  );
}
