import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CMS_TAG } from "@/lib/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Busts the cached published-content reads so an admin's publish shows up on
 *  the live site immediately instead of waiting for the revalidate window. */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin" && profile?.role !== "super_admin") {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }

  // Next 16 requires a cache-life profile; expire immediately so the very next
  // request re-reads the freshly published content.
  revalidateTag(CMS_TAG, { expire: 0 });
  return NextResponse.json({ ok: true });
}
