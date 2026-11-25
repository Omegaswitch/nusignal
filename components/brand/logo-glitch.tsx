"use client";

import { useEffect, useRef } from "react";
import { GMK_PATH, LOGO_H, LOGO_W, WORD_PATH } from "@/components/brand/nusignal-logo";

/*
 * Every few seconds a thin horizontal band of the hero logo slips sideways for a moment, with a blue ghost
 * the other way, like the signal hiccupping. Two copies of the wordmark sit over the logo, clipped to the band.
 * Off while the page is scrolled (the canvas takes over the logo there), when the tab is hidden, and with reduced motion.
 */
export default function LogoGlitch() {
  const a = useRef<SVGSVGElement>(null);
  const b = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    let timer = 0;
    const r = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

    const glitch = () => {
      timer = window.setTimeout(glitch, r(2200, 5500));
      if (mq.matches || document.hidden || window.scrollY > 2) return;
      const top = r(0, 90), h = r(5, 18), dx = r(2, 7) * (Math.random() < 0.5 ? -1 : 1);
      const clip = `inset(${top}% 0 ${Math.max(0, 100 - top - h)}% 0)`;
      const ms = r(160, 320);
      // two or three quick flickers inside one burst
      const frames = (x: number) => [
        { opacity: 1, transform: `translateX(${x}px)` }, { opacity: 0, offset: 0.3 },
        { opacity: 1, transform: `translateX(${x * 0.5}px)`, offset: 0.55 }, { opacity: 0 },
      ];
      for (const [el, x] of [[a.current, dx], [b.current, -dx * 0.8]] as const) {
        if (!el) continue;
        el.style.clipPath = clip;
        el.animate(frames(x), { duration: ms, easing: "steps(6, end)" });
      }
    };
    timer = window.setTimeout(glitch, r(1200, 2500));
    return () => clearTimeout(timer);
  }, []);

  const layer = (ref: React.RefObject<SVGSVGElement | null>, gmk: string, word: string) => (
    <svg ref={ref} aria-hidden viewBox={`0 0 ${LOGO_W} ${LOGO_H}`} fillRule="evenodd" className="pointer-events-none absolute inset-0 h-full w-full opacity-0">
      <path d={GMK_PATH} fill={gmk} />
      <path d={WORD_PATH} fill={word} />
    </svg>
  );
  return (
    <>
      {layer(a, "#3b8bff", "#e8eefb")}
      {layer(b, "#1f6fe0", "#3b8bff")}
    </>
  );
}
