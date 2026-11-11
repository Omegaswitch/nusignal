import { ArrowUpRight } from "lucide-react";

/* TODO: every value here is a placeholder until the group buy is confirmed. */
type Kit = { name: string; price: string; keys: string; image?: string; contents: string[] };
type Stage = { label: string; date: string; live?: boolean };

const INFO: {
  kits: Kit[];
  specs: [string, string][];
  colours: { name: string; hex: string; code: string }[];
  timeline: Stage[];
  vendors: { region: string; vendor: string; url?: string }[];
  faq: { q: string; a: string }[];
} = {
  kits: [
    {
      name: "Base", price: "TBA", keys: "~150 keys", image: "/images/kit-base.webp",
      contents: ["TKL alphas and modifiers", "6.25u, 7u and 6u spacebars", "ISO enter", "Blue accent Esc, arrows and enter"],
    },
    {
      name: "Novelties", price: "TBA", keys: "TBA keys", image: "/images/kit-novelties.webp",
      contents: ["Radio waves, dish and walkie-talkie in black and blue", "2.25u satellite", "Tower ISO enter", "Six oscilloscope-wave R4 caps"],
    },
    { name: "Spacebars", price: "TBA", keys: "TBA keys", contents: ["Sizes TBA"] },
    { name: "40s", price: "TBA", keys: "TBA keys", contents: ["Layout TBA"] },
  ],
  specs: [
    ["Manufacturer", "GMK, Germany"],
    ["Material", "Doubleshot ABS"],
    ["Profile", "Cherry"],
    ["Colour codes", "CR / custom blue — TBA"],
    ["MOQ", "TBA"],
  ],
  colours: [
    { name: "Cap black", hex: "#0d0f13", code: "CR" },
    { name: "Signal blue", hex: "#1f6fe0", code: "TBA" },
    { name: "Deep blue", hex: "#0b3ea8", code: "TBA" },
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

const h2 = "font-display text-[clamp(2.75rem,7vw,6.5rem)] leading-[0.95] tracking-tight text-signal-bright";
const gap = "mt-[clamp(96px,12vw,176px)]";
const ink = "text-[#cfe0ff]";

export default function Info() {
  const { kits, specs, colours, timeline, vendors, faq } = INFO;
  const [main, ...rest] = kits.filter((k) => k.image);
  const extra = kits.filter((k) => !k.image);
  return (
    <div id="info" className="bg-void px-4 pb-[clamp(96px,12vw,176px)] pt-[clamp(64px,8vw,120px)] text-signal sm:px-8 lg:px-16">
      <div className="mx-auto max-w-[1440px]">
        <section id="kits" aria-labelledby="kits-h">
          <h2 id="kits-h" className={h2}>The kits</h2>
          {[main, ...rest].map((k, i) => (
            <div key={k.name} className={`mt-12 grid items-center gap-8 lg:grid-cols-12 lg:gap-12 ${i ? "lg:mt-24" : ""}`}>
              <a href={k.image} className={`relative block p-3 lg:col-span-8 ${i % 2 ? "lg:order-2" : ""}`}>
                {/* brackets frame the render like a scope viewport */}
                <span aria-hidden className="absolute left-0 top-0 h-4 w-4 border-l border-t border-signal" />
                <span aria-hidden className="absolute right-0 top-0 h-4 w-4 border-r border-t border-signal" />
                <span aria-hidden className="absolute bottom-0 left-0 h-4 w-4 border-b border-l border-signal" />
                <span aria-hidden className="absolute bottom-0 right-0 h-4 w-4 border-b border-r border-signal" />
                {/* eslint-disable-next-line @next/next/no-img-element -- static export, no image optimiser */}
                <img src={k.image} alt={`GMK nuSignal ${k.name} kit render`} className="w-full" loading="lazy" />
              </a>
              <div className="lg:col-span-4">
                <h3 className="font-display text-4xl text-signal-bright sm:text-5xl">{k.name}</h3>
                <p className="mt-2 font-mono text-base">{k.price} · {k.keys}</p>
                <ul className={`mt-6 space-y-2 font-mono text-base leading-relaxed ${ink}`}>
                  {k.contents.map((c) => <li key={c}>— {c}</li>)}
                </ul>
                <a href={k.image} className="mt-6 inline-flex items-center gap-1 font-mono text-base underline underline-offset-4 hover:text-signal-bright">
                  Full render <ArrowUpRight aria-hidden className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
          <ul className="mt-16 divide-y divide-cap-edge border-y border-cap-edge font-mono text-base">
            {extra.map((k) => (
              <li key={k.name} className="flex flex-wrap justify-between gap-x-6 gap-y-1 py-5">
                <span className="font-display text-2xl text-signal-bright">{k.name}</span>
                <span className={ink}>{k.contents.join(", ")} · {k.keys} · {k.price}</span>
              </li>
            ))}
          </ul>
        </section>

        <section id="specs" aria-labelledby="specs-h" className={`${gap} grid gap-10 lg:grid-cols-2 lg:gap-16`}>
          <div>
            <h2 id="specs-h" className={h2}>Specs</h2>
            <table className="mt-10 w-full border-collapse font-mono text-base">
              <tbody>
                {specs.map(([k, v]) => (
                  <tr key={k} className="border-b border-cap-edge">
                    <th scope="row" className="py-4 pr-4 text-left font-normal text-signal">{k}</th>
                    <td className={`py-4 text-right ${ink}`}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col">
            {colours.map((c) => (
              <div key={c.hex} className="flex flex-1 items-end justify-between px-5 py-6 font-mono text-base min-h-28" style={{ background: c.hex }}>
                <span className="text-[#cfe0ff]">{c.name}</span>
                <span className="text-[#cfe0ff]">{c.code} · {c.hex}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="timeline" aria-labelledby="timeline-h" className={gap}>
          <h2 id="timeline-h" className={h2}>Transmission schedule</h2>
          {/* one continuous trace; amplitude grows as the project gets closer to shipping */}
          <svg viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden className="mt-12 h-24 w-full text-signal sm:h-32">
            <path
              d="M0 60 L60 60 Q 75 50 90 60 T 120 60 L250 60 Q 270 35 290 60 T 330 60 T 370 60 L500 60 Q 520 20 540 60 T 580 60 T 620 60 T 660 60 L750 60 L765 8 L780 112 L795 20 L810 100 L825 60 L1000 60"
              fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke"
            />
          </svg>
          <ol className="mt-6 grid gap-6 sm:grid-cols-4">
            {timeline.map((s) => (
              <li key={s.label} className="font-mono text-base">
                <p className={`font-display text-2xl ${s.live ? "text-signal-bright" : "text-signal"}`}>
                  {s.label}{s.live && <span className="ml-2 inline-block h-2 w-2 animate-pulse bg-signal-bright align-middle" aria-label="current stage" />}
                </p>
                <p className={ink}>{s.date}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="vendors" aria-labelledby="vendors-h" className={`${gap} grid gap-10 lg:grid-cols-12`}>
          <h2 id="vendors-h" className={`${h2} lg:col-span-5`}>Vendors</h2>
          <table className="w-full border-collapse font-mono text-base lg:col-span-7">
            <thead>
              <tr className="border-b border-signal text-left">
                <th scope="col" className="py-3 font-normal">Region</th>
                <th scope="col" className="py-3 text-right font-normal">Vendor</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v.region} className="border-b border-cap-edge">
                  <td className={`py-4 ${ink}`}>{v.region}</td>
                  <td className={`py-4 text-right ${ink}`}>{v.url ? <a href={v.url} className="underline">{v.vendor}</a> : v.vendor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section id="faq" aria-labelledby="faq-h" className={`${gap} mx-auto max-w-3xl`}>
          <h2 id="faq-h" className={h2}>Questions</h2>
          <div className="mt-10 border-t border-cap-edge">
            {faq.map((f) => (
              <details key={f.q} className="group border-b border-cap-edge">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-display text-xl text-signal-bright [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span aria-hidden className="font-mono transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className={`pb-6 font-mono text-base leading-relaxed ${ink}`}>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
