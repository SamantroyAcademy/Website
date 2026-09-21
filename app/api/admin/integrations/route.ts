import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getCurrentAdmin } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { hasServiceRole } from "@/lib/supabase/admin";
import { FEEDS_TAG, mask, readIntegrations, saveIntegrations, type Integrations } from "@/lib/integrations";
import { fetchGoogleReviews } from "@/lib/feeds/google";
import { fetchFacebook, fetchInstagram } from "@/lib/feeds/meta";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Service = "google" | "instagram" | "facebook";

/** What the Connections screen may see: which keys are set, never the keys. */
async function status() {
  const i = await readIntegrations();
  return {
    google: { key: mask(i.googleKey), placeId: i.googlePlaceId },
    instagram: { token: mask(i.instagramToken), savedAt: i.instagramTokenAt },
    facebook: { pageId: i.facebookPageId, token: mask(i.facebookToken) },
  };
}

async function test(service: Service): Promise<{ ok: boolean; text: string }> {
  const i = await readIntegrations();
  if (service === "google") {
    const r = await fetchGoogleReviews(i.googleKey, i.googlePlaceId);
    return r.ok
      ? { ok: true, text: `Connected to ${r.placeName}: ${r.rating ?? "?"}★ from ${r.total ?? "?"} reviews, ${r.items.length} readable now.` }
      : { ok: false, text: r.error };
  }
  if (service === "instagram") {
    if (!i.instagramToken) return { ok: false, text: "No Instagram token saved yet." };
    const r = await fetchInstagram(i.instagramToken);
    return r.ok ? { ok: true, text: `Connected: ${r.items.length} recent posts found.` } : { ok: false, text: r.error };
  }
  if (!i.facebookPageId || !i.facebookToken) return { ok: false, text: "Add both the Page ID and the Page token first." };
  const r = await fetchFacebook(i.facebookPageId, i.facebookToken);
  return r.ok ? { ok: true, text: `Connected: ${r.items.length} recent posts found.` } : { ok: false, text: r.error };
}

export async function GET() {
  if (!(await getCurrentAdmin())) return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  return NextResponse.json(await status());
}

/** Body: { action: "save", values: Partial<Integrations> } or
 *  { action: "test", service }. An empty string clears a value. */
export async function POST(req: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  const rl = rateLimit(`integrations:${admin.id}`, { limit: 30, windowMs: 60_000 });
  if (!rl.ok) return NextResponse.json({ error: "Too many requests. Wait a minute." }, { status: 429 });
  if (!hasServiceRole()) return NextResponse.json({ error: "The server is missing its Supabase service key." }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as { action?: string; service?: Service; values?: Record<string, unknown> };

  if (body.action === "test" && body.service && ["google", "instagram", "facebook"].includes(body.service)) {
    return NextResponse.json(await test(body.service));
  }

  if (body.action === "save" && body.values) {
    const allowed: (keyof Integrations)[] = ["googleKey", "googlePlaceId", "instagramToken", "facebookPageId", "facebookToken"];
    const patch: Partial<Integrations> = {};
    for (const k of allowed) {
      const v = body.values[k];
      if (typeof v === "string") patch[k] = v.trim().slice(0, 1000);
    }
    if (patch.instagramToken) patch.instagramTokenAt = new Date().toISOString();
    try {
      await saveIntegrations(patch);
    } catch (e) {
      return NextResponse.json({ error: e instanceof Error ? e.message : "Could not save." }, { status: 500 });
    }
    revalidateTag(FEEDS_TAG, { expire: 0 });
    return NextResponse.json({ ok: true, status: await status() });
  }

  return NextResponse.json({ error: "Unknown request." }, { status: 400 });
}
