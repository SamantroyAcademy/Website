import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { isR2Configured, presignUpload } from "@/lib/r2";
import { checkUpload } from "@/lib/r2-keys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Hands a signed admin a five-minute URL to PUT one file into R2. The file
 *  itself goes browser to R2; this route only signs. */
export async function POST(req: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  if (!isR2Configured()) return NextResponse.json({ error: "File storage (Cloudflare R2) is not configured." }, { status: 503 });

  const rl = rateLimit(`upload:${admin.id}`, { limit: 60, windowMs: 60_000 });
  if (!rl.ok) return NextResponse.json({ error: "Too many uploads. Wait a minute." }, { status: 429 });

  let body: { key?: unknown; contentType?: unknown; size?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }

  const problem = checkUpload(body.key, body.contentType, body.size);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });

  const signed = await presignUpload(body.key as string, body.contentType as string, body.size as number);
  return NextResponse.json(signed);
}
