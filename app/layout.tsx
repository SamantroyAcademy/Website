import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { LOCATION } from "@/lib/data";
import { ogImages } from "@/lib/seo";

/* Self-hosted type from Fontshare (Indian Type Foundry, free commercial
   licence). No Google Fonts request is ever made. Only the weights the
   design uses ship (7 files); each one is a request for every new visitor. */
const cabinet = localFont({
  src: [
    { path: "./fonts/cabinet-grotesk-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/cabinet-grotesk-800.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-cabinet",
  display: "swap",
});

const switzer = localFont({
  src: [
    { path: "./fonts/switzer-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/switzer-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/switzer-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/switzer-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-switzer",
  display: "swap",
});

const stencil = localFont({
  src: [
    { path: "./fonts/bespoke-stencil-800.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-bespoke-stencil",
  display: "swap",
  // Numerals far down the page: load on use, not up front.
  preload: false,
});

const SITE_URL = "https://www.samantroyacademy.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "Samantroy Academy",
  title: {
    default: "Samantroy Academy, Berhampur | Defence, Police, Bank and SSC Coaching",
    template: "%s | Samantroy Academy",
  },
  description:
    "Defence coaching in Brahmapur (Berhampur), Ganjam since 2001, with 4000+ recruitments. Army, Navy, Air Force, BSF, CRPF, CISF, Odisha Police, OSSC, OPSC, Bank, Railway, SSC, NDA and CDS.",
  keywords: [
    "Samantroy Academy", "Samantroy Academy Berhampur", "Samantroy Academy Brahmapur", "defence coaching in Berhampur",
    "defence academy Brahmapur", "defence coaching Ganjam", "Agniveer coaching Berhampur", "Army GD coaching Odisha",
    "Navy SSR MR coaching Berhampur", "Air Force X Y group coaching Odisha", "SSC GD coaching Berhampur",
    "BSF CRPF CISF SSB coaching Odisha", "Odisha Police constable coaching Berhampur", "Odisha Police SI coaching",
    "OSSC OSSSC coaching Berhampur", "OPSC ASO coaching Odisha", "bank PO clerk coaching Berhampur",
    "railway exam coaching Berhampur", "SSC CGL coaching Berhampur", "NDA coaching Berhampur", "CDS AFCAT coaching Odisha",
  ],
  authors: [{ name: "Samantroy Academy" }],
  creator: "Samantroy Academy",
  publisher: "Samantroy Academy",
  category: "education",
  formatDetection: { telephone: true, address: true, email: false },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "Samantroy Academy",
    title: "Samantroy Academy, Berhampur | Shaping Nation's Warriors since 2001",
    description: "4000+ recruitments since 2001. Coaching in Brahmapur, Ganjam for Army, Navy, Air Force, CAPF, Odisha Police, OSSC, OPSC, Bank, Railway and SSC.",
    images: ogImages(),
  },
  twitter: {
    card: "summary_large_image",
    title: "Samantroy Academy, Berhampur",
    description: "Defence, police, bank and SSC coaching in Brahmapur, Ganjam since 2001. 4000+ recruitments.",
    images: ogImages().map((i) => i.url),
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  // Local search: where the academy is (see LOCATION in lib/data.ts).
  other: {
    "geo.region": LOCATION.regionCode,
    "geo.placename": `${LOCATION.locality} (${LOCATION.altLocality}), ${LOCATION.district}, ${LOCATION.region}`,
    "geo.position": `${LOCATION.lat};${LOCATION.lng}`,
    ICBM: `${LOCATION.lat}, ${LOCATION.lng}`,
  },
};

export const viewport: Viewport = {
  themeColor: "#f4f4f1",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${cabinet.variable} ${switzer.variable} ${stencil.variable}`}>
      <head>
        {/* Mark motion as available before first paint (no flash of revealed
            content). If the app never boots, the fail-safe un-hides everything. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var d=document.documentElement,r=matchMedia(\"(prefers-reduced-motion: reduce)\").matches,s=null;try{s=sessionStorage.getItem(\"sa-intro\")}catch(e){}if(r||s)d.classList.add(\"sa-intro-done\");if(!r){d.classList.add(\"js-motion\");setTimeout(function(){if(!window.__saMotion)d.classList.remove(\"js-motion\")},4000)}}catch(e){}})();",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
