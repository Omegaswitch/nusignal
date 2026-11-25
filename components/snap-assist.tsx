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
    // our own eased scroll: the browser's smooth scroll is short and abrupt. Snap is paused while it runs,
    // or mandatory snap would yank each intermediate frame back to the nearest point.
    const html = document.documentElement;
    let anim = 0, target = -1;
    const DURATION = 700;
    const easeOut = (x: number) => 1 - (1 - x) ** 3; // moves the moment you scroll, then settles softly
    const go = (from: number, dir: number) => {
      const step = stage.offsetHeight; // one screen in svh px, the spacing of every snap point
      const max = html.scrollHeight - window.innerHeight;
      const to = Math.max(0, Math.min(max, (Math.round(from / step) + dir) * step));
      cancelAnimationFrame(anim);
      if (reduced.matches || to === window.scrollY) { window.scrollTo(0, to); target = -1; return; }
      target = to;
      const start = window.scrollY, t0 = performance.now();
      html.style.scrollSnapType = "none";
      const tick = (now: number) => {
        const x = Math.min(1, (now - t0) / DURATION);
        window.scrollTo(0, start + (to - start) * easeOut(x));
        if (x < 1) anim = requestAnimationFrame(tick);
        else { html.style.scrollSnapType = ""; target = -1; }
      };
      anim = requestAnimationFrame(tick);
    };

    // one gesture = one step. A gesture ends when wheel events pause; trackpad inertia keeps sending smaller
    // and smaller deltas, so a sudden jump in size during that tail also counts as a new flick.
    let lastWheel = 0, lastMag = 0;
    const onWheel = (e: WheelEvent) => {
      if (document.querySelector(".lb:not([hidden])")) return; // the lightbox holds the page still
      if (short.matches || e.ctrlKey || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; // ctrl+wheel is zoom
      e.preventDefault();
      const now = performance.now(), mag = Math.abs(e.deltaY);
      const fresh = now - lastWheel > 180 || (mag > 20 && mag > lastMag * 1.8);
      lastWheel = now; lastMag = mag;
      if (!fresh || mag < 4) return;
      // chain from where the current move is heading, so quick flicks flow on instead of being swallowed
      go(target >= 0 ? target : window.scrollY, Math.sign(e.deltaY));
    };

    let startY = 0, startX = 0, startScroll = 0, single = false;
    const onTouchStart = (e: TouchEvent) => {
      single = e.touches.length === 1 && (window.visualViewport?.scale ?? 1) === 1; // leave pinch-zoom alone
      startY = e.touches[0].clientY;
      startX = e.touches[0].clientX;
      startScroll = window.scrollY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!single || short.matches || e.touches.length || document.querySelector(".lb:not([hidden])")) return;
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
