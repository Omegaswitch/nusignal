import { ArrowUpRight } from "lucide-react";

/* TODO: every value here is a placeholder until the group buy is confirmed. */
type Kit = { name: string; title: string; price: string; keys: string; image?: string; contents: string[] };
type Stage = { label: string; date: string; live?: boolean };

const INFO: {
  kits: Kit[];
  colours: { name: string; code: string; hex: string; ink: string }[];
  timeline: Stage[];
  vendors: { region: string; vendor: string; url?: string }[];
  faq: { q: string; a: string }[];
} = {
  kits: [
    {
      name: "Base", title: "Base: black caps, blue legends", price: "TBA", keys: "~150 keys", image: "/images/kit-base.webp",
      contents: ["TKL alphas and modifiers", "6.25u, 7u and 6u spacebars", "ISO enter", "Blue accent Esc, arrows and enter"],
    },
    {
      name: "Novelties", title: "Novelties: radios, dishes, towers", price: "TBA", keys: "TBA keys", image: "/images/kit-novelties.webp",
      contents: ["Radio waves, dish and walkie-talkie in black and blue", "2.25u satellite", "Tower ISO enter", "Six oscilloscope-wave R4 caps"],
    },
    { name: "Spacebars", title: "Spacebars", price: "TBA", keys: "TBA keys", contents: ["Sizes TBA"] },
    { name: "40s", title: "40s", price: "TBA", keys: "TBA keys", contents: ["Layout TBA"] },
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
    { region: "United States", vendor: "TBA" },
    { region: "Canada", vendor: "TBA" },
    { region: "Europe", vendor: "TBA" },
    { region: "United Kingdom", vendor: "TBA" },
    { region: "Oceania", vendor: "TBA" },
    { region: "Asia", vendor: "TBA" },
  ],
  faq: [
    { q: "When does the group buy open?", a: "TBA. Dates will be posted here once the interest check closes." },
    { q: "Is the ISO enter in Base?", a: "Yes, the ISO enter is part of the Base kit." },
    { q: "Will there be extras?", a: "GMK usually produces a small run of extras; vendors announce availability after fulfilment." },
    { q: "How long is production?", a: "Estimates are set by GMK and can move. Updates will be posted here." },
  ],
};

const h2 = "font-display text-[clamp(2.25rem,5.5vw,5rem)] leading-[0.95] tracking-tight text-signal-bright";
// one locked screen per section; py keeps content clear of the edges inside 100svh
const screen = "flex min-h-svh snap-start snap-always flex-col justify-center py-8 lg:py-16";
const split = "grid items-start gap-8 lg:grid-cols-12 lg:gap-12";
const ink = "text-[#cfe0ff]";

// TODO: replace "#" with the interest check form URL. Square corners to match the bracketed render frames.
export function CTA({ className = "" }: { className?: string }) {
  return (
    <a href="#" className={`inline-flex items-center bg-signal px-7 py-4 font-display text-lg font-medium text-white transition-colors hover:bg-signal-deep focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal-bright active:translate-y-px ${className}`}>
      Join the interest check
    </a>
  );
}

const safeHref = (u?: string) => (u?.startsWith("https:") ? u : undefined);

function KitScreen({ kit, extra }: { kit: Kit; extra?: Kit[] }) {
  const id = `kit-${kit.name.toLowerCase()}`;
  return (
    <section id={id} aria-labelledby={`${id}-h`} className={screen}>
      <div className={split}>
        <a href={kit.image} className="relative block w-full max-w-[min(100%,calc(100svh-8rem))] p-3 focus-visible:outline-2 focus-visible:outline-signal-bright max-lg:max-w-[min(100%,40svh)] lg:order-2 lg:col-span-7 lg:justify-self-end">
          {/* brackets frame the render like a scope viewport */}
          <span aria-hidden className="absolute left-0 top-0 h-4 w-4 border-l border-t border-signal" />
          <span aria-hidden className="absolute right-0 top-0 h-4 w-4 border-r border-t border-signal" />
          <span aria-hidden className="absolute bottom-0 left-0 h-4 w-4 border-b border-l border-signal" />
          <span aria-hidden className="absolute bottom-0 right-0 h-4 w-4 border-b border-r border-signal" />
          {/* skeleton is the wrapper's background: the opaque img paints over it on load, so no JS is needed */}
          <div className="ns-skeleton relative aspect-square bg-cap">
            {/* eslint-disable-next-line @next/next/no-img-element -- static export, no image optimiser */}
            <img src={kit.image} alt={`GMK nuSignal ${kit.name} kit render`} width={2000} height={2000} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
          </div>
        </a>
        <div className="lg:col-span-5">
          <h2 id={`${id}-h`} className="font-display text-[clamp(2rem,4vw,3.5rem)] leading-none tracking-tight text-signal-bright">{kit.title}</h2>
          <p className="mt-3 font-mono text-base tabular-nums">{kit.price} · {kit.keys}</p>
          <ul className={`mt-4 space-y-1 font-display text-base leading-snug sm:text-lg lg:mt-6 lg:space-y-2 ${ink}`}>
            {kit.contents.map((c) => <li key={c}>{c}</li>)}
          </ul>
          <a href={kit.image} className="mt-4 inline-flex items-center gap-1 font-mono text-base underline underline-offset-4 hover:text-signal-bright focus-visible:outline-2 focus-visible:outline-signal-bright lg:mt-6">
            Full render <ArrowUpRight aria-hidden className="h-4 w-4" />
          </a>
          {extra && (
            <ul className="mt-4 space-y-2 font-display text-base lg:mt-10">
              {extra.map((k) => (
                <li key={k.name} className="flex flex-wrap justify-between gap-x-4 bg-cap px-4 py-2 lg:py-3">
                  <span className="text-signal-bright">{k.name}</span>
                  <span className={`font-mono tabular-nums ${ink}`}>{k.contents.join(", ")} · {k.price}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

export default function Info() {
  const { kits, colours, timeline, vendors, faq } = INFO;
  const [base, novelties] = kits.filter((k) => k.image);
  const extra = kits.filter((k) => !k.image);
  return (
    <div id="info" className="bg-void px-4 text-signal-bright sm:px-6 lg:px-24">
      <div className="wrap mx-auto max-w-[1440px]">
        <KitScreen kit={base} />
        <KitScreen kit={novelties} extra={extra} />

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
            <h2 id="vendors-h" className={`${h2} lg:col-span-7`}>Regional vendors</h2>
            <table className="w-full border-collapse font-mono text-base tabular-nums lg:col-span-5">
              <thead>
                <tr className="border-b border-signal text-left">
                  <th scope="col" className="py-3 font-normal">Region</th>
                  <th scope="col" className="py-3 text-right font-normal">Vendor</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((v) => {
                  const href = safeHref(v.url);
                  return (
                    <tr key={v.region} className="border-b border-cap-edge">
                      <td className={`py-4 ${ink}`}>{v.region}</td>
                      <td className={`py-4 text-right ${ink}`}>{href ? <a href={href} className="underline">{v.vendor}</a> : v.vendor}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section id="faq" aria-labelledby="faq-h" className={screen}>
          <div className={split}>
            <div className="lg:col-span-7">
              <h2 id="faq-h" className={h2}>Group buy questions</h2>
              <CTA className="mt-10" />
            </div>
            <div className="lg:col-span-5">
              {faq.map((f) => (
                <details key={f.q} className="group mb-2 bg-cap px-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-display text-lg text-signal-bright focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-bright [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span aria-hidden className="font-mono transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className={`pb-5 font-display text-base leading-relaxed ${ink}`}>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
