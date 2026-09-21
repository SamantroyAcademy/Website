import "server-only";
import { unstable_cache } from "next/cache";
import { CMS_TAG } from "@/lib/content";
import { FEEDS_TAG } from "@/lib/integrations";
import { parseFeed, type YtVideo } from "@/lib/youtube-feed";

/**
 * A channel's latest uploads from YouTube's public RSS feed: no API key, no
 * quota. The feed lists the 15 newest uploads and marks Shorts by linking
 * them as /shorts/. Cached for an hour (and refreshed on any publish), so a
 * page view never waits on YouTube.
 */

export type { YtVideo };

/** Channels the site already knows, so no page lookup is needed. */
const KNOWN: Record<string, string> = {
  "@prasantanayakmotivation1873": "UChvbqL4xtuGyhZdd7iEXLgA",
  "@samantroyacademy5722": "UCa_w49ADzZ4YOFwbXSG7ZRg",
};

const UA = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36", "Accept-Language": "en" };

/** Channel id (UC…) from a /channel/UC… link or an @handle link. */
export async function channelIdOf(url: string): Promise<string | null> {
  let u: URL;
  try { u = new URL(url.trim()); } catch { return null; }
  if (!/(^|\.)youtube\.com$/.test(u.hostname)) return null;
  const direct = u.pathname.match(/^\/channel\/(UC[\w-]{22})/)?.[1];
  if (direct) return direct;
  const handle = u.pathname.match(/^\/(@[\w.-]{2,60})/)?.[1]?.toLowerCase();
  if (!handle) return null;
  if (KNOWN[handle]) return KNOWN[handle];
  try {
    const res = await fetch(`https://www.youtube.com/${handle}`, { headers: UA, signal: AbortSignal.timeout(12_000), next: { revalidate: 86_400 } });
    return (await res.text()).match(/"externalId":"(UC[\w-]{22})"/)?.[1] ?? null;
  } catch {
    return null;
  }
}

async function readFeed(channelUrl: string): Promise<YtVideo[]> {
  const id = await channelIdOf(channelUrl);
  if (!id) return [];
  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${id}`, { signal: AbortSignal.timeout(12_000), cache: "no-store" });
    return res.ok ? parseFeed(await res.text()) : [];
  } catch {
    return [];
  }
}

/** Newest uploads first, cached per channel. */
export const latestVideos = unstable_cache(readFeed, ["yt-feed"], { revalidate: 3600, tags: [CMS_TAG, FEEDS_TAG] });
