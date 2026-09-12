import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { cleanTitle } from "@/lib/shorts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Found = { id: string; title: string; kind: "short" | "video"; published?: string };

const UA = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36", "Accept-Language": "en" };
const get = (url: string) => fetch(url, { headers: UA, signal: AbortSignal.timeout(12_000), cache: "no-store" });

/** Channel base URL from a pasted link: /@handle or /channel/UC... only. */
function channelBase(raw: string): string | null {
  try {
    const u = new URL(raw.trim());
    if (!/(^|\.)youtube\.com$/.test(u.hostname)) return null;
    const m = u.pathname.match(/^\/(@[\w.-]{2,60}|channel\/UC[\w-]{22})/);
    return m ? `https://www.youtube.com/${m[1]}` : null;
  } catch {
    return null;
  }
}

async function oembedTitle(id: string): Promise<string> {
  try {
    const r = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/shorts/${id}`)}&format=json`, { signal: AbortSignal.timeout(8_000) });
    if (!r.ok) return "";
    return ((await r.json()) as { title?: string }).title ?? "";
  } catch {
    return "";
  }
}

/** Lists a channel's Shorts (from its Shorts tab) and newest uploads (from
 *  its public RSS feed), with titles, for the admin to pick from. No API key:
 *  if YouTube changes its page, the admin can still paste links one by one. */
export async function GET(req: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  const rl = rateLimit(`ytchan:${admin.id}`, { limit: 10, windowMs: 60_000 });
  if (!rl.ok) return NextResponse.json({ error: "Too many requests. Wait a minute." }, { status: 429 });

  const base = channelBase(new URL(req.url).searchParams.get("url") ?? "");
  if (!base) return NextResponse.json({ error: "Paste a channel link like https://www.youtube.com/@channelname" }, { status: 400 });

  let page = "";
  try {
    const r = await get(`${base}/shorts`);
    if (r.ok) page = await r.text();
  } catch { /* handled below */ }
  const channelId = page.match(/"externalId":"(UC[\w-]{22})"/)?.[1] ?? base.match(/channel\/(UC[\w-]{22})/)?.[1];
  if (!channelId) return NextResponse.json({ error: "Could not read that channel. Check the link, or add videos one by one." }, { status: 502 });

  const shortIds = [...new Set([...page.matchAll(/"reelWatchEndpoint":\{"videoId":"([\w-]{11})"/g)].map((m) => m[1]))].slice(0, 30);

  const recent: Found[] = [];
  try {
    const r = await get(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
    if (r.ok) {
      const xml = await r.text();
      for (const m of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
        const id = m[1].match(/<yt:videoId>([\w-]{11})</)?.[1];
        const title = m[1].match(/<title>([^<]*)</)?.[1] ?? "";
        const published = m[1].match(/<published>([^<]*)</)?.[1];
        if (id) recent.push({ id, title: cleanTitle(decode(title)), kind: shortIds.includes(id) ? "short" : "video", published });
      }
    }
  } catch { /* feed is optional */ }

  const known = new Set(recent.map((r) => r.id));
  const missing = shortIds.filter((id) => !known.has(id));
  const titles = await Promise.all(missing.map(oembedTitle));
  const shorts: Found[] = missing.map((id, i) => ({ id, title: cleanTitle(titles[i]) || "YouTube Short", kind: "short" }));

  return NextResponse.json({ channelId, items: [...recent, ...shorts] });
}

const decode = (s: string) =>
  s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
