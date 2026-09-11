import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, hasServiceRole } from "@/lib/supabase/admin";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Super-admin only: change an admin's role or remove their access entirely.
 *  Body: { id: uuid, action: "make_admin" | "make_super_admin" | "remove" } */
export async function POST(req: Request) {
  const rl = rateLimit(`manage-user:${clientIp(req)}`, { limit: 20, windowMs: 60_000 });
  if (!rl.ok) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "super_admin") {
    return NextResponse.json({ error: "Only the Super Admin can manage admins." }, { status: 403 });
  }
  if (!hasServiceRole()) {
    return NextResponse.json({ error: "Server is missing SUPABASE_SERVICE_ROLE_KEY." }, { status: 503 });
  }

  let body: { id?: string; action?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const id = body.id ?? "";
  const action = body.action ?? "";
  if (!UUID.test(id)) return NextResponse.json({ error: "Invalid user id." }, { status: 400 });
  if (id === user.id) {
    return NextResponse.json({ error: "You cannot change your own access here." }, { status: 400 });
  }
  if (!["make_admin", "make_super_admin", "remove"].includes(action)) {
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    if (action === "remove") {
      // Deleting the auth user cascades the profile row. The DB guard trigger
      // blocks removing the last super-admin.
      const { error } = await admin.auth.admin.deleteUser(id);
      if (error) throw new Error(error.message);
    } else {
      const role = action === "make_super_admin" ? "super_admin" : "admin";
      const { data: rows, error } = await admin
        .from("profiles")
        .update({ role })
        .eq("id", id)
        .select("id");
      if (error) throw new Error(error.message);
      if (!rows || rows.length !== 1) {
        throw new Error("That admin no longer exists - refresh and try again.");
      }
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Action failed." },
      { status: 400 },
    );
  }

  await supabase.from("activity_log").insert({
    actor: user.id,
    actor_email: user.email,
    action: `user_${action}`,
    target: id,
  });

  return NextResponse.json({ ok: true });
}
