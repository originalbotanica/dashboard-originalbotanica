"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { WHEEL_DECK } from "@/lib/tarot/wheel-deck";

/**
 * The Tarot Wheel — the daily pull, as Chris's spinning wheel.
 *
 * The 21 hand-painted Major Arcana cards ring a center button. Like the
 * original, the member taps Spin to set the wheel turning, then taps Stop
 * when the moment feels right; the wheel then eases to a halt on the card
 * drawn for them today (the draw is decided on the server, seeded by member +
 * date, so the result is the same no matter when they hit Stop). His music
 * plays while it turns, with a mute toggle. When it lands, the card turns
 * face up and its reading — upright or upside down — appears beneath, and the
 * page eases down so the card and its reading sit front and center.
 *
 * One spin a day. Come back tomorrow turns the wheel again.
 */

const STEP = 360 / WHEEL_DECK.length; // degrees between cards
const SPIN_SPEED = 0.75; // degrees per millisecond while free-spinning
const LAND_MS = 3600; // deceleration time once Stop is tapped
const LAND_SPINS = 3; // extra full turns during the slow-down
const MUSIC_SRC = "/tarot-wheel/sounds/background-full.mp3";
const MUTE_KEY = "ob-tarot-muted";

// Wheel sizing — large enough to read the card art in the ring.
const WHEEL = "min(94vw, 640px)";
const RADIUS = `calc(${WHEEL} * 0.355)`;
const CARD_W = `calc(${WHEEL} * 0.16)`;
const HUB = `calc(${WHEEL} * 0.26)`;

type Phase = "ready" | "spinning" | "stopping" | "revealed";

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

  const [phase, setPhase] = useState<Phase>("ready");
  const [muted, setMuted] = useState(false);

  const ringRef = useRef<HTMLDivElement | null>(null);
  const revealRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rotationRef = useRef(0); // current wheel angle, degrees
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef(0);
  const phaseRef = useRef<Phase>("ready");
  phaseRef.current = phase;

  const applyRotation = () => {
    if (ringRef.current) {
      ringRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
    }
  };

  // On load: restore the mute preference, and if the member already spun
  // today, show their card straight away (no second spin), wheel parked on it.
  useEffect(() => {
    try {
      setMuted(localStorage.getItem(MUTE_KEY) === "1");
      if (localStorage.getItem(doneKey)) {
        rotationRef.current = -index * STEP;
        applyRotation();
        setPhase("revealed");
      }
    } catch {
      /* localStorage may be unavailable; fall back to a fresh spin. */
    }
  }, [doneKey, index]);

  // Keep the audio element's muted state in sync.
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  // Stop the animation loop if the component goes away mid-spin.
  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

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

  const fadeOutMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const fade = setInterval(() => {
      if (audio.volume > 0.06) audio.volume = Math.max(0, audio.volume - 0.06);
      else {
        audio.pause();
        clearInterval(fade);
      }
    }, 120);
  };

  const settle = useCallback(() => {
    setPhase("revealed");
    try {
      localStorage.setItem(doneKey, String(index));
    } catch {
      /* ignore */
    }
    fadeOutMusic();
    // Ease the page down so the card and its reading are front and center.
    // We animate the scroll ourselves: native smooth scrolling is unreliable
    // here, so a short eased tween guarantees the gentle glide every time.
    window.setTimeout(() => {
      const el = revealRef.current;
      if (!el) return;
      const y = el.getBoundingClientRect().top + window.scrollY - 28;
      smoothScrollTo(y, 700);
    }, 400);
  }, [doneKey, index]);

  const reducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  // Free-spin loop — runs until the member taps Stop.
  const loop = useCallback((ts: number) => {
    if (phaseRef.current !== "spinning") return;
    if (!lastTsRef.current) lastTsRef.current = ts;
    const dt = ts - lastTsRef.current;
    lastTsRef.current = ts;
    rotationRef.current += SPIN_SPEED * dt;
    applyRotation();
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  const spin = useCallback(() => {
    if (phase !== "ready") return;

    // Reduced motion: skip the animation, just reveal today's card.
    if (reducedMotion()) {
      rotationRef.current = -index * STEP;
      applyRotation();
      settle();
      return;
    }

    setPhase("spinning");
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

    if (ringRef.current) ringRef.current.style.transition = "none";
    lastTsRef.current = 0;
    rafRef.current = requestAnimationFrame(loop);
  }, [phase, index, muted, loop, settle]);

  const stop = useCallback(() => {
    if (phase !== "spinning") return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setPhase("stopping");

    // Advance to the next alignment of today's card under the pointer, plus a
    // few full turns, then ease out. The result is fixed; Stop only chooses
    // the moment, not the card.
    const current = rotationRef.current;
    const base = -index * STEP;
    const remainder = (((current - base) % 360) + 360) % 360;
    const target = current + (360 - remainder) + 360 * LAND_SPINS;

    if (ringRef.current) {
      ringRef.current.style.transition = `transform ${LAND_MS}ms cubic-bezier(0.17, 0.67, 0.12, 1)`;
      rotationRef.current = target;
      applyRotation();
    }
    window.setTimeout(settle, LAND_MS + 80);
  }, [phase, index, settle]);

  const onHubClick =
    phase === "ready" ? spin : phase === "spinning" ? stop : undefined;

  return (
    <section aria-label="Your tarot wheel" className="border-t border-[var(--border)]">
      <div className="max-w-4xl mx-auto px-6 py-16 flex flex-col items-center">
        {/* The wheel. */}
        <div
          className="relative"
          style={{
            width: WHEEL,
            height: WHEEL,
            // @ts-expect-error custom property
            "--r": RADIUS,
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
              borderLeft: "13px solid transparent",
              borderRight: "13px solid transparent",
              borderTop: "19px solid var(--accent)",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
            }}
          />

          {/* The rotating ring of cards. */}
          <div
            ref={ringRef}
            className="absolute inset-0"
            style={{ willChange: "transform" }}
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
                  width: CARD_W,
                  borderRadius: "6px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
                  transform: `translate(-50%, -50%) rotate(${i * STEP}deg) translateY(calc(-1 * var(--r)))`,
                  transformOrigin: "center center",
                }}
              />
            ))}
          </div>

          {/* Center hub — Spin, then Stop. */}
          <button
            type="button"
            onClick={onHubClick}
            disabled={phase === "stopping" || phase === "revealed"}
            aria-label={
              phase === "ready"
                ? "Spin the wheel for today's card"
                : phase === "spinning"
                  ? "Stop the wheel"
                  : "Today's card has been drawn"
            }
            className="absolute left-1/2 top-1/2 z-10 rounded-full flex items-center justify-center text-center"
            style={{
              transform: "translate(-50%, -50%)",
              width: HUB,
              height: HUB,
              background: "radial-gradient(circle at 50% 38%, #2a2118, #14100b 78%)",
              border: "1px solid var(--border)",
              boxShadow:
                "0 0 28px rgba(232,172,124,0.28), inset 0 0 18px rgba(0,0,0,0.6)",
              cursor:
                phase === "ready" || phase === "spinning" ? "pointer" : "default",
            }}
          >
            <span
              className="display"
              style={{
                color: "var(--accent)",
                fontSize: "clamp(1.05rem, 3.4vw, 1.6rem)",
                lineHeight: 1.1,
                letterSpacing: "0.02em",
                whiteSpace: "pre-line",
              }}
            >
              {phase === "spinning"
                ? "Stop"
                : phase === "stopping"
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
              width: 42,
              height: 42,
              background: "rgba(20,16,11,0.85)",
              border: "1px solid var(--border)",
              color: "var(--foreground-muted)",
              cursor: "pointer",
            }}
          >
            {muted ? <SpeakerOff /> : <SpeakerOn />}
          </button>
        </div>

        {/* Prompt — guides the Spin, then the Stop. */}
        {phase !== "revealed" ? (
          <p className="invocation text-[var(--foreground-muted)] mt-8 text-center max-w-md leading-relaxed">
            {phase === "spinning"
              ? "When the right vibe hits, click the center again to stop the wheel."
              : phase === "stopping"
                ? "The wheel is settling…"
                : "One card waits for you today. Touch the center to spin the wheel."}
          </p>
        ) : null}

        {/* The reveal. */}
        {phase === "revealed" ? (
          <div
            ref={revealRef}
            className="mt-12 w-full flex flex-col items-center text-center"
            style={{ scrollMarginTop: "1.5rem" }}
          >
            <img
              src={card.image}
              alt={card.name}
              draggable={false}
              style={{
                width: "min(64vw, 300px)",
                borderRadius: "12px",
                boxShadow: "0 12px 48px rgba(0,0,0,0.6)",
                transform: reversed ? "rotate(180deg)" : "none",
              }}
            />
            <p className="eyebrow mt-7 mb-2 text-[var(--accent)]">
              {reversed ? "Upside down" : "Upright"}
            </p>
            <h2 className="display text-2xl md:text-4xl leading-tight mb-5">
              {card.name}
            </h2>
            <p className="text-[var(--foreground-muted)] leading-relaxed max-w-xl text-lg">
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

/**
 * A gentle eased page scroll, animated by hand. We set scrollTop directly
 * each frame (rather than window.scrollTo) so it works regardless of CSS
 * scroll-behavior or browser quirks, and the rAF loop supplies the easing.
 */
function smoothScrollTo(targetY: number, duration = 700): void {
  const scroller = document.scrollingElement || document.documentElement;
  const startY = scroller.scrollTop;
  const dist = targetY - startY;
  if (Math.abs(dist) < 4) return;
  const start = performance.now();
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
  const step = (now: number) => {
    const p = Math.min(1, (now - start) / duration);
    scroller.scrollTop = startY + dist * easeOutCubic(p);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
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
