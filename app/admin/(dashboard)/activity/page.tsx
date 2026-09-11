import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const ICON: Record<string, string> = {
  publish: "🚀", rollback: "↩", create_admin: "👤", update: "✎",
};

export default async function ActivityPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("activity_log")
    .select("id, actor_email, action, target, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900">Activity Log</h1>
      <p className="mt-1 text-sm text-slate-500">Recent changes made through the CMS.</p>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <ul className="divide-y divide-slate-100">
          {(data ?? []).map((a) => (
            <li key={a.id} className="flex items-center gap-3 px-4 py-3 text-sm">
              <span className="text-lg" aria-hidden>{ICON[a.action] ?? "•"}</span>
              <div className="min-w-0 flex-1">
                <p className="text-slate-800">
                  <span className="font-medium capitalize">{a.action.replace("_", " ")}</span>
                  {a.target && <span className="text-slate-500"> · {a.target}</span>}
                </p>
                <p className="text-xs text-slate-400">{a.actor_email}</p>
              </div>
              <time className="shrink-0 text-xs text-slate-400">{new Date(a.created_at).toLocaleString("en-IN")}</time>
            </li>
          ))}
          {(!data || data.length === 0) && (
            <li className="px-4 py-8 text-center text-sm text-slate-400">No activity yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
