import { NextResponse } from "next/server";
import { draftMode } from "next/headers";
import { getCurrentAdmin } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Turns draft preview on (admins only) or off (anyone, e.g. an expired
 *  session). Uses Next's draft mode, so public pages stay cached for
 *  visitors and only the previewing admin gets fresh, draft renders. The
 *  readable `sa-preview` cookie is just a marker for the preview bar. */
export async function POST(req: Request) {
  let on = false;
  try { on = Boolean(((await req.json()) as { on?: unknown }).on); } catch { /* off */ }

  const dm = await draftMode();
  if (on) {
    if (!(await getCurrentAdmin())) return NextResponse.json({ error: "Not allowed." }, { status: 403 });
    dm.enable();
  } else {
    dm.disable();
  }

  const res = NextResponse.json({ ok: true, on });
  res.cookies.set("sa-preview", on ? "1" : "", { path: "/", sameSite: "lax", maxAge: on ? 60 * 60 * 8 : 0 });
  return res;
}
