import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Privacy policy" };

// TODO before launch: name the hosting provider and the interest check form provider.
const OWNER = "baucts";
const UPDATED = "11 November 2026";

const h2 = "mt-12 font-display text-2xl text-signal-bright";

export default function Privacy() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 font-display text-base leading-relaxed text-[#cfe0ff] sm:px-6 lg:py-24">
      <Link href="/" className="font-mono text-sm text-signal-bright underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-signal-bright">← GMK nuSignal</Link>
      <h1 className="mt-8 font-display text-[clamp(2.25rem,5.5vw,4rem)] leading-none tracking-tight text-signal-bright">Privacy policy</h1>
      <p className="mt-4 font-mono text-sm">Last updated {UPDATED}</p>

      <h2 className={h2}>What this site collects</h2>
      <p className="mt-3">
        Nothing. This site is a static page. It sets no cookies, runs no analytics or advertising scripts, has no accounts
        and stores nothing in your browser. Fonts and images are served from this site, not from third parties.
      </p>

      <h2 className={h2}>Hosting logs</h2>
      <p className="mt-3">
        Like any website, the hosting provider that serves these pages receives your IP address, browser type and the
        pages you request, and may keep them in short-lived server logs for security and reliability. We do not use
        those logs to identify or track visitors.
      </p>

      <h2 className={h2}>Interest check and external links</h2>
      <p className="mt-3">
        The interest check form, vendor shops and social links open on other services. Anything you submit there, such
        as an email address or survey answers, is handled under that service&apos;s own privacy policy. We use interest
        check answers only to plan the set and the group buy.
      </p>

      <h2 className={h2}>Your rights</h2>
      <p className="mt-3">
        Depending on where you live (for example under the GDPR), you can ask what personal data is held about you and
        ask for it to be corrected or deleted. Since this site holds none, such requests will usually concern the
        interest check form.
      </p>

      <h2 className={h2}>Contact</h2>
      <p className="mt-3">This site is run by {OWNER}. For questions about this policy or anything else, message {OWNER} on Discord.</p>

      <h2 className={h2}>Changes</h2>
      <p className="mt-3">If this policy changes, the new version and its date will be posted on this page.</p>
    </main>
  );
}
