import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { deleteObject, isR2Configured, listFolder } from "@/lib/r2";
import { isValidFolder, isValidKey } from "@/lib/r2-keys";
import { createAdminClient } from "@/lib/supabase/admin";
import { readJson } from "@/lib/security";

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

/** Where the CMS keeps file paths: page content (drafts too) and the
 *  collections with an image or cover. */
const TABLES = ["selected_candidates", "testimonials", "mentors", "posts", "resources", "exams"] as const;

async function whereUsed(key: string): Promise<string[]> {
  const db = createAdminClient();
  const found: string[] = [];
  const { data: docs } = await db.from("site_content").select("key, label, draft, published");
  for (const d of docs ?? []) {
    if (JSON.stringify([d.draft, d.published]).includes(key)) found.push(d.label || d.key);
  }
  for (const table of TABLES) {
    const { data } = await db.from(table).select("*").limit(5000);
    const n = (data ?? []).filter((r) => JSON.stringify(r).includes(key)).length;
    if (n) found.push(`${table.replace(/_/g, " ")} (${n})`);
  }
  return found;
}

/** Delete one file, refused while the site still uses it (so a delete can
 *  never leave a broken image on a page). */
export async function DELETE(req: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  if (!isR2Configured()) return NextResponse.json({ error: "Storage is not configured." }, { status: 503 });

  const body = await readJson<{ key?: unknown }>(req, 1024);
  const key = body?.key;
  if (!isValidKey(key)) return NextResponse.json({ error: "Invalid file." }, { status: 400 });

  const used = await whereUsed(key);
  if (used.length) {
    return NextResponse.json({ error: `This file is still used on the site: ${used.join(", ")}. Replace it there first.` }, { status: 409 });
  }
  if (!(await deleteObject(key))) return NextResponse.json({ error: "Could not delete the file. Please try again." }, { status: 502 });

  await createAdminClient().from("activity_log").insert({ actor: admin.id, actor_email: admin.email, action: "delete_media", target: key });
  return NextResponse.json({ ok: true });
}
