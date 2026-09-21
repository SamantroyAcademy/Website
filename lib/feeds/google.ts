import "server-only";
import type { GoogleReview } from "@/lib/homepage-defaults";

/**
 * Google reviews through the Places API (New), the version Google enables for
 * new projects. Needs an API key with "Places API (New)" switched on. Google
 * returns at most 5 reviews per request, so the daily import keeps adding new
 * ones to the list instead of replacing it.
 */

type NewReview = {
  rating?: number;
  text?: { text?: string };
  originalText?: { text?: string };
  relativePublishTimeDescription?: string;
  publishTime?: string;
  authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
  googleMapsUri?: string;
};

export type GoogleFetch =
  | { ok: true; items: GoogleReview[]; rating: number | null; total: number | null; placeName: string; placeUrl: string }
  | { ok: false; error: string };

const API = "https://places.googleapis.com/v1";
const QUERY = process.env.GOOGLE_PLACE_QUERY || "Samantroy Academy, Brahmapur, Odisha";

async function call(url: string, key: string, mask: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key, "X-Goog-FieldMask": mask, ...(init?.headers ?? {}) },
    signal: AbortSignal.timeout(15_000),
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown> & { error?: { message?: string; status?: string } };
  if (!res.ok) throw new Error(json.error?.message || `Google answered ${res.status}.`);
  return json;
}

/** The academy's place id: the configured one, else the first search hit. */
async function placeId(key: string, configured: string): Promise<string> {
  if (configured) return configured.replace(/^places\//, "");
  const json = await call(`${API}/places:searchText`, key, "places.id,places.displayName", {
    method: "POST",
    body: JSON.stringify({ textQuery: QUERY }),
  }) as { places?: { id?: string }[] };
  const id = json.places?.[0]?.id;
  if (!id) throw new Error(`Google found no place for "${QUERY}". Add the Place ID under Connections.`);
  return id;
}

const https = (u?: string) => (u ? (u.startsWith("//") ? `https:${u}` : u) : "");

export async function fetchGoogleReviews(key: string, configuredPlaceId = ""): Promise<GoogleFetch> {
  if (!key) return { ok: false, error: "No Google API key yet. Add one under Admin, Connections." };
  try {
    const id = await placeId(key, configuredPlaceId);
    const place = await call(`${API}/places/${encodeURIComponent(id)}?languageCode=en`, key, "displayName,rating,userRatingCount,googleMapsUri,reviews") as {
      displayName?: { text?: string }; rating?: number; userRatingCount?: number; googleMapsUri?: string; reviews?: NewReview[];
    };
    const items: GoogleReview[] = (place.reviews ?? [])
      .map((r) => ({
        url: r.googleMapsUri || r.authorAttribution?.uri || "",
        name: r.authorAttribution?.displayName?.trim() || "",
        rating: Math.min(5, Math.max(1, Math.round(r.rating ?? 5))),
        // The reviewer's own words; Google's English translation if absent.
        text: (r.originalText?.text || r.text?.text || "").trim(),
        avatar: https(r.authorAttribution?.photoUri),
        date: r.relativePublishTimeDescription || "",
        publishedAt: r.publishTime || "",
      }))
      .filter((r) => r.name && r.text);
    return { ok: true, items, rating: place.rating ?? null, total: place.userRatingCount ?? null, placeName: place.displayName?.text ?? "", placeUrl: place.googleMapsUri ?? "" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not reach Google." };
  }
}

export { mergeReviews } from "@/lib/reviews";
