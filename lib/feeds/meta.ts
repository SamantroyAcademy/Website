import "server-only";
import { unstable_cache } from "next/cache";
import { CMS_TAG } from "@/lib/content";
import { FEEDS_TAG, readIntegrations } from "@/lib/integrations";

/**
 * Latest Instagram and Facebook videos through Meta's official Graph API.
 * Instagram and Facebook do not allow reading a profile any other way, so
 * each needs an access token pasted under Admin, Connections. Without one
 * the homepage simply keeps its follow cards.
 */

export type SocialPost = { id: string; url: string; image: string; caption: string; video: boolean; date: string };
type Result = { ok: true; items: SocialPost[] } | { ok: false; error: string };

const V = "v22.0";

async function get(url: string): Promise<Record<string, unknown>> {
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000), cache: "no-store" });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown> & { error?: { message?: string } };
  if (!res.ok || json.error) throw new Error(json.error?.message || `Meta answered ${res.status}.`);
  return json;
}

const clip = (s: unknown, n = 140) => (typeof s === "string" ? s.replace(/\s+/g, " ").trim().slice(0, n) : "");

/** Videos (Reels) first choice; when there are none, the latest posts. */
const preferVideos = (all: SocialPost[], limit: number) => {
  const videos = all.filter((p) => p.video);
  return (videos.length ? videos : all).slice(0, limit);
};

/* ── Instagram (Instagram API with Instagram Login) ─────────────────────── */

type IgMedia = { id: string; caption?: string; media_type?: string; media_url?: string; thumbnail_url?: string; permalink?: string; timestamp?: string };

export async function fetchInstagram(token: string, limit = 8): Promise<Result> {
  if (!token) return { ok: false, error: "No Instagram token yet." };
  try {
    const json = await get(`https://graph.instagram.com/${V}/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=30&access_token=${encodeURIComponent(token)}`);
    const all = ((json.data as IgMedia[]) ?? [])
      .map((m) => ({
        id: m.id,
        url: m.permalink ?? "",
        image: (m.media_type === "VIDEO" ? m.thumbnail_url : m.media_url) ?? "",
        caption: clip(m.caption),
        video: m.media_type === "VIDEO",
        date: m.timestamp ?? "",
      }))
      .filter((p) => p.url && p.image);
    return { ok: true, items: preferVideos(all, limit) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not reach Instagram." };
  }
}

/** Long-lived Instagram tokens last 60 days; each refresh gives 60 more. */
export async function refreshInstagramToken(token: string): Promise<{ ok: true; token: string } | { ok: false; error: string }> {
  try {
    const json = await get(`https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(token)}`);
    return typeof json.access_token === "string" ? { ok: true, token: json.access_token } : { ok: false, error: "No token in Instagram's answer." };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not refresh the Instagram token." };
  }
}

/* ── Facebook Page ──────────────────────────────────────────────────────── */

type FbVideo = { id: string; description?: string; title?: string; permalink_url?: string; created_time?: string; picture?: string; thumbnails?: { data?: { uri?: string; is_preferred?: boolean; width?: number }[] } };
type FbPost = { id: string; message?: string; full_picture?: string; permalink_url?: string; created_time?: string; attachments?: { data?: { media_type?: string }[] } };

const fbUrl = (u?: string) => (!u ? "" : u.startsWith("http") ? u : `https://www.facebook.com${u.startsWith("/") ? "" : "/"}${u}`);

export async function fetchFacebook(pageId: string, token: string, limit = 8): Promise<Result> {
  if (!pageId || !token) return { ok: false, error: "No Facebook Page ID or token yet." };
  const t = encodeURIComponent(token);
  try {
    const vids = await get(`https://graph.facebook.com/${V}/${encodeURIComponent(pageId)}/videos?fields=id,title,description,permalink_url,created_time,picture,thumbnails{uri,is_preferred,width}&limit=${limit}&access_token=${t}`);
    const videos: SocialPost[] = ((vids.data as FbVideo[]) ?? []).map((v) => {
      const thumbs = v.thumbnails?.data ?? [];
      const best = thumbs.find((x) => x.is_preferred) ?? [...thumbs].sort((a, b) => (b.width ?? 0) - (a.width ?? 0))[0];
      return { id: v.id, url: fbUrl(v.permalink_url), image: best?.uri ?? v.picture ?? "", caption: clip(v.title || v.description), video: true, date: v.created_time ?? "" };
    }).filter((p) => p.url && p.image);
    if (videos.length) return { ok: true, items: videos.slice(0, limit) };

    const posts = await get(`https://graph.facebook.com/${V}/${encodeURIComponent(pageId)}/posts?fields=id,message,full_picture,permalink_url,created_time,attachments{media_type}&limit=20&access_token=${t}`);
    const all: SocialPost[] = ((posts.data as FbPost[]) ?? []).map((p) => ({
      id: p.id,
      url: fbUrl(p.permalink_url),
      image: p.full_picture ?? "",
      caption: clip(p.message),
      video: (p.attachments?.data ?? []).some((a) => /video/i.test(a.media_type ?? "")),
      date: p.created_time ?? "",
    })).filter((p) => p.url && p.image);
    return { ok: true, items: preferVideos(all, limit) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not reach Facebook." };
  }
}

/* ── Cached for page renders: at most one call an hour per network ──────── */

export const getInstagramFeed = unstable_cache(async (): Promise<SocialPost[]> => {
  const { instagramToken } = await readIntegrations();
  const r = await fetchInstagram(instagramToken);
  return r.ok ? r.items : [];
}, ["ig-feed"], { revalidate: 3600, tags: [CMS_TAG, FEEDS_TAG] });

export const getFacebookFeed = unstable_cache(async (): Promise<SocialPost[]> => {
  const { facebookPageId, facebookToken } = await readIntegrations();
  const r = await fetchFacebook(facebookPageId, facebookToken);
  return r.ok ? r.items : [];
}, ["fb-feed"], { revalidate: 3600, tags: [CMS_TAG, FEEDS_TAG] });
