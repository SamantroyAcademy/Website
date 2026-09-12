import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { isR2Configured, listFolder } from "@/lib/r2";
import { isValidFolder } from "@/lib/r2-keys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Media library listing: the keys in one R2 folder, newest first. */
export async function GET(req: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  if (!isR2Configured()) return NextResponse.json({ keys: [] });

  const folder = new URL(req.url).searchParams.get("folder");
  if (!isValidFolder(folder)) return NextResponse.json({ error: "Invalid folder." }, { status: 400 });

  try {
    return NextResponse.json({ keys: await listFolder(folder) });
  } catch {
    return NextResponse.json({ error: "Could not list files." }, { status: 502 });
  }
}
