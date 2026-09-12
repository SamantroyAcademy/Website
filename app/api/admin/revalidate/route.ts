import { NextResponse, after } from "next/server";
import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CMS_TAG } from "@/lib/content";
import { syncTranslations } from "@/lib/i18n/sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Room for the Odia translation sync that runs after the response.
export const maxDuration = 60;

/** Busts the cached published-content reads so an admin's publish shows up on
 *  the live site immediately instead of waiting for the revalidate window. */
export async function POST(req: Request) {
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

  // Translate whatever the admin just published into Odia, automatically.
  // Runs after the response, so saving never waits on the AI model.
  const base = new URL(req.url).origin;
  after(async () => {
    const result = await syncTranslations({ base, budgetMs: 45_000 }).catch(() => null);
    if (result?.published) revalidateTag(CMS_TAG, { expire: 0 });
  });
  return NextResponse.json({ ok: true });
}
