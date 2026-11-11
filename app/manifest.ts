import type { MetadataRoute } from "next";

// static export needs this to emit manifest.webmanifest at build time
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GMK nuSignal",
    short_name: "nuSignal",
    description: "A black and blue GMK keycap set built around signals and tech.",
    start_url: "/",
    display: "standalone",
    background_color: "#050608",
    theme_color: "#050608",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
