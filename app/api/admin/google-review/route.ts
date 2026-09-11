import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PlaceReview = {
  author_name?: string;
  rating?: number;
  text?: string;
  profile_photo_url?: string;
  relative_time_description?: string;
  author_url?: string;
};

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return profile?.role === "admin" || profile?.role === "super_admin" ? user : null;
}

/** Resolve a Places API place_id: use the configured one, else search by name. */
async function resolvePlaceId(key: string): Promise<string | null> {
  const configured = process.env.GOOGLE_PLACE_ID;
  if (configured) return configured;
  const q = encodeURIComponent(process.env.GOOGLE_PLACE_QUERY || "Samantroy Academy, Odisha");
  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${q}&inputtype=textquery&fields=place_id&key=${key}`;
  const res = await fetch(url);
  const json = await res.json();
  return json?.candidates?.[0]?.place_id ?? null;
}

/**
 * Imports Google reviews.
 *
 * Google renders review content with JavaScript and blocks scraping, so a
 * pasted share link genuinely cannot yield the reviewer/text/photo - its meta
 * tags only ever say "Google Maps". The reliable route is the official Places
 * API, which returns up to 5 recent reviews with author, rating, text and photo.
 * Without a key we say so plainly instead of inventing content.
 */
export async function POST(req: Request) {
  const rl = rateLimit(`greview:${clientIp(req)}`, { limit: 20, windowMs: 60_000 });
  if (!rl.ok) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) {
    return NextResponse.json({
      ok: false,
      manual: true,
      error:
        "Google does not expose review text to link-readers, so automatic import needs a Google Places API key (set GOOGLE_PLACES_API_KEY). Until then, add the reviewer's name, rating, text and photo below - it publishes exactly the same.",
    });
  }

  try {
    const placeId = await resolvePlaceId(key);
    if (!placeId) {
      return NextResponse.json({ ok: false, manual: true, error: "Could not find the Google place. Set GOOGLE_PLACE_ID." });
    }

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total&reviews_sort=newest&key=${key}`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.status !== "OK") {
      return NextResponse.json({ ok: false, manual: true, error: `Google said: ${json.status}. ${json.error_message ?? ""}`.trim() });
    }

    const reviews = (json.result?.reviews ?? []) as PlaceReview[];
    return NextResponse.json({
      ok: true,
      count: reviews.length,
      rating: json.result?.rating ?? null,
      total: json.result?.user_ratings_total ?? null,
      items: reviews.map((r) => ({
        url: r.author_url ?? "",
        name: r.author_name ?? "",
        rating: r.rating ?? 5,
        text: r.text ?? "",
        avatarUrl: r.profile_photo_url ?? "",
        date: r.relative_time_description ?? "",
      })),
    });
  } catch {
    return NextResponse.json({ ok: false, manual: true, error: "Could not reach Google right now - add the review manually below." });
  }
}
