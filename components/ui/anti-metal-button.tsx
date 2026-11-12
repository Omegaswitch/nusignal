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
  /** extra classes for the label and the sliding accent block, for sizes other than the default 9rem x 2.75rem */
  labelClassName?: string; accentClassName?: string;
};
// renders an <a> when given href (the CTA is a link), otherwise a <button>
type Props = Common &
  (({ href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof Common>) |
   ({ href?: undefined } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof Common>));

export const AntiMetalButton = React.forwardRef<HTMLAnchorElement & HTMLButtonElement, Props>(function AntiMetalButton(
  { className, labelClassName, accentClassName, children, label, accentFrom = "#d6f54a", accentTo = "#c5ea2c", dotColor = "#0f0f0f", ...props },
  ref,
) {
  const content = label ?? children ?? "Book a demo";
  const cls = cn(
    "group/btn relative inline-flex h-11 w-36 overflow-hidden rounded-xl transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "bg-[linear-gradient(180deg,#1a1a1a_0%,#0a0a0a_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_4px_12px_rgba(0,0,0,0.18)]",
    className,
  );
  const inner = (
    <>
      <span className={cn("absolute inset-y-0 right-4 flex items-center text-[14px] font-medium tracking-tight text-white", labelClassName)}>{content}</span>
      <span
        aria-hidden="true"
        className={cn("absolute bottom-1 left-1 top-1 z-10 flex w-9 items-center justify-start gap-2.5 overflow-hidden rounded-md pl-3 pr-2.5 transition-[width,gap] duration-200 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover/btn:w-[calc(100%-0.5rem)] group-focus-visible/btn:w-[calc(100%-0.5rem)] motion-reduce:transition-none", accentClassName)}
        style={{
          background: `linear-gradient(180deg, ${accentFrom} 0%, ${accentTo} 100%)`,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)",
        }}
      >
        {[0, 1, 2, 3, 4].map((i) => <DoubleChevron key={i} index={i} dotColor={dotColor} />)}
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
