import { SUPABASE_MEDIA_BUCKET, SUPABASE_URL } from "./env";

/** Public base URL of the Cloudflare R2 bucket (r2.dev or a custom domain).
 *  Every image and file on the site is fetched straight from here by the
 *  visitor's browser, so none of those bytes pass through Vercel. */
// The public bucket URL is not a secret, so it has a default: a deploy that
// forgets the env var still shows every image.
export const R2_PUBLIC_URL = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://pub-9a00cb9b6e284249a3a4c2795c99118c.r2.dev").replace(/\/+$/, "");

/** Build a public URL for a media path.
 *  - Full URLs (YouTube thumbnails, Google avatars) are returned unchanged.
 *  - "/images/..." (the bundled photographs) and storage-relative paths
 *    ("candidates/1718-name.webp") resolve to the R2 bucket.
 *  - Without R2 configured, relative paths fall back to Supabase Storage. */
export function mediaUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return "";
  if (/^(https?:|data:|blob:)/.test(pathOrUrl)) return pathOrUrl;
  if (pathOrUrl.startsWith("/")) {
    return R2_PUBLIC_URL && pathOrUrl.startsWith("/images/") ? `${R2_PUBLIC_URL}${pathOrUrl}` : pathOrUrl;
  }
  if (R2_PUBLIC_URL) return `${R2_PUBLIC_URL}/${pathOrUrl}`;
  return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_MEDIA_BUCKET}/${pathOrUrl}`;
}
