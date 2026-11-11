"use client";

import { useEffect } from "react";

/*
 * CSS mandatory snap only advances when a gesture travels past half a screen, so a single
 * wheel notch or a short swipe snaps back and the page feels stuck. This makes one wheel
 * gesture or one swipe move exactly one screen. Keyboard and scrollbar stay native.
 */
export default function SnapAssist() {
  useEffect(() => {
    const short = window.matchMedia("(max-height: 500px)"); // snap is off there (globals.css)
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stage = document.querySelector<HTMLElement>("#signal-loss > .sticky");
    if (!stage) return;
    let lockedUntil = 0;

    const go = (from: number, dir: number) => {
      const step = stage.offsetHeight; // one screen in svh px, the spacing of every snap point
      lockedUntil = performance.now() + 900;
      window.scrollTo({ top: (Math.round(from / step) + dir) * step, behavior: reduced.matches ? "auto" : "smooth" });
    };

    const onWheel = (e: WheelEvent) => {
      if (short.matches || e.ctrlKey || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; // ctrl+wheel is zoom
      e.preventDefault();
      const now = performance.now();
      // trackpad inertia keeps sending events for a second or more: stay locked until they pause
      if (now < lockedUntil) { lockedUntil = Math.max(lockedUntil, now + 150); return; }
      if (Math.abs(e.deltaY) < 8) return;
      go(window.scrollY, Math.sign(e.deltaY));
    };

    let startY = 0, startX = 0, startScroll = 0, single = false;
    const onTouchStart = (e: TouchEvent) => {
      single = e.touches.length === 1 && (window.visualViewport?.scale ?? 1) === 1; // leave pinch-zoom alone
      startY = e.touches[0].clientY;
      startX = e.touches[0].clientX;
      startScroll = window.scrollY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!single || short.matches || e.touches.length) return;
      const dy = startY - e.changedTouches[0].clientY;
      const dx = startX - e.changedTouches[0].clientX;
      if (Math.abs(dy) < 30 || Math.abs(dy) < Math.abs(dx)) return;
      go(startScroll, Math.sign(dy));
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);
  return null;
}
