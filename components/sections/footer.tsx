import Link from "next/link";
import { NuSignalWord } from "@/components/brand/nusignal-logo";
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
    <footer id="footer" className="flex min-h-svh snap-start snap-always flex-col justify-between gap-16 overflow-hidden bg-void px-4 pt-16 text-signal-bright sm:px-6 lg:px-24">
      <div className="wrap mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-6 font-mono text-base">
        <p className="font-display text-lg text-[#cfe0ff]">{FOOTER.designer}</p>
        <ul className="flex gap-5">
          {FOOTER.socials.map(({ label, href, Icon }) => (
            <li key={label}>
              <a href={href} aria-label={label} target="_blank" rel="noopener noreferrer" className="-m-3 block p-3 hover:text-[#cfe0ff] focus-visible:outline-2 focus-visible:outline-signal-bright">
                <Icon aria-hidden className="h-5 w-5" strokeWidth={1.5} />
              </a>
            </li>
          ))}
        </ul>
      </div>
      <NuSignalWord className="wrap mx-auto w-full max-w-[1440px] text-signal" />
      <div className="wrap mx-auto flex w-full max-w-[1440px] justify-between py-6 font-mono text-sm">
        <span>
          © nuSignal · <Link href="/privacy/" className="-my-3 inline-block py-3 underline underline-offset-4 hover:text-[#cfe0ff] focus-visible:outline-2 focus-visible:outline-signal-bright">Privacy</Link>
        </span>
        <span className="flex items-center gap-2">
          Transmission end<span aria-hidden className="animate-pulse">_</span>
        </span>
      </div>
    </footer>
  );
}
