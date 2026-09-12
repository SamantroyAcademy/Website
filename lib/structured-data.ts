import { COURSES, LOCATION, SITE } from "@/lib/data";
import { EXAMS } from "@/lib/exams";
import { mediaUrl } from "@/lib/supabase/media";

type Settings = typeof SITE;

/** Share image and logo, served from R2 (see scripts/generate-og-image.mjs). */
export const OG_IMAGE = "images/brand/og-v1.png";
export const LOGO_IMAGE = "images/brand/logo-1200.png";

/** Districts the academy's selected candidates come from (result posters). */
const AREAS = ["Ganjam", "Gajapati", "Kandhamal", "Khordha", "Puri", "Cuttack", "Nayagarh", "Dhenkanal", "Rayagada", "Kalahandi"];

const onlyUrls = (list: (string | undefined)[]) => list.filter((u): u is string => /^https?:\/\/[^/]+\/.+/.test(u ?? ""));
const digits = (p: string) => (p || "").replace(/[^\d+]/g, "");

/** Site-wide JSON-LD graph: the academy as a local educational business,
 *  its website, and what it teaches. Every contact value comes from the CMS. */
export function siteJsonLd(s: Settings, mapUrl: string) {
  const org = `${s.url}/#organization`;
  const phones = [s.phone1, s.phone2].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["EducationalOrganization", "LocalBusiness"],
        "@id": org,
        name: s.name,
        legalName: s.legalName || undefined,
        alternateName: ["Samantroy Academy Brahmapur", "Samantroy Academy Berhampur", "SA Berhampur", "Samantroy Academy for Defence Career Studies"],
        url: s.url,
        logo: mediaUrl(LOGO_IMAGE),
        image: mediaUrl(OG_IMAGE),
        slogan: s.tagline,
        foundingDate: s.foundedYear || "2001",
        description:
          "Defence and government job coaching in Brahmapur (Berhampur), Ganjam, Odisha since 2001, with 4000+ recruitments. Army, Navy, Air Force, BSF, CRPF, CISF, SSB, Odisha Police, SI, OSSC, OSSSC, OPSC, ASO, Bank, Railway and SSC, plus NDA, CDS and AFCAT.",
        telephone: digits(s.phone1),
        ...(s.email ? { email: s.email } : {}),
        address: {
          "@type": "PostalAddress",
          streetAddress: LOCATION.streetAddress,
          addressLocality: LOCATION.locality,
          addressRegion: LOCATION.region,
          postalCode: LOCATION.postalCode,
          addressCountry: LOCATION.country,
        },
        geo: { "@type": "GeoCoordinates", latitude: LOCATION.lat, longitude: LOCATION.lng },
        hasMap: mapUrl,
        areaServed: [
          { "@type": "City", name: "Brahmapur" },
          ...AREAS.map((name) => ({ "@type": "AdministrativeArea", name: `${name} district, Odisha` })),
          { "@type": "State", name: "Odisha" },
        ],
        contactPoint: phones.map((p) => ({
          "@type": "ContactPoint",
          telephone: digits(p),
          contactType: "admissions",
          ...(s.contactName ? { name: s.contactName } : {}),
          areaServed: "IN",
          availableLanguage: ["en", "or", "hi"],
        })),
        knowsAbout: EXAMS.map((e) => e.name),
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Coaching batches",
          itemListElement: COURSES.map((c) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Course",
              name: c.title,
              description: c.desc,
              provider: { "@id": org },
            },
          })),
        },
        sameAs: onlyUrls([s.instagram, s.youtube, s.telegram, s.facebook]),
      },
      {
        "@type": "WebSite",
        "@id": `${s.url}/#website`,
        url: s.url,
        name: s.name,
        inLanguage: "en-IN",
        publisher: { "@id": org },
      },
    ],
  };
}

/** JSON for a <script type="application/ld+json">, safe inside HTML. */
export const ldJson = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");
