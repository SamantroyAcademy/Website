/**
 * One Google review from its share link (maps.app.goo.gl/… or a
 * google.com/maps/reviews/… address). Pure helpers: which review a link
 * points to, the request Google Maps itself makes to show it, and reading
 * the answer. No API key is needed; see lib/feeds/google-review-link.ts.
 */

export type LinkedReview = {
  name: string;
  avatar: string;
  rating: number;
  text: string;
  /** ISO time the review was posted, when Google gives it. */
  publishedAt: string;
  /** Photos the reviewer attached. */
  photos: string[];
};

/** Hosts a pasted link (and every redirect after it) may be on. */
export function isGoogleMapsHost(host: string): boolean {
  const h = host.toLowerCase();
  return h === "maps.app.goo.gl" || h === "goo.gl" || h === "g.co" || /^(www\.|maps\.)?google\.[a-z.]{2,6}$/.test(h);
}

/** The review id and the place id inside an expanded Maps address. Review
 *  ids are base64 and start with "Ch" or "Ci"; place ids look like
 *  "0x0:0x2980bdca1fe41371". */
export function reviewIdsFrom(url: string): { reviewId: string; placeId: string } | null {
  let u = url;
  try { u = decodeURIComponent(url); } catch { /* keep as is */ }
  const reviewId = u.match(/!1s(C[hi][A-Za-z0-9_-]{18,})/)?.[1];
  const placeId = u.match(/!1s(0x[0-9a-f]+:0x[0-9a-f]+)/i)?.[1];
  return reviewId && placeId ? { reviewId, placeId } : null;
}

/** The request Google Maps makes to show one review. The session token only
 *  has to be present; any value works. */
export function reviewRpcUrl(placeId: string, reviewId: string, session: string): string {
  const pb = `!3m3!1s${session}!7e81!15i31661!5m3!1b1!9m1!1e3!6m56!1m49!1m5!1m4!1e1!1e3!1e2!1e4!3m5!2m4!3m3!1m2!1i260!2i365!4m1!3i20!10b1!11m33!1m3!1e1!2b0!3e3!1m3!1e2!2b1!3e2!1m3!1e2!2b0!3e3!1m3!1e8!2b0!3e3!1m3!1e10!2b0!3e3!1m3!1e10!2b1!3e2!1m3!1e10!2b0!3e4!1m3!1e9!2b1!3e2!2b1!2m5!1e1!1e4!1e5!1e3!1e2!7m0!8m28!1m6!1m2!1i0!2i0!2m2!1i530!2i768!1m6!1m2!1i974!2i0!2m2!1i1024!2i768!1m6!1m2!1i0!2i0!2m2!1i1024!2i20!1m6!1m2!1i0!2i748!2m2!1i1024!2i768!10s${placeId}!11s${reviewId}`;
  return `https://www.google.com/maps/timeline/_rpc/pc?authuser=0&hl=en&gl=in&pb=${pb}`;
}

type Tree = unknown;
const at = (v: Tree, ...path: number[]): unknown => path.reduce<unknown>((x, i) => (Array.isArray(x) ? x[i] : undefined), v);
const str = (v: unknown) => (typeof v === "string" ? v : "");

/** Resize a Google-hosted image by rewriting its size suffix ("=s120-c…",
 *  "=k-no", "=w900-h900…"). */
export function sizedGoogleImage(url: string, spec: string): string {
  if (!/^https:\/\/lh\d\.googleusercontent\.com\//.test(url)) return url;
  return url.replace(/=[^/=]*$/, "") + "=" + spec;
}

/** Read Google's answer. Field positions were mapped from a live response;
 *  anything missing comes back empty rather than throwing. */
export function parseReviewRpc(body: string): LinkedReview | null {
  let json: Tree;
  try { json = JSON.parse(body.replace(/^\)\]\}'\s*/, "")); } catch { return null; }
  const r = at(json, 7);
  if (!Array.isArray(r)) return null;
  const name = str(at(r, 1, 4, 5, 0)).trim();
  const text = str(at(r, 2, 15, 0, 0)).trim();
  const ratingRaw = Number(at(r, 2, 0, 0));
  const micros = Number(at(r, 1, 2));
  const photoList = at(r, 2, 2);
  const photos = Array.isArray(photoList)
    ? photoList.map((p) => str(at(p, 1, 6, 0))).filter((u) => u.startsWith("https://"))
    : [];
  if (!name) return null;
  return {
    name,
    avatar: str(at(r, 1, 4, 5, 1)),
    rating: Number.isFinite(ratingRaw) && ratingRaw >= 1 ? Math.min(5, Math.round(ratingRaw)) : 5,
    text,
    publishedAt: Number.isFinite(micros) && micros > 1e15 ? new Date(micros / 1000).toISOString() : "",
    photos,
  };
}

/** "September 2025": a date that does not go stale like "a year ago". */
export function monthYear(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: "Asia/Kolkata" });
}
