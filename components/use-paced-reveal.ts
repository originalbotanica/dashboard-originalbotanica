"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Paced reveal for streamed assistant text.
 *
 * The model streams tokens as fast as the network delivers them, which
 * reads as text "spewing out." This hook decouples arrival from display:
 * feed it the running buffer with push(), and it reveals the text at a
 * calm, deliberate cadence via requestAnimationFrame — softer and more
 * ethereal. Call finish() when the source stream ends; once the reveal
 * catches up, onSettled() fires.
 *
 * It also holds back an incomplete product marker ("[[name|slug") so the
 * raw markup never flashes mid-reveal before its link resolves.
 */

function clampToSafeBoundary(s: string): string {
  const open = s.lastIndexOf("[[");
  if (open === -1) return s;
  const close = s.indexOf("]]", open);
  return close === -1 ? s.slice(0, open) : s;
}

export function usePacedReveal(
  onTick: (text: string) => void,
  onSettled: () => void,
) {
  // Keep latest callbacks without restarting the animation loop.
  const onTickRef = useRef(onTick);
  const onSettledRef = useRef(onSettled);
  onTickRef.current = onTick;
  onSettledRef.current = onSettled;

  const targetRef = useRef("");
  const shownRef = useRef(0);
  const doneRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef(0);

  const stop = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    lastTsRef.current = 0;
  }, []);

  const loop = useCallback(
    (ts: number) => {
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = Math.min(64, ts - lastTsRef.current); // clamp tab-switch gaps
      lastTsRef.current = ts;

      const target = targetRef.current.length;
      let shown = shownRef.current;

      if (shown < target) {
        // Gentle base pace, easing faster only if the model gets well
        // ahead so the reveal never lags too far behind a long answer.
        const backlog = target - shown;
        const cps = Math.min(190, Math.max(46, backlog * 1.8));
        shown = Math.min(target, shown + (cps * dt) / 1000);
        shownRef.current = shown;
        onTickRef.current(
          clampToSafeBoundary(targetRef.current.slice(0, Math.floor(shown))),
        );
      }

      if (doneRef.current && shownRef.current >= target) {
        onTickRef.current(targetRef.current); // flush any held-back tail
        stop();
        onSettledRef.current();
        return;
      }
      rafRef.current = requestAnimationFrame(loop);
    },
    [stop],
  );

  const start = useCallback(() => {
    if (rafRef.current == null) {
      lastTsRef.current = 0;
      rafRef.current = requestAnimationFrame(loop);
    }
  }, [loop]);

  const push = useCallback(
    (full: string) => {
      targetRef.current = full;
      start();
    },
    [start],
  );

  const finish = useCallback(() => {
    doneRef.current = true;
    start();
  }, [start]);

  const reset = useCallback(() => {
    stop();
    targetRef.current = "";
    shownRef.current = 0;
    doneRef.current = false;
  }, [stop]);

  useEffect(() => () => stop(), [stop]);

  return { push, finish, reset };
}
