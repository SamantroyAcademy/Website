import type { NextConfig } from "next";

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
      "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://www.google.com https://maps.google.com https://*.supabase.co https://www.instagram.com https://instagram.com",
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
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "**.supabase.co" },
      // Google reviewer profile photos (Places API)
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "maps.googleapis.com" },
    ],
    // Supabase Storage serves objects with `Cache-Control: no-cache`, so without
    // a floor Vercel would re-fetch the original from Supabase constantly and
    // burn egress. Hold optimised images for 31 days instead.
    minimumCacheTTL: 2_678_400,
    formats: ["image/avif", "image/webp"],
    // Trim the generated variants — fewer sizes = fewer origin fetches.
    deviceSizes: [640, 828, 1080, 1200, 1920],
    imageSizes: [96, 200, 384],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
