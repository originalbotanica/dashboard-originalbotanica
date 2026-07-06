"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { WHEEL_DECK, botanicaDayKey } from "@/lib/tarot/wheel-deck";
import { ShareCardButton } from "./share-card-button";

/**
 * The Tarot Wheel — the daily pull, as Chris's spinning wheel.
 *
 * The 21 hand-painted Major Arcana cards ring a center button. The member
 * taps Spin to set the wheel turning, then taps Stop when the moment feels
 * right; the wheel eases to a halt on the card drawn for them today. The
 * chosen card lifts out into the CENTER of the screen, tilting toward the
 * viewer in 3D, holds for a beat, then glides down and settles into place —
 * card and reading centered in view, no scrolling. His music plays while it
 * turns, with a mute toggle.
 *
 * The card (and its orientation) is decided on the server, seeded by member +
 * date, so it is personal and steady all day no matter when Stop is tapped.
 * One pull a day: once turned, it stays revealed until tomorrow.
 */

const STEP = 360 / WHEEL_DECK.length;
const SPIN_SPEED = 0.75;
const LAND_MS = 3600;
const LAND_SPINS = 3;
const MUSIC_SRC = "/tarot-wheel/sounds/background-full.mp3";
// Ethereal closing track. Has a built-in ~4.4s silent lead-in, so starting it
// the moment the wheel settles lands the swell right as the card is revealed.
const ENDING_SRC = "/tarot-wheel/sounds/after_click.wav";
const MUTE_KEY = "ob-tarot-muted";

// Cap by viewport height too, so on desktop the wheel never pushes the
// "stop the wheel" instruction below the fold.
const WHEEL = "min(92vw, 600px, 56vh)";
const RADIUS = `calc(${WHEEL} * 0.355)`;
const CARD_W = `calc(${WHEEL} * 0.16)`;
const HUB = `calc(${WHEEL} * 0.26)`;
const PRESENT_W = "min(74vw, 380px)";
const SLOT_W = "min(50vw, 200px)";

type Phase = "ready" | "spinning" | "stopping" | "present" | "revealed";

export function TarotWheel({
  index,
  reversed,
  reading,
  dayKey,
  dateLabel,
}: {
  /** Zero-based index (0..20) of today's card. */
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
  const slotRef = useRef<HTMLDivElement | null>(null);
  const presentRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const endAudioRef = useRef<HTMLAudioElement | null>(null);
  const rotationRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const fadeRef = useRef<number | null>(null);
  const lastTsRef = useRef(0);
  const phaseRef = useRef<Phase>("ready");
  phaseRef.current = phase;

  const applyRotation = () => {
    if (ringRef.current) {
      ringRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
    }
  };

  // Self-heal a stale page. If this view was served for an earlier day —
  // restored from the browser's back/forward cache, a long-open tab, or a
  // cached document — reload once (cache-busted) to fetch today's card, so a
  // member never sees an old card with a locked wheel.
  useEffect(() => {
    let today: string;
    try {
      today = botanicaDayKey();
    } catch {
      return;
    }
    if (today === dayKey) {
      // Tidy: drop locks from previous days so storage doesn't accumulate.
      try {
        for (const k of Object.keys(localStorage)) {
          if (k.startsWith("ob-tarot-wheel:") && k !== doneKey) {
            localStorage.removeItem(k);
          }
        }
      } catch {
        /* ignore */
      }
      return;
    }
    // Stale render — force a fresh fetch, once, with a cache-busting param.
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get("d") !== today) {
        url.searchParams.set("d", today);
        window.location.replace(url.toString());
      }
    } catch {
      window.location.reload();
    }
  }, [dayKey, doneKey]);

  // Also catch back/forward-cache restores, where React effects don't re-run.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      try {
        if (e.persisted && botanicaDayKey() !== dayKey) {
          window.location.reload();
        }
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, [dayKey]);

  // On load: restore mute, and if today's card was already pulled, show it.
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

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
    if (endAudioRef.current) endAudioRef.current.muted = muted;
  }, [muted]);

  // Preload the music while the wheel is ready, so it starts the exact moment
  // the member spins — no load latency between the turn and the first note.
  useEffect(() => {
    if (phase !== "ready") return;
    if (audioRef.current) return;
    if (reducedMotion()) return;
    try {
      const audio = new Audio(MUSIC_SRC);
      audio.loop = true;
      audio.preload = "auto";
      audio.muted = muted;
      audio.volume = 0.6;
      audio.load();
      audioRef.current = audio;

      const ending = new Audio(ENDING_SRC);
      ending.loop = false;
      ending.preload = "auto";
      ending.muted = muted;
      ending.volume = 0.75;
      ending.load();
      endAudioRef.current = ending;
    } catch {
      /* audio is optional */
    }
  }, [phase, muted]);

  // Fully stop and release the music. Used on fade-out, before a new spin,
  // and on unmount so the loop never outlives the page.
  const stopAudio = useCallback(() => {
    if (fadeRef.current) {
      clearInterval(fadeRef.current);
      fadeRef.current = null;
    }
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      try {
        audio.currentTime = 0;
      } catch {
        /* ignore */
      }
      audioRef.current = null;
    }
    const ending = endAudioRef.current;
    if (ending) {
      ending.pause();
      try {
        ending.currentTime = 0;
      } catch {
        /* ignore */
      }
      endAudioRef.current = null;
    }
  }, []);

  // Leaving the tarot page mid-spin must stop the music (and the animation).
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      stopAudio();
    };
  }, [stopAudio]);

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

  const fadeOutMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (fadeRef.current) clearInterval(fadeRef.current);
    fadeRef.current = window.setInterval(() => {
      const a = audioRef.current;
      if (!a) {
        if (fadeRef.current) clearInterval(fadeRef.current);
        fadeRef.current = null;
        return;
      }
      if (a.volume > 0.06) {
        a.volume = Math.max(0, a.volume - 0.06);
      } else {
        if (fadeRef.current) clearInterval(fadeRef.current);
        fadeRef.current = null;
        a.pause();
        try {
          a.currentTime = 0;
        } catch {
          /* ignore */
        }
        audioRef.current = null;
      }
    }, 120);
  }, []);

  const reducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const markDone = () => {
    try {
      localStorage.setItem(doneKey, String(index));
    } catch {
      /* ignore */
    }
  };

  // The ethereal closing track: spin music fades, this swells in as the card
  // is revealed (its built-in silent lead-in handles the timing).
  const playEnding = useCallback(() => {
    try {
      let a = endAudioRef.current;
      if (!a) {
        a = new Audio(ENDING_SRC);
        a.preload = "auto";
        endAudioRef.current = a;
      }
      a.loop = false;
      a.muted = muted;
      a.volume = 0.75;
      try {
        a.currentTime = 0;
      } catch {
        /* ignore */
      }
      a.play().catch(() => {});
    } catch {
      /* audio is optional */
    }
  }, [muted]);

  // Unlock the ending track for later playback. Browsers (especially iOS
  // Safari) only allow audio.play() that originates from a user gesture; the
  // ending swells from inside a setTimeout chain ~3.6s after Stop is tapped,
  // which is too late to count as a gesture. So during the Spin/Stop tap we
  // "prime" the element — play it, then immediately pause and rewind. The
  // track's silent lead-in means nothing is audible, and the element is now
  // unlocked so playEnding() works when the card is revealed.
  const primeEnding = useCallback(() => {
    try {
      let a = endAudioRef.current;
      if (!a) {
        a = new Audio(ENDING_SRC);
        a.preload = "auto";
        endAudioRef.current = a;
      }
      a.loop = false;
      a.muted = muted;
      a.volume = 0.75;
      const p = a.play();
      if (p && typeof p.then === "function") {
        p.then(() => {
          const el = endAudioRef.current;
          if (el) {
            el.pause();
            try {
              el.currentTime = 0;
            } catch {
              /* ignore */
            }
          }
        }).catch(() => {});
      } else {
        a.pause();
        try {
          a.currentTime = 0;
        } catch {
          /* ignore */
        }
      }
    } catch {
      /* audio is optional */
    }
  }, [muted]);

  const settle = useCallback(() => {
    fadeOutMusic();
    playEnding();
    markDone();
    if (reducedMotion()) {
      setPhase("revealed");
      window.setTimeout(() => {
        const el = revealRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        smoothScrollTo(
          r.top + window.scrollY + r.height / 2 - window.innerHeight / 2,
          500,
        );
      }, 60);
      return;
    }
    setPhase("present");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doneKey, index]);

  // Center-stage presentation: card lifts out to center (3D), then glides down
  // into its slot. Runs once the overlay + resting slot are in the DOM.
  useEffect(() => {
    if (phase !== "present") return;
    const el = presentRef.current;
    if (!el) return;
    const vh = window.innerHeight;

    el.style.transition = "none";
    el.style.opacity = "0";
    el.style.transform =
      "translate(-50%, -50%) perspective(1100px) scale(0.5) rotateX(48deg) rotateZ(-6deg)";
    void el.offsetWidth;
    el.style.transition =
      "transform 3.4s cubic-bezier(0.2,0.75,0.2,1), opacity 1.3s ease";
    el.style.opacity = "1";
    el.style.transform =
      "translate(-50%, -50%) perspective(1100px) scale(1.06) rotateX(-11deg) rotateY(8deg)";

    // Center the whole card + reading block in the viewport now (the reading
    // is laid out, just faded) so the card flies to an on-screen slot and the
    // settled card + reading need no scrolling.
    const block = revealRef.current;
    if (block) {
      const r = block.getBoundingClientRect();
      smoothScrollTo(r.top + window.scrollY + r.height / 2 - vh / 2, 900);
    }

    const timers: number[] = [];

    timers.push(
      window.setTimeout(() => {
        const slot = slotRef.current;
        if (!slot || !presentRef.current) return;
        const r = slot.getBoundingClientRect();
        const dx = r.left + r.width / 2 - window.innerWidth / 2;
        const dy = r.top + r.height / 2 - window.innerHeight / 2;
        const k = r.width / presentRef.current.offsetWidth;
        presentRef.current.style.transition =
          "transform 1.5s cubic-bezier(0.4,0,0.15,1)";
        presentRef.current.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) perspective(1100px) scale(${k}) rotateX(0deg) rotateY(0deg)`;
      }, 4600),
    );

    timers.push(window.setTimeout(() => setPhase("revealed"), 6250));

    return () => timers.forEach(clearTimeout);
  }, [phase]);

  // Once settled, guarantee the card + reading sit centered in the viewport —
  // including the return visit, where the page mounts already-revealed and the
  // big wheel images can still be loading (which shifts layout). We re-center
  // on a few ticks and on window load so the final position is correct even on
  // a cold load with slow images. After the animated reveal, images are already
  // loaded, so the first pass lands it and the rest are no-ops.
  useEffect(() => {
    if (phase !== "revealed") return;
    let cancelled = false;
    const center = () => {
      if (cancelled) return;
      const block = revealRef.current;
      if (!block) return;
      const r = block.getBoundingClientRect();
      smoothScrollTo(
        r.top + window.scrollY + r.height / 2 - window.innerHeight / 2,
        350,
      );
    };
    const timers = [
      window.setTimeout(center, 80),
      window.setTimeout(center, 550),
      window.setTimeout(center, 1200),
    ];
    if (document.readyState !== "complete") window.addEventListener("load", center);
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      window.removeEventListener("load", center);
    };
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
    if (phase !== "ready") return;

    // Unlock the ending track within this tap so it can swell later (autoplay).
    primeEnding();

    if (reducedMotion()) {
      rotationRef.current = -index * STEP;
      applyRotation();
      settle();
      return;
    }

    setPhase("spinning");
    // Music begins the instant the wheel turns. The track is preloaded while
    // the wheel sits ready (see the preload effect), so play() fires with no
    // network wait and the sound is in step with the very first rotation.
    try {
      let audio = audioRef.current;
      if (!audio) {
        audio = new Audio(MUSIC_SRC);
        audio.loop = true;
        audio.preload = "auto";
        audioRef.current = audio;
      }
      audio.muted = muted;
      audio.volume = 0.6;
      try {
        audio.currentTime = 0;
      } catch {
        /* ignore */
      }
      audio.play().catch(() => {});
    } catch {
      /* audio is optional */
    }

    if (ringRef.current) ringRef.current.style.transition = "none";
    lastTsRef.current = 0;
    rafRef.current = requestAnimationFrame(loop);
  }, [phase, index, muted, loop, settle, primeEnding]);

  const stop = useCallback(() => {
    if (phase !== "spinning") return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setPhase("stopping");

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
    phase === "ready" ? beginSpin : phase === "spinning" ? stop : undefined;

  const hubBusy = phase === "stopping" || phase === "present" || phase === "revealed";
  const showReveal = phase === "present" || phase === "revealed";

  return (
    <section aria-label="Your tarot wheel" className="border-t border-[var(--border)]">
      <div className="max-w-4xl mx-auto px-6 py-6 md:py-10 flex flex-col items-center">
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
                  ? "Today's card has been drawn"
                  : "Spin the wheel for today's card"
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
                    ? "Tarot\nToday"
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

        {phase === "ready" || phase === "spinning" || phase === "stopping" ? (
          <p className="invocation text-[var(--foreground-muted)] mt-6 text-center max-w-md leading-relaxed">
            {phase === "spinning"
              ? "When the moment feels right, click the center again to stop the wheel."
              : phase === "stopping"
                ? "The wheel is settling…"
                : "When the moment feels right, stop the wheel and meet your card for today."}
          </p>
        ) : null}

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
                  transform: reversed ? "rotate(180deg)" : "none",
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
                {reversed ? "Upside down" : "Upright"}
              </p>
              <h2 className="display text-2xl md:text-4xl leading-tight mb-5">
                {card.name}
              </h2>
              <p className="text-[var(--foreground-muted)] leading-relaxed max-w-xl text-lg mx-auto">
                {reading}
              </p>
              <div className="mt-8 flex justify-center">
                <ShareCardButton
                  cardId={card.id}
                  cardName={card.name}
                  reversed={reversed}
                />
              </div>
              <p className="eyebrow mt-9 text-[var(--foreground-subtle)]">
                Your card for {dayName(dateLabel)} · come back tomorrow to turn the
                wheel again
              </p>
            </div>
          </div>
        ) : null}
      </div>

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
              transform: reversed ? "rotate(180deg)" : "none",
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
 * scroll-behavior, with a guaranteed final position for browsers that
 * throttle requestAnimationFrame.
 */
function smoothScrollTo(targetY: number, duration = 700): void {
  const scroller = document.scrollingElement || document.documentElement;
  const startY = scroller.scrollTop;
  const dist = targetY - startY;
  if (Math.abs(dist) < 4) return;
  const start = performance.now();
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
  let settled = false;
  const step = (now: number) => {
    if (settled) return;
    const p = Math.min(1, (now - start) / duration);
    scroller.scrollTop = startY + dist * easeOutCubic(p);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
  window.setTimeout(() => {
    settled = true;
    scroller.scrollTop = targetY;
  }, duration + 90);
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
