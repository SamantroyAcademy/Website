import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

/** Anonymous, cookie-free Supabase client for PUBLIC (published) content.
 *
 *  The SSR client binds to request cookies, which makes any read using it
 *  uncacheable. Published content is public by definition, so reading it with a
 *  plain anon client lets us wrap the query in unstable_cache — collapsing the
 *  ~16 CMS queries a page makes into one cached result and cutting Supabase
 *  egress dramatically. */
export function createPublicClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
