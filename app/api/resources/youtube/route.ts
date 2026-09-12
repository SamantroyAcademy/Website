import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { getCurrentAdmin } from "@/lib/auth";

export const runtime = "nodejs";

function videoId(url: string): string | null {
  const m =
    url.match(/[?&]v=([\w-]{11})/) ||
    url.match(/youtu\.be\/([\w-]{11})/) ||
    url.match(/\/embed\/([\w-]{11})/) ||
    url.match(/\/shorts\/([\w-]{11})/);
  return m ? m[1] : null;
}

/** Given a YouTube URL, return its title + thumbnail (via public oEmbed).
 *  Admins only: it makes outbound requests, so it must not be an open proxy. */
export async function POST(req: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  const rl = rateLimit(`yt:${admin.id}`, { limit: 30, windowMs: 60_000 });
  if (!rl.ok) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  let body: { url?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const url = (body.url ?? "").trim();
  const id = videoId(url);
  if (!id) return NextResponse.json({ error: "Enter a valid YouTube link." }, { status: 400 });

  const watch = `https://www.youtube.com/watch?v=${id}`;
  const thumbnail = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  let title = "YouTube video";
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(watch)}&format=json`, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (res.ok) {
      const data = (await res.json()) as { title?: string; thumbnail_url?: string };
      if (data.title) title = data.title;
    }
  } catch {
    /* fall back to defaults */
  }
  return NextResponse.json({ ok: true, title, thumbnail, url: watch, videoId: id });
}
