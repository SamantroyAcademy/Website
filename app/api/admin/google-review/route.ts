import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { readIntegrations } from "@/lib/integrations";
import { fetchGoogleReviews } from "@/lib/feeds/google";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * "Import latest reviews from Google" in Admin, Google Reviews.
 *
 * Google does not let websites read a review from its share link (the page
 * is built by JavaScript and scraping is blocked), so the import goes through
 * the official Places API (New) with the key saved under Admin, Connections.
 * Returns up to 5 recent reviews; the admin screen merges them into its list.
 */
export async function POST() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  const rl = rateLimit(`greview:${admin.id}`, { limit: 20, windowMs: 60_000 });
  if (!rl.ok) return NextResponse.json({ error: "Too many requests. Wait a minute." }, { status: 429 });

  const { googleKey, googlePlaceId } = await readIntegrations();
  if (!googleKey) {
    return NextResponse.json({
      ok: false,
      needsKey: true,
      error: "Automatic import needs a Google API key. Add it under Admin, Connections (it takes about 5 minutes, steps are on that page). Until then, type reviews in below.",
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
