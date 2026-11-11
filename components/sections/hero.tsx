import { NuSignalLogo } from "@/components/brand/nusignal-logo";
import { Waveform } from "@/components/ui/waveform";
import { AetherRibbonMesh } from "@/components/ui/aether-ribbon-mesh";
import { CTA } from "@/components/sections/info";

export default function Hero() {
  return (
    <section id="hero" className="relative flex h-full min-h-svh w-full items-center justify-center overflow-hidden bg-void">
      <style>{`
        @keyframes ns-ring { 0% { transform: translate(-50%,-50%) scale(.25); opacity: .7 } 100% { transform: translate(-50%,-50%) scale(1); opacity: 0 } }
        @keyframes ns-blink { 0%,100% { opacity: .35 } 50% { opacity: 1 } }
        .ns-ring { position:absolute; left:50%; top:50%; width:min(140vw,1100px,90svh); aspect-ratio:1; border-radius:9999px;
          border:1px solid var(--color-signal); animation: ns-ring 6s cubic-bezier(.2,.6,.3,1) infinite; }
        .ns-blink { animation: ns-blink 2.4s ease-in-out infinite }
        @media (prefers-reduced-motion: reduce) { .ns-ring, .ns-blink { animation: none } .ns-ring { opacity:.15; transform:translate(-50%,-50%) scale(.5) } }
      `}</style>

      <div className="absolute inset-0 z-0"><AetherRibbonMesh /></div>
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,6,8,.55)_45%,#050608_95%)]" />

      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {[0, 1.5, 3, 4.5].map((d) => (
          <span key={d} className="ns-ring" style={{ animationDelay: `-${d}s` }} />
        ))}
      </div>

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

      <div className="absolute bottom-4 left-4 z-10 sm:bottom-8 sm:left-6 lg:left-24">
        <Waveform label="CARRIER · CH 01" bars={24} intensity="medium" variant="bright" className="hidden w-56 md:block lg:w-64" />
      </div>
    </section>
  );
}
