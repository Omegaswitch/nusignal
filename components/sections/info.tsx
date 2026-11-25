import { AntiMetalButton } from "@/components/ui/anti-metal-button";

/* TODO: every value here is a placeholder until the group buy is confirmed. */

type Stage = { label: string; date: string; live?: boolean };

const INFO: {
  renders: { src: string; alt: string }[];
  colours: { name: string; code: string; hex: string; ink: string }[];
  timeline: Stage[];
  vendors: { region: string; vendor: string; url?: string; lead?: boolean }[];
} = {
  renders: [
    { src: "/images/render-2.webp", alt: "GMK nuSignal on a blue TKL keyboard, blue Esc, enter and spacebar" },
    { src: "/images/render-1.webp", alt: "GMK nuSignal on two grey keyboards, with blue dish and walkie-talkie novelties" },
    { src: "/images/render-3.webp", alt: "GMK nuSignal alt mods on a black TKL keyboard: Signal Lost, Transmit, Boost" },
  ],
  colours: [
    { name: "Black", code: "CR", hex: "#0d0f13", ink: "#cfe0ff" },
    { name: "Blue", code: "V4", hex: "#1f6fe0", ink: "#ffffff" },
  ],
  timeline: [
    { label: "Interest check", date: "TBA", live: true },
    { label: "Group buy", date: "TBA" },
    { label: "Production", date: "TBA" },
    { label: "Shipping", date: "TBA" },
  ],
  vendors: [
    // TODO: add each vendor's group-buy page as url (https only) once the links exist
    { region: "USA", vendor: "Divinikey", lead: true },
    { region: "EU", vendor: "Delta Key Co" },
    { region: "UK", vendor: "ProtoTypist" },
    { region: "CA / Global", vendor: "Unikeys" },
    { region: "CN", vendor: "KBDFans" },
    { region: "SEA", vendor: "Ktechs" },
    { region: "JP", vendor: "Yushakobo" },
    { region: "KR", vendor: "GeonWorks" },
    { region: "OCE", vendor: "Keebz N Cables" },
  ],
};

const h2 = "font-display text-[clamp(2.25rem,5.5vw,5rem)] leading-[0.95] tracking-tight text-signal-bright";
// one locked screen per section; py keeps content clear of the edges inside 100svh
const screen = "flex min-h-svh snap-start snap-always flex-col justify-center py-8 lg:py-16";
const split = "grid items-start gap-8 lg:grid-cols-12 lg:gap-12";
const ink = "text-[#cfe0ff]";

// TODO: replace "#" with the interest check form URL.
// Square corners to match the kit frames; the blue tab fills the whole button on hover and keyboard focus.
export function CTA({ className = "" }: { className?: string }) {
  return (
    <AntiMetalButton
      href="#"
      label="Join the interest check"
      accentFrom="#1f6fe0"
      accentTo="#3b8bff"
      dotColor="#ffffff"
      glitch
      className={`h-14 rounded-none pl-16 pr-7 font-display text-lg text-white ${className}`}
    />
  );
}

const safeHref = (u?: string) => (u?.startsWith("https:") ? u : undefined);

export default function Info() {
  const { renders, colours, timeline, vendors } = INFO;
  return (
    <div id="info" className="bg-void px-4 text-signal-bright sm:px-6 lg:px-24">
      <div className="wrap mx-auto max-w-[1440px]">
        <section id="renders" aria-labelledby="renders-h" className="flex min-h-svh snap-start snap-always flex-col justify-center py-6">
          <h2 id="renders-h" className="sr-only">Renders</h2>
          {/* one large render on top, two side by side under it; each opens in the lightbox.
              16:9 renders: the stack is width * 27/32 tall, so the width is capped by the screen height to fit one screen */}
          <div className="mx-auto grid w-full max-w-[calc((100svh-3rem-1rem)*32/27)] grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
            {renders.map((r, i) => (
              <figure key={r.src} className={`render group relative m-0 overflow-hidden bg-cap ${i === 0 ? "col-span-2" : ""}`}>
                {/* eslint-disable-next-line @next/next/no-img-element -- static export, no image optimiser */}
                <img src={r.src} alt={r.alt} width={1920} height={1080} loading="lazy" decoding="async" className="aspect-video h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] motion-reduce:transition-none" />
                {/* opens the travelling lightbox (components/lightbox.tsx) */}
                <button type="button" className="zoom" aria-label={`View larger: ${r.alt}`} />
              </figure>
            ))}
          </div>
        </section>

        <section id="colours" aria-labelledby="colours-h" className={screen}>
          <h2 id="colours-h" className={h2}>GMK CR black, V4 blue</h2>
          <div className="mt-10 grid h-[55svh] grid-cols-2 gap-4">
            {colours.map((c) => (
              <div key={c.code} className="flex items-end justify-between p-5 font-display text-xl ring-1 ring-cap-edge ring-inset" style={{ background: c.hex, color: c.ink }}>
                <span>{c.name}</span>
                <span className="font-mono">{c.code}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="timeline" aria-labelledby="timeline-h" className={screen}>
          <h2 id="timeline-h" className={h2}>From interest check to your desk</h2>
          {/* one continuous trace; amplitude grows as the project gets closer to shipping */}
          <svg viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden className="mt-12 h-24 w-full text-signal sm:h-32">
            <path
              d="M0 60 L60 60 Q 75 50 90 60 T 120 60 L250 60 Q 270 35 290 60 T 330 60 T 370 60 L500 60 Q 520 20 540 60 T 580 60 T 620 60 T 660 60 L750 60 L765 8 L780 112 L795 20 L810 100 L825 60 L1000 60"
              fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke"
            />
          </svg>
          <ol className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {timeline.map((s) => (
              <li key={s.label} className="font-mono text-base tabular-nums">
                <p className={`font-display text-2xl ${s.live ? "text-signal-bright" : "text-[#cfe0ff]"}`}>
                  {s.label}{s.live && <span className="ml-2 inline-block h-2 w-2 animate-pulse bg-signal-bright align-middle" aria-label="current stage" />}
                </p>
                <p className={ink}>{s.date}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="vendors" aria-labelledby="vendors-h" className={screen}>
          <div className={split}>
            <div className="lg:col-span-7">
              <h2 id="vendors-h" className={h2}>Regional vendors</h2>
              <CTA className="mt-6 lg:mt-10" />
            </div>
            <table className="w-full border-collapse font-mono text-sm tabular-nums sm:text-base lg:col-span-5">
              <thead>
                <tr className="border-b border-signal text-left">
                  <th scope="col" className="py-2 font-normal">Region</th>
                  <th scope="col" className="py-2 text-right font-normal">Vendor</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((v) => {
                  const href = safeHref(v.url);
                  return (
                    <tr key={v.region} className="border-b border-cap-edge">
                      <td className={`py-[clamp(0.25rem,1.1svh,1rem)] ${ink}`}>{v.region}</td>
                      <td className={`py-[clamp(0.25rem,1.1svh,1rem)] text-right ${ink}`}>{href ? <a href={href} target="_blank" rel="noopener noreferrer" className="underline">{v.vendor}</a> : v.vendor}{v.lead && <span className="ml-2 text-signal-bright">(lead)</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
