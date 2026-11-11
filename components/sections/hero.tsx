import { NuSignalLogo } from "@/components/brand/nusignal-logo";
import { Waveform } from "@/components/ui/waveform";
import { AetherRibbonMesh } from "@/components/ui/aether-ribbon-mesh";
import { CTA } from "@/components/sections/info";

export default function Hero() {
  return (
    <section id="hero" className="relative flex h-full min-h-svh w-full items-center justify-center overflow-hidden bg-void">
      <style>{`
        @keyframes ns-blink { 0%,100% { opacity: .35 } 50% { opacity: 1 } }
        .ns-blink { animation: ns-blink 2.4s ease-in-out infinite }
        @media (prefers-reduced-motion: reduce) { .ns-blink { animation: none } }
      `}</style>

      <div className="absolute inset-0 z-0"><AetherRibbonMesh /></div>
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,6,8,.55)_45%,#050608_95%)]" />

      <h1 className="sr-only">GMK nuSignal</h1>
      <div className="relative z-10 flex w-[92vw] md:w-[70vw] max-w-[1200px] flex-col items-center">
        <svg aria-hidden viewBox="0 0 120 40" className="ns-blink mb-6 w-16 text-signal-bright sm:w-20" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5">
          <path d="M42 8 a18 18 0 0 0 0 24 M78 8 a18 18 0 0 1 0 24 M30 2 a30 30 0 0 0 0 36 M90 2 a30 30 0 0 1 0 36" />
          <circle cx="60" cy="20" r="4" fill="currentColor" stroke="none" />
        </svg>
        {/* data-hero-logo marks the exact logo rect the signal-loss canvas redraws over */}
        <div data-hero-logo className="w-full">
          <NuSignalLogo className="w-full drop-shadow-[0_0_24px_rgba(31,111,224,0.35)]" />
        </div>
        <CTA className="mt-10" />
      </div>

      {/* full-width carrier along the bottom edge, kept faint so it reads as texture */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-4 opacity-25 sm:px-6 lg:px-24">
        <Waveform bare bars={96} intensity="low" variant="bright" className="w-full" />
      </div>
    </section>
  );
}
