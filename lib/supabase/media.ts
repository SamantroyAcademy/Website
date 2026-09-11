import { SUPABASE_MEDIA_BUCKET, SUPABASE_URL } from "./env";

/** Cache-Control for uploaded media (seconds). Storage objects are immutable —
 *  each upload gets a unique, timestamped key — so they can be cached for a year.
 *  Without this Supabase serves `no-cache` and every view re-fetches, burning egress. */
export const MEDIA_CACHE_CONTROL = "31536000";

/** Build a public URL for a media path.
 *  - Full URLs and local "/images/…" fallback paths are returned unchanged.
 *  - Storage-relative paths (e.g. "students/tanishq.png") become public bucket URLs. */
export function mediaUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return "";
  if (pathOrUrl.startsWith("http") || pathOrUrl.startsWith("/")) return pathOrUrl;
  return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_MEDIA_BUCKET}/${pathOrUrl}`;
}
