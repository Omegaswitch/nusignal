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

    // our own eased scroll: the browser's smooth scroll is short and abrupt. Snap is paused while it runs,
    // or mandatory snap would yank each intermediate frame back to the nearest point.
    const html = document.documentElement;
    let anim = 0;
    const DURATION = 950;
    const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
    const go = (from: number, dir: number) => {
      const step = stage.offsetHeight; // one screen in svh px, the spacing of every snap point
      const max = html.scrollHeight - window.innerHeight;
      const to = Math.max(0, Math.min(max, (Math.round(from / step) + dir) * step));
      lockedUntil = performance.now() + DURATION + 150;
      cancelAnimationFrame(anim);
      if (reduced.matches || to === window.scrollY) { window.scrollTo(0, to); return; }
      const start = window.scrollY, t0 = performance.now();
      html.style.scrollSnapType = "none";
      const tick = (now: number) => {
        const x = Math.min(1, (now - t0) / DURATION);
        window.scrollTo(0, start + (to - start) * easeInOut(x));
        if (x < 1) anim = requestAnimationFrame(tick);
        else html.style.scrollSnapType = "";
      };
      anim = requestAnimationFrame(tick);
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
      cancelAnimationFrame(anim);
      html.style.scrollSnapType = "";
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);
  return null;
}
