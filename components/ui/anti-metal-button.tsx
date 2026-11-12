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
};
// renders an <a> when given href (the CTA is a link), otherwise a <button>
type Props = Common &
  (({ href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof Common>) |
   ({ href?: undefined } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof Common>));

/*
 * Transparent face (no outline) with an accent tab on the left. On hover or keyboard focus the accent
 * fills the whole button: a clip-path reveal, so it animates on the compositor without re-layout.
 * The label stays on top the whole time. Size it with className (height, padding, text size).
 */
export const AntiMetalButton = React.forwardRef<HTMLAnchorElement & HTMLButtonElement, Props>(function AntiMetalButton(
  { className, children, label, accentFrom = "#d6f54a", accentTo = "#c5ea2c", dotColor = "#0f0f0f", ...props },
  ref,
) {
  const content = label ?? children ?? "Book a demo";
  const cls = cn(
    "group/btn relative isolate inline-flex h-11 items-center overflow-hidden rounded-xl bg-transparent pl-14 pr-5 text-[14px] font-medium tracking-tight text-white",
    "transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    className,
  );
  const inner = (
    <>
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 flex items-center gap-2.5 pl-4 transition-[clip-path] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] [clip-path:inset(0_calc(100%-2.75rem)_0_0)] group-hover/btn:[clip-path:inset(0_0_0_0)] group-focus-visible/btn:[clip-path:inset(0_0_0_0)] motion-reduce:transition-none"
        style={{ background: `linear-gradient(90deg, ${accentFrom} 0%, ${accentTo} 100%)` }}
      >
        <DoubleChevron index={0} dotColor={dotColor} />
      </span>
      <span className="relative">{content}</span>
    </>
  );
  return props.href !== undefined ? (
    <a ref={ref} className={cls} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>{inner}</a>
  ) : (
    <button ref={ref} className={cls} {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>{inner}</button>
  );
});

export default AntiMetalButton;
