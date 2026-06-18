"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { WHEEL_DECK } from "@/lib/tarot/wheel-deck";

/**
 * The Tarot Wheel — the daily pull, as Chris's spinning wheel.
 *
 * The 21 hand-painted Major Arcana cards ring a center button. The member
 * taps Spin to set the wheel turning, then taps Stop when the moment feels
 * right; the wheel eases to a halt. The chosen card then lifts out into the
 * CENTER of the screen, tilting toward the viewer in 3D, holds for a beat,
 * then glides down and settles into its slot as the reading appears beneath.
 * His music plays while it turns, with a mute toggle.
 *
 * ── TESTING MODE (preview branch only) ───────────────────────────────────
 * The once-a-day lock is OFF: the wheel can be spun any number of times, and
 * each spin lands on a fresh RANDOM card + orientation so the team can review
 * the full deck. At launch (step 4) this reverts to one deterministic card
 * per member per day, locked after the first pull.
 */

const STEP = 360 / WHEEL_DECK.length;
const SPIN_SPEED = 0.75;
const LAND_MS = 3600;
const LAND_SPINS = 3;
const MUSIC_SRC = "/tarot-wheel/sounds/background-full.mp3";
const MUTE_KEY = "ob-tarot-muted";

const WHEEL = "min(94vw, 640px)";
const RADIUS = `calc(${WHEEL} * 0.355)`;
const CARD_W = `calc(${WHEEL} * 0.16)`;
const HUB = `calc(${WHEEL} * 0.26)`;
const PRESENT_W = "min(74vw, 380px)"; // the big center-stage card
const SLOT_W = "min(64vw, 300px)"; // the resting card

type Phase = "ready" | "spinning" | "stopping" | "present" | "revealed";
type Draw = { index: number; reversed: boolean; reading: string };

export function TarotWheel({
  index,
  reversed,
  reading,
  dateLabel,
}: {
  index: number;
  reversed: boolean;
  reading: string;
  dayKey: string;
  dateLabel: string;
}) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [muted, setMuted] = useState(false);
  const [draw, setDraw] = useState<Draw>({ index, reversed, reading });
  const card = WHEEL_DECK[draw.index];

  const ringRef = useRef<HTMLDivElement | null>(null);
  const revealRef = useRef<HTMLDivElement | null>(null);
  const slotRef = useRef<HTMLDivElement | null>(null);
  const presentRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rotationRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef(0);
  const pendingIndexRef = useRef(index);
  const phaseRef = useRef<Phase>("ready");
  phaseRef.current = phase;

  const applyRotation = () => {
    if (ringRef.current) {
      ringRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
    }
  };

  useEffect(() => {
    try {
      setMuted(localStorage.getItem(MUTE_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

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

  const reducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const settle = useCallback(() => {
    fadeOutMusic();
    if (reducedMotion()) {
      setPhase("revealed");
      window.setTimeout(() => {
        const el = revealRef.current;
        if (!el) return;
        const y = el.getBoundingClientRect().top + window.scrollY - 28;
        smoothScrollTo(y, 500);
      }, 60);
      return;
    }
    // Card lifts out to center screen (3D), then flies down into its slot.
    setPhase("present");
  }, []);

  // Choreography for the center-stage presentation, run once the overlay and
  // the resting slot are in the DOM (phase === "present").
  useEffect(() => {
    if (phase !== "present") return;
    const el = presentRef.current;
    if (!el) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Start small, tilted away, transparent — then tilt out toward the viewer.
    el.style.transition = "none";
    el.style.opacity = "0";
    el.style.transform =
      "translate(-50%, -50%) perspective(1100px) scale(0.5) rotateX(48deg) rotateZ(-6deg)";
    void el.offsetWidth;
    el.style.transition =
      "transform 0.9s cubic-bezier(0.2,0.75,0.2,1), opacity 0.5s ease";
    el.style.opacity = "1";
    // Settle at center holding a clear 3D tilt — the card looks dimensional,
    // leaning toward the viewer — before it flattens on the way down.
    el.style.transform =
      "translate(-50%, -50%) perspective(1100px) scale(1.06) rotateX(-11deg) rotateY(8deg)";

    const timers: number[] = [];

    // Bring the resting layout into frame while the card holds at center.
    timers.push(
      window.setTimeout(() => {
        const slot = slotRef.current;
        if (!slot) return;
        const r = slot.getBoundingClientRect();
        const slotCenterAbs = r.top + window.scrollY + r.height / 2;
        smoothScrollTo(slotCenterAbs - vh * 0.58, 550);
      }, 1150),
    );

    // Glide down and shrink into the slot.
    timers.push(
      window.setTimeout(() => {
        const slot = slotRef.current;
        if (!slot || !presentRef.current) return;
        const r = slot.getBoundingClientRect();
        const dx = r.left + r.width / 2 - vw / 2;
        const dy = r.top + r.height / 2 - vh / 2;
        const k = r.width / presentRef.current.offsetWidth;
        presentRef.current.style.transition =
          "transform 0.8s cubic-bezier(0.4,0,0.15,1)";
        presentRef.current.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) perspective(1100px) scale(${k}) rotateX(0deg) rotateY(0deg)`;
      }, 1900),
    );

    // Hand off to the resting card + reading.
    timers.push(window.setTimeout(() => setPhase("revealed"), 2720));

    return () => timers.forEach(clearTimeout);
  }, [phase]);

  const loop = useCallback((ts: number) => {
    if (phaseRef.current !== "spinning") return;
    if (!lastTsRef.current) lastTsRef.current = ts;
    const dt = ts - lastTsRef.current;
    lastTsRef.current = ts;
    rotationRef.current += SPIN_SPEED * dt;
    applyRotation();
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  const beginSpin = useCallback(() => {
    if (phase === "spinning" || phase === "stopping" || phase === "present") return;

    const ri = Math.floor(Math.random() * WHEEL_DECK.length);
    const rrev = Math.random() < 0.5;
    const c = WHEEL_DECK[ri];
    pendingIndexRef.current = ri;
    setDraw({ index: ri, reversed: rrev, reading: rrev ? c.reversed : c.upright });

    if (reducedMotion()) {
      rotationRef.current = -ri * STEP;
      applyRotation();
      settle();
      return;
    }

    if (phase === "revealed") smoothScrollTo(0, 450);

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
  }, [phase, muted, loop, settle]);

  const stop = useCallback(() => {
    if (phase !== "spinning") return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setPhase("stopping");

    const current = rotationRef.current;
    const base = -pendingIndexRef.current * STEP;
    const remainder = (((current - base) % 360) + 360) % 360;
    const target = current + (360 - remainder) + 360 * LAND_SPINS;

    if (ringRef.current) {
      ringRef.current.style.transition = `transform ${LAND_MS}ms cubic-bezier(0.17, 0.67, 0.12, 1)`;
      rotationRef.current = target;
      applyRotation();
    }
    window.setTimeout(settle, LAND_MS + 80);
  }, [phase, settle]);

  const onHubClick =
    phase === "ready" || phase === "revealed"
      ? beginSpin
      : phase === "spinning"
        ? stop
        : undefined;

  const hubBusy = phase === "stopping" || phase === "present";
  const showReveal = phase === "present" || phase === "revealed";

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

          <div ref={ringRef} className="absolute inset-0" style={{ willChange: "transform" }}>
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

          <button
            type="button"
            onClick={onHubClick}
            disabled={hubBusy}
            aria-label={
              phase === "spinning"
                ? "Stop the wheel"
                : phase === "revealed"
                  ? "Spin again"
                  : "Spin the wheel"
            }
            className="absolute left-1/2 top-1/2 z-10 rounded-full flex items-center justify-center text-center"
            style={{
              transform: "translate(-50%, -50%)",
              width: HUB,
              height: HUB,
              background: "radial-gradient(circle at 50% 38%, #2a2118, #14100b 78%)",
              border: "1px solid var(--border)",
              boxShadow: "0 0 28px rgba(232,172,124,0.28), inset 0 0 18px rgba(0,0,0,0.6)",
              cursor: hubBusy ? "default" : "pointer",
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
                : phase === "stopping" || phase === "present"
                  ? "…"
                  : phase === "revealed"
                    ? "Spin\nagain"
                    : "Spin"}
            </span>
          </button>

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
        {phase === "ready" || phase === "spinning" || phase === "stopping" ? (
          <p className="invocation text-[var(--foreground-muted)] mt-8 text-center max-w-md leading-relaxed">
            {phase === "spinning"
              ? "When the right vibe hits, click the center again to stop the wheel."
              : phase === "stopping"
                ? "The wheel is settling…"
                : "One card waits for you today. Touch the center to spin the wheel."}
          </p>
        ) : null}

        {/* Resting reveal: card slot + reading. Present phase keeps it laid
            out (card hidden, reading faded) so the flying card can land. */}
        {showReveal ? (
          <div
            ref={revealRef}
            className="mt-12 w-full flex flex-col items-center text-center"
            style={{ scrollMarginTop: "1.5rem" }}
          >
            <div
              ref={slotRef}
              style={{ width: SLOT_W, visibility: phase === "revealed" ? "visible" : "hidden" }}
            >
              <img
                src={card.image}
                alt={card.name}
                draggable={false}
                style={{
                  width: "100%",
                  display: "block",
                  borderRadius: "12px",
                  boxShadow: "0 12px 48px rgba(0,0,0,0.6)",
                  transform: draw.reversed ? "rotate(180deg)" : "none",
                }}
              />
            </div>
            <div
              style={{
                opacity: phase === "revealed" ? 1 : 0,
                transition: "opacity 0.55s ease 0.15s",
              }}
            >
              <p className="eyebrow mt-7 mb-2 text-[var(--accent)]">
                {draw.reversed ? "Upside down" : "Upright"}
              </p>
              <h2 className="display text-2xl md:text-4xl leading-tight mb-5">
                {card.name}
              </h2>
              <p className="text-[var(--foreground-muted)] leading-relaxed max-w-xl text-lg mx-auto">
                {draw.reading}
              </p>
              <p className="eyebrow mt-9 text-[var(--foreground-subtle)]">
                Testing mode · tap “Spin again” to keep drawing
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {/* The card lifted out to center screen, in 3D, during "present". */}
      {phase === "present" ? (
        <div
          ref={presentRef}
          aria-hidden
          style={{
            position: "fixed",
            left: "50%",
            top: "50%",
            zIndex: 60,
            width: PRESENT_W,
            pointerEvents: "none",
            transformOrigin: "center center",
            willChange: "transform, opacity",
          }}
        >
          <img
            src={card.image}
            alt=""
            draggable={false}
            style={{
              width: "100%",
              display: "block",
              borderRadius: "14px",
              boxShadow: "0 30px 80px rgba(0,0,0,0.75)",
              transform: draw.reversed ? "rotate(180deg)" : "none",
            }}
          />
        </div>
      ) : null}
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
