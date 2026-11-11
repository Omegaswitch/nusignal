import { NuSignalLogo } from "@/components/brand/nusignal-logo";
import { Waveform } from "@/components/ui/waveform";
import { AetherRibbonMesh } from "@/components/ui/aether-ribbon-mesh";

const hud = "pointer-events-none absolute font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-mute";

export default function Hero() {
  return (
    <section id="hero" className="relative flex min-h-svh items-center justify-center overflow-hidden bg-void">
      <style>{`
        @keyframes ns-ring { 0% { transform: translate(-50%,-50%) scale(.25); opacity: .7 } 100% { transform: translate(-50%,-50%) scale(1); opacity: 0 } }
        @keyframes ns-blink { 0%,100% { opacity: .35 } 50% { opacity: 1 } }
        @keyframes ns-cue { 0% { transform: translateY(0); opacity: 0 } 40% { opacity: 1 } 100% { transform: translateY(10px); opacity: 0 } }
        .ns-ring { position:absolute; left:50%; top:50%; width:min(140vw,1100px); aspect-ratio:1; border-radius:9999px;
          border:1px solid var(--color-signal); animation: ns-ring 6s cubic-bezier(.2,.6,.3,1) infinite; }
        .ns-blink { animation: ns-blink 2.4s ease-in-out infinite }
        .ns-cue { animation: ns-cue 1.8s ease-in infinite }
        @media (prefers-reduced-motion: reduce) { .ns-ring, .ns-blink, .ns-cue { animation: none } .ns-ring { opacity:.15; transform:translate(-50%,-50%) scale(.5) } }
      `}</style>

      <AetherRibbonMesh />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,6,8,.55)_45%,#050608_95%)]" />

      <div aria-hidden className="pointer-events-none absolute inset-0">
        {[0, 1.5, 3, 4.5].map((d) => (
          <span key={d} className="ns-ring" style={{ animationDelay: `-${d}s` }} />
        ))}
      </div>

      <h1 className="sr-only">GMK nuSignal</h1>
      <div data-hero-logo className="relative z-10 flex w-[92vw] md:w-[70vw] max-w-[1200px] flex-col items-center">
        <svg aria-hidden viewBox="0 0 120 40" className="ns-blink mb-6 w-16 text-signal-bright sm:w-20" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5">
          <path d="M42 8 a18 18 0 0 0 0 24 M78 8 a18 18 0 0 1 0 24 M30 2 a30 30 0 0 0 0 36 M90 2 a30 30 0 0 1 0 36" />
          <circle cx="60" cy="20" r="4" fill="currentColor" stroke="none" />
        </svg>
        <NuSignalLogo className="w-full drop-shadow-[0_0_24px_rgba(31,111,224,0.35)]" />
      </div>

      <div className={`${hud} left-4 top-4 sm:left-8 sm:top-8`}>CH 01 · 2.4GHz</div>
      <div className={`${hud} right-4 top-4 sm:right-8 sm:top-8`}>
        SIGNAL <span className="text-signal-bright">▮▮▮</span><span className="ns-blink text-signal-bright">▮</span>
      </div>
      <div className="absolute bottom-4 left-4 z-10 flex flex-col items-start gap-3 sm:bottom-8 sm:left-8">
        <Waveform label="CARRIER · CH 01" bars={24} intensity="medium" variant="bright" className="hidden w-56 md:block lg:w-64" />
        <span className="pointer-events-none font-mono text-[10px] uppercase tracking-[0.2em] text-mute sm:text-xs">GB · TBA</span>
      </div>
      <a href="#signal-loss" className={`${hud} pointer-events-auto bottom-4 right-4 flex items-center gap-2 hover:text-signal-bright sm:bottom-8 sm:right-8`}>
        Scroll <span className="ns-cue inline-block">↓</span>
      </a>
    </section>
  );
}
