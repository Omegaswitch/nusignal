"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// one chevron of dots; each dot waves in sequence, offset per chevron (.bd-dot keyframes live in globals.css)
function DoubleChevron({ index, dotColor }: { index: number; dotColor: string }) {
  const base = index * 0.12;
  const dots = [
    { cx: 2, cy: 2, d: 0 }, { cx: 5, cy: 5, d: 0.05 }, { cx: 8, cy: 8, d: 0.1 }, { cx: 5, cy: 11, d: 0.15 }, { cx: 2, cy: 14, d: 0.2 },
    { cx: 6, cy: 2, d: 0.05 }, { cx: 9, cy: 5, d: 0.1 }, { cx: 12, cy: 8, d: 0.15 }, { cx: 9, cy: 11, d: 0.2 }, { cx: 6, cy: 14, d: 0.25 },
  ];
  return (
    <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true" focusable="false" className="shrink-0 overflow-visible">
      <g fill={dotColor}>
        {dots.map((p, i) => (
          <circle key={i} cx={p.cx} cy={p.cy} r="1" className="bd-dot" style={{ animationDelay: `${base + p.d}s` }} />
        ))}
      </g>
    </svg>
  );
}

type Common = {
  label?: React.ReactNode; accentFrom?: string; accentTo?: string; dotColor?: string; className?: string; children?: React.ReactNode;
  /** at rest, every few seconds the fill stutters out to a random width and the label jitters, like a bad signal */
  glitch?: boolean;
};
// renders an <a> when given href (the CTA is a link), otherwise a <button>
type Props = Common &
  (({ href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof Common>) |
   ({ href?: undefined } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof Common>));

/*
 * Transparent face (no outline) with an accent tab on the left. On hover or keyboard focus the accent,
 * full of waving chevrons, takes over the whole button: a clip-path reveal, so it animates on the
 * compositor without re-layout. Size it with className (height, padding, text size). With glitch it
 * also stutters now and then at rest.
 */
export const AntiMetalButton = React.forwardRef<HTMLAnchorElement & HTMLButtonElement, Props>(function AntiMetalButton(
  { className, children, label, accentFrom = "#d6f54a", accentTo = "#c5ea2c", dotColor = "#0f0f0f", glitch = false, ...props },
  ref,
) {
  const content = label ?? children ?? "Book a demo";
  const fillRef = React.useRef<HTMLSpanElement>(null);
  const labelRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    if (!glitch) return;
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const r = (lo: number, hi: number) => lo + Math.random() * (hi - lo);
    let timer = 0;
    const burst = () => {
      timer = window.setTimeout(burst, r(2800, 6500));
      const fill = fillRef.current, text = labelRef.current, root = fill?.parentElement;
      if (!fill || !text || !root || mq.matches || document.hidden || root.matches(":hover, :focus-visible")) return;
      const rest = getComputedStyle(fill).clipPath;
      const w = () => `inset(0 ${r(15, 85).toFixed(1)}% 0 0)`;
      // the fill stutters out to random widths and snaps back; held frames read as a digital glitch, not a slide
      fill.animate([{ clipPath: rest }, { clipPath: w() }, { clipPath: rest }, { clipPath: w() }, { clipPath: rest }], { duration: r(220, 360), easing: "steps(1, end)" });
      text.animate([
        { transform: "translateX(0)", textShadow: "none" },
        { transform: `translateX(${r(-3, 3).toFixed(1)}px)`, textShadow: "2px 0 rgba(59,139,255,.9), -2px 0 rgba(191,239,255,.6)" },
        { transform: "translateX(0)", textShadow: "none" },
      ], { duration: r(160, 260), easing: "steps(3, end)" });
    };
    timer = window.setTimeout(burst, r(1500, 3500));
    return () => clearTimeout(timer);
  }, [glitch]);
  const cls = cn(
    "group/btn relative inline-flex h-11 items-center overflow-hidden rounded-xl bg-transparent pl-14 pr-5 text-[14px] font-medium tracking-tight text-white",
    "transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    className,
  );
  const inner = (
    <>
      <span ref={labelRef} className="relative">{content}</span>
      {/* the fill sits over the label: at rest only the tab shows; on hover the chevrons take over the whole button */}
      <span
        ref={fillRef}
        aria-hidden="true"
        className="absolute inset-0 flex items-center gap-2.5 overflow-hidden pl-4 transition-[clip-path] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] [clip-path:inset(0_calc(100%-2.375rem)_0_0)] group-hover/btn:[clip-path:inset(0_0_0_0)] group-focus-visible/btn:[clip-path:inset(0_0_0_0)] motion-reduce:transition-none"
        style={{ background: `linear-gradient(90deg, ${accentFrom} 0%, ${accentTo} 100%)` }}
      >
        {Array.from({ length: 14 }, (_, i) => <DoubleChevron key={i} index={i} dotColor={dotColor} />)}
        {/* scanlines over the fill, for the CRT read */}
        <span className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.16)_0_1px,transparent_1px_3px)]" />
      </span>
    </>
  );
  return props.href !== undefined ? (
    <a ref={ref} className={cls} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>{inner}</a>
  ) : (
    <button ref={ref} className={cls} {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>{inner}</button>
  );
});

export default AntiMetalButton;
