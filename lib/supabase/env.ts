/** Central Supabase env access. Everything is optional so the public site
 *  builds and runs even before Supabase is configured (graceful fallback). */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
// Accept either the classic anon key or the new publishable key.
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "";
export const SUPABASE_MEDIA_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET ?? "media";

/** True when the public Supabase env is present (URL + anon key). */
export const isSupabaseConfigured = () =>
  Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
