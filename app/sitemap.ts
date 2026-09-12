import type { MetadataRoute } from "next";
import { getExams, getPosts } from "@/lib/public-data";
import { SITE } from "@/lib/data";

export const revalidate = 3600;

const ROUTES = [
  "", "/about", "/recruitment-process", "/exams", "/standards", "/training-centres", "/courses",
  "/eligibility", "/mock-tests", "/resources", "/gallery", "/selected", "/blog", "/testimonials", "/contact",
];

/** Static pages plus every published exam and article, so new CMS content is
 *  discoverable without a code change. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url;
  const [exams, posts] = await Promise.all([getExams(), getPosts()]);
  const now = new Date();
  return [
    ...ROUTES.map((r) => ({ url: `${base}${r}`, lastModified: now, changeFrequency: "weekly" as const, priority: r === "" ? 1 : 0.8 })),
    ...exams.map((e) => ({ url: `${base}/exams/${e.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...posts.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: p.published_at ? new Date(p.published_at) : now, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
