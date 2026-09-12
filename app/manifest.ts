import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Samantroy Academy, Brahmapur",
    short_name: "Samantroy",
    description: "Defence, police, bank and SSC coaching in Brahmapur (Berhampur), Ganjam, Odisha since 2001.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f4f1",
    theme_color: "#ce0608",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
