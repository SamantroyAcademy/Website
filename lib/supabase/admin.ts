import "server-only";
import { createClient as createAdminSb } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./env";

/** Service-role client — SERVER ONLY. Bypasses RLS; never import into client code.
 *  Used for privileged admin tasks (e.g. a super-admin creating new admins). */
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!SUPABASE_URL || !serviceKey) {
    throw new Error("Supabase service role is not configured.");
  }
  return createAdminSb(SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export const hasServiceRole = () => Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
