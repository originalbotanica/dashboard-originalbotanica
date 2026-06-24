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
  // Hold back an incomplete product marker ("[[name|slug" with no "]]").
  const open = s.lastIndexOf("[[");
  if (open !== -1 && s.indexOf("]]", open) === -1) s = s.slice(0, open);
  // Hold back an unclosed bold span (odd number of "**").
  const stars = s.match(/\*\*/g);
  if (stars && stars.length % 2 === 1) s = s.slice(0, s.lastIndexOf("**"));
  return s;
}

/** Snap an index back to the end of the last whole word, so partial words
 *  are never shown (the reading reveals word-by-word, not letter-by-letter). */
function snapToWord(s: string, n: number): string {
  if (n >= s.length) return s;
  const slice = s.slice(0, n);
  const lastSpace = slice.search(/\s\S*$/); // index of last whitespace run
  return lastSpace === -1 ? "" : slice.slice(0, lastSpace + 1);
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
        // Slow, meditative base pace, easing faster only if the model gets
        // well ahead so the reveal never lags too far behind a long answer.
        const backlog = target - shown;
        const cps = Math.min(120, Math.max(22, backlog * 0.9));
        shown = Math.min(target, shown + (cps * dt) / 1000);
        shownRef.current = shown;
        onTickRef.current(
          clampToSafeBoundary(snapToWord(targetRef.current, Math.floor(shown))),
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
