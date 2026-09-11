import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type AdminRole = "admin" | "super_admin";
export type AdminProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: AdminRole;
};

/** Returns the signed-in admin's profile, or null if not authenticated /
 *  Supabase isn't configured. Safe to call in Server Components. */
export async function getCurrentAdmin(): Promise<AdminProfile | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email, full_name, role")
      .eq("id", user.id)
      .single();

    // Fail closed: a signed-in user is only an admin when they have a profile
    // row with an admin role. A missing row or a 'pending' role is NOT admin.
    const p = profile as AdminProfile | null;
    if (!p || (p.role !== "admin" && p.role !== "super_admin")) return null;
    return p;
  } catch {
    return null;
  }
}
