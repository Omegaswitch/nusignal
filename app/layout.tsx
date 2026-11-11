import type { Metadata, Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

const description = "GMK nuSignal: a black and blue doubleshot keycap set built around signals and tech. Interest check open.";

export const metadata: Metadata = {
  // TODO: set NEXT_PUBLIC_SITE_URL to the real domain so OG image URLs resolve
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://nusignal.example"),
  title: { default: "GMK nuSignal", template: "%s · GMK nuSignal" },
  description,
  openGraph: {
    siteName: "GMK nuSignal",
    title: "GMK nuSignal",
    description,
    type: "website",
    url: "/",
  },
  twitter: { card: "summary_large_image", title: "GMK nuSignal", description },
};

export const viewport: Viewport = { themeColor: "#050608" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
