import { NextResponse } from "next/server";
import { rateLimitShared } from "@/lib/rate-limit";
import { readJson } from "@/lib/security";
import { queueMissing } from "@/lib/i18n/sync";

export const runtime = "nodejs";

/** A browser in Odia mode reports text it had no translation for (menus,
 *  chat answers and other text that only appears after a click). The strings
 *  are only queued; the next sync translates them. Rate-limited and capped. */
export async function POST(req: Request) {
  if (!(await rateLimitShared("i18n-missing", req, { limit: 6, windowSeconds: 60 }))) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }
  const body = await readJson<{ items?: unknown }>(req, 24_000);
  const items = Array.isArray(body?.items) ? body.items.filter((x): x is string => typeof x === "string" && x.length <= 600) : [];
  const queued = await queueMissing(items);
  return NextResponse.json({ ok: true, queued });
}
