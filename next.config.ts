import type { NextConfig } from "next";

// Public origin of the R2 bucket, allowed to be framed for PDF previews.
const R2_ORIGIN = (() => {
  try { return new URL(process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://pub-9a00cb9b6e284249a3a4c2795c99118c.r2.dev").origin; } catch { return ""; }
})();

const securityHeaders = [
  // Clickjacking protection. SAMEORIGIN (not DENY) so the admin CMS can frame
  // the site's own pages in its live-preview iframe; external sites still can't.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Block MIME-type sniffing.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Don't leak full URLs to third parties.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Lock down powerful browser features by default.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Force HTTPS once served over TLS (Vercel).
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Baseline CSP: no framing, no plugins, no <base> hijack, forms to self only.
  // 'unsafe-inline' stays for Next.js' inline hydration bootstrap, but eval is
  // disallowed and inline event-handler attributes are blocked outright.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "img-src 'self' data: blob: https:",
      "media-src 'self' https:",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      // React dev tooling needs eval; production never gets it.
      `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
      "script-src-attr 'none'",
      "connect-src 'self' https:",
      `frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://www.google.com https://maps.google.com https://*.supabase.co https://www.instagram.com https://instagram.com${R2_ORIGIN ? ` ${R2_ORIGIN}` : ""}`,
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      // 'self' (not 'none') so the admin live-preview iframe can frame our own
      // pages; other origins still cannot embed the site.
      "frame-ancestors 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  images: {
    // Images load straight from Cloudflare R2 (and YouTube / Google for
    // thumbnails and avatars). Vercel's optimiser would proxy every image
    // through Vercel and spend its bandwidth, so it is switched off. Uploads
    // are already cropped and compressed to WebP in the admin, and the bundled
    // photos are pre-compressed (scripts/prepare-bundled-images.mjs).
    unoptimized: true,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
