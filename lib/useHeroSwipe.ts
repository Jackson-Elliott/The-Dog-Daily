"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

/** Keep in sync with `.hero-swipe-settle` in app/globals.css. */
export const HERO_SWIPE_MS = 280;
/** Space between the outgoing and incoming hero cards while swiping. */
export const HERO_SWIPE_GAP_PX = 16;

const LOCK_PX = 8;
const COMMIT_RATIO = 0.25;
const FLICK_PX_PER_MS = 0.45;
const RUBBER = 0.32;
const MOBILE_MQ = "(max-width: 639px)";
const REDUCE_MQ = "(prefers-reduced-motion: reduce)";

export type HeroSwipeHandlers = {
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerCancel: (event: ReactPointerEvent<HTMLElement>) => void;
};

/**
 * Mobile-only (below Tailwind `sm`) horizontal swipe on the hero photo.
 * Follows the finger, rubber-bands at either end of the list, and commits
 * to Day After (swipe right) / Day Before (swipe left) past a distance or
 * flick threshold. Vertical moves stay with the page scroll.
 */
export function useHeroSwipe({
  canSwipeAfter,
  canSwipeBefore,
  onSwipeAfter,
  onSwipeBefore,
}: {
  canSwipeAfter: boolean;
  canSwipeBefore: boolean;
  onSwipeAfter: () => void;
  onSwipeBefore: () => void;
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [phase, setPhase] = useState<"idle" | "dragging" | "settling">("idle");
  const [suppressClick, setSuppressClick] = useState(false);

  const frameRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const commitRef = useRef<"after" | "before" | null>(null);
  const settleHandledRef = useRef(false);
  const session = useRef({
    pointerId: -1,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastT: 0,
    velocity: 0,
    axis: "undecided" as "undecided" | "horizontal" | "vertical",
    width: 0,
    captured: false,
  });
  const latest = useRef({
    canSwipeAfter,
    canSwipeBefore,
    onSwipeAfter,
    onSwipeBefore,
    isMobile,
    reduceMotion: false,
  });
  latest.current.canSwipeAfter = canSwipeAfter;
  latest.current.canSwipeBefore = canSwipeBefore;
  latest.current.onSwipeAfter = onSwipeAfter;
  latest.current.onSwipeBefore = onSwipeBefore;
  latest.current.isMobile = isMobile;

  useEffect(() => {
    const mobile = window.matchMedia(MOBILE_MQ);
    const reduce = window.matchMedia(REDUCE_MQ);
    const sync = () => {
      setIsMobile(mobile.matches);
      latest.current.reduceMotion = reduce.matches;
    };
    sync();
    mobile.addEventListener("change", sync);
    reduce.addEventListener("change", sync);
    return () => {
      mobile.removeEventListener("change", sync);
      reduce.removeEventListener("change", sync);
    };
  }, []);

  const reset = useCallback(() => {
    draggingRef.current = false;
    commitRef.current = null;
    session.current.axis = "undecided";
    session.current.captured = false;
    session.current.pointerId = -1;
    setDragX(0);
    setPhase("idle");
  }, []);

  const releaseCapture = (target: HTMLElement, pointerId: number) => {
    if (!session.current.captured) return;
    try {
      target.releasePointerCapture(pointerId);
    } catch {
      /* already released */
    }
    session.current.captured = false;
  };

  const resist = (dx: number) => {
    if (dx > 0 && !latest.current.canSwipeAfter) return dx * RUBBER;
    if (dx < 0 && !latest.current.canSwipeBefore) return dx * RUBBER;
    return dx;
  };

  const endPointer = (event: ReactPointerEvent<HTMLElement>) => {
    if (session.current.pointerId !== event.pointerId) return;
    releaseCapture(event.currentTarget, event.pointerId);

    if (session.current.axis !== "horizontal") {
      reset();
      return;
    }

    const { canSwipeAfter: allowAfter, canSwipeBefore: allowBefore, onSwipeAfter: goAfter, onSwipeBefore: goBefore, reduceMotion } =
      latest.current;
    const dx = event.clientX - session.current.startX;
    const width = session.current.width || 1;
    const flickedAfter = session.current.velocity > FLICK_PX_PER_MS;
    const flickedBefore = session.current.velocity < -FLICK_PX_PER_MS;
    const draggedAfter = dx > 0 && Math.abs(dx) >= width * COMMIT_RATIO;
    const draggedBefore = dx < 0 && Math.abs(dx) >= width * COMMIT_RATIO;
    const goToAfter = dx > 0 && allowAfter && (draggedAfter || flickedAfter);
    const goToBefore = dx < 0 && allowBefore && (draggedBefore || flickedBefore);

    if (goToAfter || goToBefore) {
      if (reduceMotion) {
        if (goToAfter) goAfter();
        else goBefore();
        reset();
        return;
      }
      commitRef.current = goToAfter ? "after" : "before";
      settleHandledRef.current = false;
      draggingRef.current = false;
      setPhase("settling");
      setDragX(goToAfter ? width + HERO_SWIPE_GAP_PX : -(width + HERO_SWIPE_GAP_PX));
      return;
    }

    if (Math.abs(resist(dx)) < 1) {
      reset();
      return;
    }

    commitRef.current = null;
    settleHandledRef.current = false;
    draggingRef.current = false;
    setPhase("settling");
    setDragX(0);
  };

  const finishSettle = useCallback(() => {
    if (settleHandledRef.current) return;
    settleHandledRef.current = true;
    const commit = commitRef.current;
    if (commit === "after") latest.current.onSwipeAfter();
    else if (commit === "before") latest.current.onSwipeBefore();
    reset();
  }, [reset]);

  const photoHandlers: HeroSwipeHandlers = {
    onPointerDown: (event) => {
      if (!latest.current.isMobile) return;
      if (phase === "settling") return;
      setSuppressClick(false);
      settleHandledRef.current = false;
      draggingRef.current = true;
      session.current.pointerId = event.pointerId;
      session.current.startX = event.clientX;
      session.current.startY = event.clientY;
      session.current.lastX = event.clientX;
      session.current.lastT = event.timeStamp;
      session.current.velocity = 0;
      session.current.axis = "undecided";
      session.current.captured = false;
      session.current.width = frameRef.current?.clientWidth ?? event.currentTarget.clientWidth;
      setPhase("dragging");
      setDragX(0);
    },
    onPointerMove: (event) => {
      if (!draggingRef.current || session.current.pointerId !== event.pointerId) return;
      const dx = event.clientX - session.current.startX;
      const dy = event.clientY - session.current.startY;

      if (session.current.axis === "undecided") {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < LOCK_PX) return;
        session.current.axis = Math.abs(dx) > Math.abs(dy) ? "horizontal" : "vertical";
        if (session.current.axis === "vertical") return;
        setSuppressClick(true);
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
          session.current.captured = true;
        } catch {
          /* some browsers reject capture on a disappearing target */
        }
      }

      if (session.current.axis !== "horizontal") return;

      const dt = event.timeStamp - session.current.lastT;
      if (dt > 0) {
        session.current.velocity = (event.clientX - session.current.lastX) / dt;
      }
      session.current.lastX = event.clientX;
      session.current.lastT = event.timeStamp;
      setDragX(resist(dx));
    },
    onPointerUp: endPointer,
    onPointerCancel: endPointer,
  };

  useEffect(() => {
    if (phase !== "settling") return;
    const timeout = window.setTimeout(finishSettle, HERO_SWIPE_MS + 40);
    return () => window.clearTimeout(timeout);
  }, [finishSettle, phase]);

  function onTrackTransitionEnd(event: { target: EventTarget | null; currentTarget: EventTarget | null; propertyName?: string }) {
    if (phase !== "settling") return;
    if (event.target !== event.currentTarget) return;
    if (event.propertyName && event.propertyName !== "transform") return;
    finishSettle();
  }

  return {
    isMobile,
    dragX,
    phase,
    suppressClick,
    frameRef,
    photoHandlers,
    onTrackTransitionEnd,
  };
}
