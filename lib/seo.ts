import type { Metadata } from "next";
import { getPublished } from "@/lib/content";
import { getSeoPage } from "@/lib/seo-pages";
import { mediaUrl } from "@/lib/supabase/media";
import { OG_IMAGE } from "@/lib/structured-data";

/** The share card, served from R2. Pages that set their own openGraph must
 *  repeat it: Next replaces a nested openGraph object, it does not merge. */
export const ogImages = () => [{ url: mediaUrl(OG_IMAGE), width: 1200, height: 630, alt: "Samantroy Academy, Brahmapur: Shaping Nation's Warriors" }];

/** Open Graph + Twitter + canonical for one page. */
export function shareMeta(title: string, description: string, path: string): Metadata {
  return {
    alternates: { canonical: path },
    openGraph: { type: "website", locale: "en_IN", siteName: "Samantroy Academy", url: path, title, description, images: ogImages() },
    twitter: { card: "summary_large_image", title, description, images: ogImages().map((i) => i.url) },
  };
}

/** Build a page's Metadata from the CMS (`seo.<key>` doc), falling back to defaults. */
export async function pageMetadata(key: string): Promise<Metadata> {
  const def = getSeoPage(key);
  if (!def) return {};
  const seo = await getPublished(`seo.${key}`, { title: def.title, description: def.description });
  return {
    title: def.absolute ? { absolute: seo.title } : seo.title,
    description: seo.description,
    ...shareMeta(seo.title, seo.description, def.path),
  };
}
