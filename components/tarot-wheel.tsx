"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { WHEEL_DECK } from "@/lib/tarot/wheel-deck";

/**
 * The Tarot Wheel — the daily pull, reimagined as Chris's spinning wheel.
 *
 * The 21 hand-painted Major Arcana cards ring a center button. The member
 * spins once; the wheel always lands on the card drawn for them today (the
 * draw happens on the server, seeded by member + date, so it is personal and
 * steady all day). His music plays while it spins, with a mute toggle that
 * remembers the choice. When it stops, the card turns face up and its reading
 * — upright or upside down — appears beneath, framed in the house's light.
 *
 * One spin a day. Come back tomorrow turns the wheel again.
 */

const STEP = 360 / WHEEL_DECK.length; // degrees between cards
const SPIN_MS = 4200; // length of the spin
const MUSIC_SRC = "/tarot-wheel/sounds/background-full.mp3";
const MUTE_KEY = "ob-tarot-muted";

export function TarotWheel({
  index,
  reversed,
  reading,
  dayKey,
  dateLabel,
}: {
  /** Zero-based index (0..20) of the card to land on. */
  index: number;
  reversed: boolean;
  reading: string;
  /** New-York day key, e.g. "2026-06-16". Keys the once-a-day lock. */
  dayKey: string;
  dateLabel: string;
}) {
  const card = WHEEL_DECK[index];
  const doneKey = `ob-tarot-wheel:${dayKey}`;

  const [phase, setPhase] = useState<"ready" | "spinning" | "revealed">("ready");
  const [rotation, setRotation] = useState(0);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const revealRef = useRef<HTMLDivElement | null>(null);

  // On load: restore the mute preference, and if the member already spun
  // today, show their card straight away (no second spin).
  useEffect(() => {
    try {
      setMuted(localStorage.getItem(MUTE_KEY) === "1");
      if (localStorage.getItem(doneKey)) {
        setPhase("revealed");
        // Park the wheel with today's card under the pointer.
        setRotation(-index * STEP);
      }
    } catch {
      /* localStorage may be unavailable; fall back to a fresh spin. */
    }
  }, [doneKey, index]);

  // Keep the audio element's muted state in sync.
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      try {
        localStorage.setItem(MUTE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const spin = useCallback(() => {
    if (phase !== "ready") return;
    setPhase("spinning");

    // Start the music (a spin is a user gesture, so autoplay is allowed).
    try {
      const audio = new Audio(MUSIC_SRC);
      audio.loop = true;
      audio.muted = muted;
      audio.volume = 0.6;
      audio.play().catch(() => {});
      audioRef.current = audio;
    } catch {
      /* audio is optional */
    }

    // Land card `index` under the top pointer, after several full turns.
    const spins = prefersReducedMotion ? 0 : 5;
    const target = 360 * spins - index * STEP;
    setRotation(target);

    const settle = () => {
      setPhase("revealed");
      try {
        localStorage.setItem(doneKey, String(index));
      } catch {
        /* ignore */
      }
      // Let the music breathe for a beat, then ease it out.
      const audio = audioRef.current;
      if (audio) {
        const fade = setInterval(() => {
          if (audio.volume > 0.06) audio.volume -= 0.06;
          else {
            audio.pause();
            clearInterval(fade);
          }
        }, 120);
      }
      revealRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    window.setTimeout(settle, prefersReducedMotion ? 250 : SPIN_MS);
  }, [phase, index, muted, doneKey, prefersReducedMotion]);

  const wheelSize = "min(86vw, 460px)";
  const radius = "calc(min(86vw, 460px) * 0.355)";
  const cardW = "calc(min(86vw, 460px) * 0.145)";

  return (
    <section aria-label="Your tarot wheel" className="border-t border-[var(--border)]">
      <div className="max-w-3xl mx-auto px-6 py-16 flex flex-col items-center">
        {/* The wheel. */}
        <div
          className="relative"
          style={{
            width: wheelSize,
            height: wheelSize,
            // @ts-expect-error custom property
            "--r": radius,
          }}
        >
          {/* Pointer at the top, marking the card of the day. */}
          <span
            aria-hidden
            className="absolute left-1/2 -top-1 z-20"
            style={{
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "11px solid transparent",
              borderRight: "11px solid transparent",
              borderTop: "16px solid var(--accent)",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
            }}
          />

          {/* The rotating ring of cards. */}
          <div
            className="absolute inset-0"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition:
                phase === "spinning"
                  ? `transform ${SPIN_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`
                  : "none",
            }}
          >
            {WHEEL_DECK.map((c, i) => (
              <img
                key={c.id}
                src={c.image}
                alt=""
                aria-hidden
                draggable={false}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: cardW,
                  borderRadius: "5px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.45)",
                  transform: `translate(-50%, -50%) rotate(${i * STEP}deg) translateY(calc(-1 * var(--r)))`,
                  transformOrigin: "center center",
                }}
              />
            ))}
          </div>

          {/* Center hub — the spin button. */}
          <button
            type="button"
            onClick={spin}
            disabled={phase !== "ready"}
            aria-label={
              phase === "ready"
                ? "Spin the wheel for today's card"
                : "Today's card has been drawn"
            }
            className="absolute left-1/2 top-1/2 z-10 rounded-full flex items-center justify-center text-center"
            style={{
              transform: "translate(-50%, -50%)",
              width: "calc(min(86vw, 460px) * 0.30)",
              height: "calc(min(86vw, 460px) * 0.30)",
              background:
                "radial-gradient(circle at 50% 38%, #2a2118, #14100b 78%)",
              border: "1px solid var(--border)",
              boxShadow:
                "0 0 28px rgba(232,172,124,0.28), inset 0 0 18px rgba(0,0,0,0.6)",
              cursor: phase === "ready" ? "pointer" : "default",
            }}
          >
            <span
              className="display"
              style={{
                color: "var(--accent)",
                fontSize: "clamp(0.95rem, 3.4vw, 1.4rem)",
                lineHeight: 1.1,
                letterSpacing: "0.02em",
              }}
            >
              {phase === "spinning"
                ? "…"
                : phase === "revealed"
                  ? "Tarot\nToday"
                  : "Spin"}
            </span>
          </button>

          {/* Mute toggle. */}
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "Unmute the wheel" : "Mute the wheel"}
            className="absolute z-20 rounded-full flex items-center justify-center"
            style={{
              right: 0,
              bottom: 0,
              width: 40,
              height: 40,
              background: "rgba(20,16,11,0.85)",
              border: "1px solid var(--border)",
              color: "var(--foreground-muted)",
              cursor: "pointer",
            }}
          >
            {muted ? <SpeakerOff /> : <SpeakerOn />}
          </button>
        </div>

        {/* Prompt before the spin. */}
        {phase !== "revealed" ? (
          <p className="invocation text-[var(--foreground-muted)] mt-8 text-center max-w-md leading-relaxed">
            {phase === "spinning"
              ? "The wheel is turning…"
              : "One card waits for you today. Touch the center to spin the wheel, and let it land where it will."}
          </p>
        ) : null}

        {/* The reveal. */}
        {phase === "revealed" ? (
          <div ref={revealRef} className="mt-10 w-full flex flex-col items-center text-center">
            <img
              src={card.image}
              alt={card.name}
              draggable={false}
              style={{
                width: "min(58vw, 240px)",
                borderRadius: "10px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
                transform: reversed ? "rotate(180deg)" : "none",
              }}
            />
            <p className="eyebrow mt-7 mb-2 text-[var(--accent)]">
              {reversed ? "Upside down" : "Upright"}
            </p>
            <h2 className="display text-2xl md:text-3xl leading-tight mb-5">
              {card.name}
            </h2>
            <p className="text-[var(--foreground-muted)] leading-relaxed max-w-xl">
              {reading}
            </p>
            <p className="eyebrow mt-9 text-[var(--foreground-subtle)]">
              Your card for {dayName(dateLabel)} · come back tomorrow to turn the
              wheel again
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/** "Wednesday, June 3, 2026" -> "Wednesday". Falls back to "today". */
function dayName(dateLabel: string): string {
  const first = dateLabel.split(",")[0]?.trim();
  return first || "today";
}

function SpeakerOn() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M11 5 6 9H2v6h4l5 4z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  );
}

function SpeakerOff() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M11 5 6 9H2v6h4l5 4z" />
      <path d="m22 9-6 6" />
      <path d="m16 9 6 6" />
    </svg>
  );
}
