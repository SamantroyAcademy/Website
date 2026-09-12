import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getCurrentAdmin } from "@/lib/auth";
import { CMS_TAG } from "@/lib/content";
import { syncTranslations } from "@/lib/i18n/sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Odia translation sync on a schedule (Vercel cron, see vercel.json) or on
 *  demand by an admin. Vercel sends `Authorization: Bearer <CRON_SECRET>`. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const byCron = Boolean(secret) && req.headers.get("authorization") === `Bearer ${secret}`;
  if (!byCron && !(await getCurrentAdmin())) return NextResponse.json({ error: "Not allowed." }, { status: 403 });

  const url = new URL(req.url);
  const budgetMs = Math.min(Number(url.searchParams.get("budget") || 45), process.env.VERCEL ? 50 : 600) * 1000;
  const result = await syncTranslations({ base: url.origin, budgetMs, crawlSite: url.searchParams.get("crawl") !== "0", forcePublish: url.searchParams.get("publish") === "1" });
  if (result.published) revalidateTag(CMS_TAG, { expire: 0 });
  return NextResponse.json(result);
}
