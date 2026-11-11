import { AtSign, Camera, Code2, MessageCircle } from "lucide-react";

// TODO: real designer credit and social URLs. lucide dropped brand logos, hence generic glyphs.
const FOOTER = {
  designer: "Designed by TBA",
  socials: [
    { label: "Discord", href: "#", Icon: MessageCircle },
    { label: "Instagram", href: "#", Icon: Camera },
    { label: "X", href: "#", Icon: AtSign },
    { label: "GitHub", href: "#", Icon: Code2 },
  ],
};

export default function Footer() {
  return (
    <footer id="footer" className="overflow-hidden border-t border-cap-edge bg-void px-4 pt-16 text-signal sm:px-8 lg:px-16">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-6 font-mono text-base">
        <p className="text-[#cfe0ff]">{FOOTER.designer}</p>
        <ul className="flex gap-5">
          {FOOTER.socials.map(({ label, href, Icon }) => (
            <li key={label}>
              <a href={href} aria-label={label} className="block hover:text-signal-bright">
                <Icon aria-hidden className="h-5 w-5" strokeWidth={1.5} />
              </a>
            </li>
          ))}
        </ul>
      </div>
      <p aria-hidden className="mx-auto mt-10 max-w-[1440px] whitespace-nowrap font-display text-[20vw] leading-[0.8] tracking-tight text-signal lg:text-[min(20vw,19rem)]">
        nuSIGNAL
      </p>
      <div className="mx-auto flex max-w-[1440px] justify-between border-t border-cap-edge py-5 font-mono text-sm">
        <span>© nuSignal</span>
        <span className="flex items-center gap-2">
          Transmission end<span aria-hidden className="animate-pulse">_</span>
        </span>
      </div>
    </footer>
  );
}
