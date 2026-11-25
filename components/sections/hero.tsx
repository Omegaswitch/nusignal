import { NuSignalLogo } from "@/components/brand/nusignal-logo";
import LogoGlitch from "@/components/brand/logo-glitch";
import { Waveform } from "@/components/ui/waveform";
import { AetherRibbonMesh } from "@/components/ui/aether-ribbon-mesh";
import { CTA } from "@/components/sections/info";

export default function Hero() {
  return (
    <section id="hero" className="relative flex h-full min-h-svh w-full items-center justify-center overflow-hidden bg-void">
      <div className="absolute inset-0 z-0"><AetherRibbonMesh /></div>
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,6,8,.55)_45%,#050608_95%)]" />

      <h1 className="sr-only">GMK nuSignal</h1>
      <div className="relative z-10 flex w-[92vw] md:w-[70vw] max-w-[min(1200px,150svh)] flex-col items-center">
        {/* data-hero-logo marks the exact logo rect the signal-loss canvas redraws over */}
        <div data-hero-logo className="relative w-full">
          <NuSignalLogo className="block w-full drop-shadow-[0_0_24px_rgba(31,111,224,0.35)]" />
          <LogoGlitch />
        </div>
        <CTA className="mt-10" />
      </div>

      {/* carrier along the bottom edge, edge to edge, kept faint so it reads as texture; random spikes come from Waveform */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-10 opacity-25">
        <Waveform bare bars={160} intensity="low" variant="bright" className="w-full" />
      </div>
    </section>
  );
}
