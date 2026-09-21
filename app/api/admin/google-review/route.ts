import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { readIntegrations } from "@/lib/integrations";
import { fetchGoogleReviews } from "@/lib/feeds/google";
import { fetchReviewFromLink } from "@/lib/feeds/google-review-link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * Admin, Google Reviews.
 *  - { url }: one review from its share link (no key needed).
 *  - {}: the latest reviews through the Places API (New), with the key saved
 *    under Admin, Connections. Google returns up to 5.
 * Also callable with the cron secret, to check it from a deployment.
 */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  const byCron = Boolean(secret) && req.headers.get("authorization") === `Bearer ${secret}`;
  const admin = byCron ? null : await getCurrentAdmin();
  if (!byCron && !admin) return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  const rl = rateLimit(`greview:${admin?.id ?? "cron"}`, { limit: 20, windowMs: 60_000 });
  if (!rl.ok) return NextResponse.json({ error: "Too many requests. Wait a minute." }, { status: 429 });

  const body = (await req.json().catch(() => ({}))) as { url?: unknown };
  if (typeof body.url === "string" && body.url.trim()) {
    const r = await fetchReviewFromLink(body.url.slice(0, 2000));
    return NextResponse.json(r.ok ? { ok: true, review: r.review } : { ok: false, error: r.error });
  }

  const { googleKey, googlePlaceId } = await readIntegrations();
  if (!googleKey) {
    return NextResponse.json({
      ok: false,
      needsKey: true,
      error: "Importing the latest reviews in one go needs a Google API key (Admin, Connections). Pasting a review's link works without one.",
    });
  }
  const result = await fetchGoogleReviews(googleKey, googlePlaceId);
  if (!result.ok) return NextResponse.json({ ok: false, error: `Google: ${result.error}` });
  return NextResponse.json({
    ok: true,
    count: result.items.length,
    rating: result.rating,
    total: result.total,
    placeUrl: result.placeUrl,
    items: result.items,
  });
}
