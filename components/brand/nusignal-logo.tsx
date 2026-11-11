import { cn } from "@/lib/utils";

/** Hand-drawn stroke paths for the "GMK" mini wordmark (viewBox 0 0 90 36). */
export const GMK_PATHS = [
  "M26 4 H14 a10 10 0 0 0 -10 10 V22 a10 10 0 0 0 10 10 H26 V19 H17",
  "M34 32 V4 L46 21 L58 4 V32",
  "M66 4 V32 M84 4 L71 18 L84 32",
];

/** Hand-drawn stroke paths for "nuSIGNAL" (cap height 100). */
export const WORD_PATHS = [
  "M4 94 V66 a18 18 0 0 1 36 0 V94", // n
  "M52 45 V76 a18 18 0 0 0 36 0 V45 V94", // u
  "M158 6 H124 a22 22 0 0 0 0 44 H136 a22 22 0 0 1 0 44 H102", // S
  "M172 6 V94", // I
  "M246 6 H218 A30 30 0 0 0 188 36 V64 A30 30 0 0 0 218 94 H246 V58 H224", // G
  "M262 94 V6 L306 82 M308 94 V6", // N (stencil break)
  "M322 94 V36 A28 28 0 0 1 378 36 V94 M322 64 H404", // A, bar runs into L
  "M392 6 V94 H442", // L
];

type LogoProps = {
  className?: string;
  /** Colour of the small GMK wordmark. */
  gmkColor?: string;
  /** Colour of the nuSIGNAL wordmark (defaults to currentColor). */
  wordColor?: string;
  title?: string;
};

export function NuSignalLogo({
  className,
  gmkColor = "var(--color-signal-bright)",
  wordColor = "currentColor",
  title = "GMK nuSignal",
}: LogoProps) {
  return (
    <svg
      viewBox="0 0 456 156"
      role="img"
      aria-label={title}
      className={cn("text-[#e8eefb]", className)}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <title>{title}</title>
      <g transform="translate(108 14) scale(0.85)" stroke={gmkColor} strokeWidth={3.6}>
        {GMK_PATHS.map((d) => <path key={d} d={d} />)}
      </g>
      <g transform="translate(6 52)" stroke={wordColor} strokeWidth={9}>
        {WORD_PATHS.map((d) => <path key={d} d={d} />)}
      </g>
    </svg>
  );
}

/** Tiny standalone mark: "nu" in a signal-blue broadcast arc. */
export function NuSignalMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("text-signal-bright", className)} fill="none"
      stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 44 V34 a7 7 0 0 1 14 0 V44 M38 26 V38 a7 7 0 0 0 14 0 V26 V44" strokeWidth={4} />
      <path d="M8 18 a32 32 0 0 1 48 0" strokeWidth={3} opacity={0.6} />
    </svg>
  );
}

export default NuSignalLogo;
