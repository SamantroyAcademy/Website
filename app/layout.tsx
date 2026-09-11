import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

/* Self-hosted type from Fontshare (Indian Type Foundry, free commercial
   licence). No Google Fonts request is ever made. */
const cabinet = localFont({
  src: [
    { path: "./fonts/cabinet-grotesk-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/cabinet-grotesk-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/cabinet-grotesk-800.woff2", weight: "800", style: "normal" },
    { path: "./fonts/cabinet-grotesk-900.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-cabinet",
  display: "swap",
});

const switzer = localFont({
  src: [
    { path: "./fonts/switzer-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/switzer-400i.woff2", weight: "400", style: "italic" },
    { path: "./fonts/switzer-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/switzer-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/switzer-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-switzer",
  display: "swap",
});

const stencil = localFont({
  src: [
    { path: "./fonts/bespoke-stencil-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/bespoke-stencil-800.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-bespoke-stencil",
  display: "swap",
});

const SITE_URL = "https://www.samantroyacademy.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Samantroy Academy | Defence and Government Job Coaching in Odisha",
    template: "%s | Samantroy Academy",
  },
  description:
    "Samantroy Academy, Odisha: coaching for Army Agniveer, Navy SSR and MR, Air Force X and Y, SSC GD, Odisha Police, Railways and SSC. Written exam, physical test and medical, trained together.",
  keywords: [
    "Agniveer coaching Odisha", "defence coaching Odisha", "SSC GD coaching Bhubaneswar",
    "Odisha Police constable coaching", "Navy SSR MR coaching", "Air Force X Y group coaching",
    "RRB Group D coaching", "physical training academy Odisha", "Samantroy Academy",
  ],
  authors: [{ name: "Samantroy Academy" }],
  creator: "Samantroy Academy",
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "Samantroy Academy",
    title: "Samantroy Academy | Defence and Government Job Coaching",
    description: "Written exam, physical test and medical, trained together. Agniveer, SSC GD, Odisha Police, Railways.",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Samantroy Academy" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Samantroy Academy",
    description: "Defence and government job coaching in Odisha.",
    images: ["/og.jpg"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
};

export const viewport: Viewport = {
  themeColor: "#f3f4f0",
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
