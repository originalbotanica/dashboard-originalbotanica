"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { tendCandleAction } from "@/app/altar/virtual/actions";
import { t, type Locale } from "@/lib/i18n/dictionary";

/**
 * The tending ritual. One tap and the room dims until the candle is the
 * only light on the page; the flame flares tall, embers rise off the wick,
 * and "The flame is held." surfaces in the dark. Then the light returns
 * and the flame settles into its brightened, tended state.
 *
 * The server write runs underneath the ritual; the page refreshes in place
 * once both finish. Members with reduced-motion get the quiet version.
 */
export function TendCandle({
  candleId,
  daysTended,
  totalDays,
  locale,
}: {
  candleId: string;
  daysTended: number;
  totalDays: number;
  locale: Locale;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<"idle" | "ritual" | "settling">("idle");
  const [, startTransition] = useTransition();
  const busy = phase !== "idle";

  async function tend(e: React.MouseEvent<HTMLButtonElement>) {
    if (busy) return;
    const target = document.getElementById("candle-flame");
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Scroll FIRST, from an unfocused button: disabling a focused control or
    // re-rendering mid-scroll cancels smooth scrolling in several browsers
    // (the bug where tending never brought the flame into view).
    e.currentTarget.blur();
    if (target) {
      const rect = target.getBoundingClientRect();
      const top = Math.max(
        0,
        window.scrollY + rect.top - (window.innerHeight - rect.height) / 2,
      );
      window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
    }
    // Let the scroll begin before the ritual re-render starts.
    await new Promise((r) => setTimeout(r, 60));

    setPhase("ritual");
    if (target) {
      if (!reduced) {
        target.classList.add("tending");
        const flame = target.querySelector(".altar-flame");
        if (flame) {
          for (let i = 0; i < 7; i++) {
            const s = document.createElement("span");
            s.className = "tend-ember";
            s.style.setProperty("--ed", `${(0.5 + i * 0.22).toFixed(2)}s`);
            s.style.setProperty(
              "--ex",
              `${(Math.random() * 44 - 22).toFixed(0)}px`,
            );
            flame.appendChild(s);
          }
        }
      }
    }

    // The write and the ritual run together; wait for the longer of the two.
    const write = tendCandleAction(candleId).catch(() => ({ ok: false }));
    await Promise.all([
      write,
      new Promise((r) => setTimeout(r, reduced ? 250 : 2800)),
    ]);

    setPhase("settling");
    startTransition(() => router.refresh());
    setTimeout(() => {
      target?.classList.remove("tending");
      target
        ?.querySelectorAll(".tend-ember")
        .forEach((e) => e.remove());
      setPhase("idle");
    }, 1000);
  }

  return (
    <>
      {/* The room, dimmed. The candle (z-raised) stays lit above it. */}
      <div
        aria-hidden
        className={`tend-dim${phase === "ritual" ? " on" : ""}`}
      >
        <p className="tend-dim-line invocation">{t(locale, "tend.done")}</p>
      </div>

      <button
        type="button"
        onClick={tend}
        disabled={busy}
        aria-busy={busy}
        className={`btn-primary ${busy ? "opacity-70 cursor-wait" : ""}`}
      >
        {busy ? t(locale, "tend.pending") : t(locale, "tend.btn")}
      </button>
      <p className="text-sm text-[var(--foreground-subtle)] mt-3 max-w-sm mx-auto leading-relaxed">
        {daysTended > 0
          ? t(locale, "tend.count", { n: daysTended, d: totalDays })
          : t(locale, "tend.hint")}
      </p>
    </>
  );
}
