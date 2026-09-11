import type { Metadata } from "next";
import { getPublished } from "@/lib/content";
import { getSeoPage } from "@/lib/seo-pages";

/** Build a page's Metadata from the CMS (`seo.<key>` doc), falling back to defaults. */
export async function pageMetadata(key: string): Promise<Metadata> {
  const def = getSeoPage(key);
  if (!def) return {};
  const seo = await getPublished(`seo.${key}`, { title: def.title, description: def.description });
  return {
    title: def.absolute ? { absolute: seo.title } : seo.title,
    description: seo.description,
    openGraph: { title: seo.title, description: seo.description },
    twitter: { title: seo.title, description: seo.description },
  };
}
