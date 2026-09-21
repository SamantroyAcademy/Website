import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getCurrentAdmin } from "@/lib/auth";
import { CMS_TAG } from "@/lib/content";
import { createAdminClient, hasServiceRole } from "@/lib/supabase/admin";
import { FEEDS_TAG, readIntegrations, saveIntegrations } from "@/lib/integrations";
import { fetchGoogleReviews, mergeReviews } from "@/lib/feeds/google";
import { refreshInstagramToken } from "@/lib/feeds/meta";
import { asArray } from "@/lib/shape";
import type { GoogleReview } from "@/lib/homepage-defaults";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DAY = 86_400_000;

/**
 * Nightly (Vercel cron, see vercel.json), or on demand by an admin:
 *  1. adds any new Google reviews to the homepage list (Google gives 5 at a
 *     time, so the list grows day by day);
 *  2. renews the Instagram token once it is a month old (tokens last 60 days);
 *  3. refreshes the YouTube, Instagram and Facebook feeds.
 * Vercel sends `Authorization: Bearer <CRON_SECRET>`.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const byCron = Boolean(secret) && req.headers.get("authorization") === `Bearer ${secret}`;
  if (!byCron && !(await getCurrentAdmin())) return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  if (!hasServiceRole()) return NextResponse.json({ error: "Missing the Supabase service key." }, { status: 500 });

  const out: Record<string, string> = {};
  const keys = await readIntegrations();
  let cms = false;

  if (keys.googleKey) {
    const r = await fetchGoogleReviews(keys.googleKey, keys.googlePlaceId);
    if (!r.ok) out.google = `error: ${r.error}`;
    else {
      const db = createAdminClient();
      const { data } = await db.from("site_content").select("draft, published").eq("key", "google_reviews").maybeSingle();
      const draft = (data?.draft ?? {}) as { items?: GoogleReview[]; placeUrl?: string };
      const { items, added } = mergeReviews(asArray<GoogleReview>(draft.items), r.items);
      if (added) {
        const doc = { ...draft, items, placeUrl: draft.placeUrl || r.placeUrl };
        const { error } = await db.from("site_content").upsert(
          { key: "google_reviews", label: "Google Reviews", draft: doc, published: doc },
          { onConflict: "key" },
        );
        out.google = error ? `error: ${error.message}` : `added ${added}`;
        if (!error) cms = true;
      } else out.google = "no new reviews";
    }
  } else out.google = "no key";

  if (keys.instagramToken) {
    const age = keys.instagramTokenAt ? Date.now() - Date.parse(keys.instagramTokenAt) : Infinity;
    if (age > 30 * DAY) {
      const r = await refreshInstagramToken(keys.instagramToken);
      if (r.ok) {
        await saveIntegrations({ instagramToken: r.token, instagramTokenAt: new Date().toISOString() });
        out.instagram = "token renewed";
      } else out.instagram = `renew failed: ${r.error}`;
    } else out.instagram = "token fine";
  } else out.instagram = "no token";

  revalidateTag(cms ? CMS_TAG : FEEDS_TAG, { expire: 0 });
  return NextResponse.json({ ok: true, ...out });
}
