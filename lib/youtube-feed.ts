import { cleanTitle } from "./shorts.ts";

/** One upload from a channel's public RSS feed. Plain data, safe anywhere. */
export type YtVideo = { id: string; title: string; published: string; short: boolean };

const decode = (s: string) =>
  s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

/** Parse YouTube's feeds/videos.xml. The feed links Shorts as /shorts/. */
export function parseFeed(xml: string): YtVideo[] {
  const out: YtVideo[] = [];
  for (const m of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const e = m[1];
    const id = e.match(/<yt:videoId>([\w-]{11})</)?.[1];
    if (!id) continue;
    const title = cleanTitle(decode(e.match(/<title>([^<]*)</)?.[1] ?? "")) || "Samantroy Academy video";
    out.push({ id, title, published: e.match(/<published>([^<]*)</)?.[1] ?? "", short: /<link rel="alternate" href="[^"]*\/shorts\//.test(e) });
  }
  return out;
}

/** What a section shows: the feed minus hidden videos, capped. */
export function pickVideos(feed: YtVideo[], hidden: string[] = [], limit = 12, kind: "all" | "short" | "video" = "all"): YtVideo[] {
  const skip = new Set(hidden);
  return feed.filter((v) => !skip.has(v.id) && (kind === "all" || (kind === "short") === v.short)).slice(0, limit);
}
