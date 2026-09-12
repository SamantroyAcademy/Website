import { getCollection } from "@/lib/content";
import { YT_VIDEOS } from "@/lib/data";
import { asArray } from "@/lib/shape";

export type SiteVideo = { id: string; title: string; url: string };

export { youtubeId } from "@/lib/youtube";
import { youtubeId } from "@/lib/youtube";

type ResourceRow = { kind: string; title: string; url: string | null; sort_order: number };

/**
 * The site's YouTube videos — read from the SAME `resources` rows the admin
 * manages under Resources, so the homepage section and the Resources tab always
 * show the same set. Falls back to the bundled channel picks when empty.
 */
export async function getSiteVideos(limit?: number): Promise<SiteVideo[]> {
  const rows = await getCollection<ResourceRow>("resources", [], {
    columns: "kind, title, url, sort_order",
  });

  const fromCms = asArray<ResourceRow>(rows)
    .filter((r) => r?.kind === "youtube" && r.url)
    .map((r) => {
      const id = youtubeId(r.url as string);
      return id ? { id, title: r.title || "Samantroy Academy video", url: r.url as string } : null;
    })
    .filter((v): v is SiteVideo => Boolean(v));

  const list = fromCms.length
    ? fromCms
    : YT_VIDEOS.map((v) => ({ id: v.id, title: v.title, url: `https://www.youtube.com/watch?v=${v.id}` }));

  return limit ? list.slice(0, limit) : list;
}
