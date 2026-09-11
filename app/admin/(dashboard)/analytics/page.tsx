import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type PV = { path: string; day: string; views: number };
type Enq = { status: string; created_at: string };

function iso(d: Date) { return d.toISOString().slice(0, 10); }

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - 29);
  const sinceStr = iso(since);

  const [{ data: pvRaw }, { data: enqRaw }] = await Promise.all([
    supabase.from("page_view_daily").select("path, day, views").gte("day", sinceStr),
    supabase.from("enquiries").select("status, created_at"),
  ]);

  const pv = (pvRaw ?? []) as PV[];
  const enq = (enqRaw ?? []) as Enq[];

  // Views per day (fill gaps).
  const days: { day: string; views: number }[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const key = iso(d);
    days.push({ day: key, views: pv.filter((r) => r.day === key).reduce((s, r) => s + r.views, 0) });
  }
  const totalViews = days.reduce((s, d) => s + d.views, 0);
  const maxDay = Math.max(...days.map((d) => d.views), 1);

  // Top pages.
  const byPath = new Map<string, number>();
  for (const r of pv) byPath.set(r.path, (byPath.get(r.path) ?? 0) + r.views);
  const topPages = Array.from(byPath.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxPage = Math.max(...topPages.map(([, v]) => v), 1);

  // Enquiry funnel.
  const statusCount = (s: string) => enq.filter((e) => e.status === s).length;
  const total = enq.length;
  const enrolled = statusCount("enrolled");
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
  const last7 = enq.filter((e) => new Date(e.created_at) >= weekAgo).length;
  const conversion = total ? Math.round((enrolled / total) * 100) : 0;

  const stat = (label: string, value: string | number, hint?: string) => (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
      <p className="mt-1 text-sm text-slate-500">Privacy-friendly aggregate traffic (no cookies) and your enquiry funnel — last 30 days.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stat("Page views", totalViews.toLocaleString("en-IN"), "last 30 days")}
        {stat("Total enquiries", total, `${last7} in the last 7 days`)}
        {stat("Enrolled", enrolled, "leads marked enrolled")}
        {stat("Conversion", `${conversion}%`, "enrolled ÷ all enquiries")}
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Page views per day</h2>
        {totalViews === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">No views recorded yet. Data appears as visitors browse the site.</p>
        ) : (
          <div className="flex h-40 items-end gap-1">
            {days.map((d) => (
              <div key={d.day} className="group relative flex-1" title={`${d.day}: ${d.views}`}>
                <div className="rounded-t bg-brand-500/80 transition group-hover:bg-brand-600" style={{ height: `${Math.max(2, (d.views / maxDay) * 100)}%` }} />
              </div>
            ))}
          </div>
        )}
        <div className="mt-2 flex justify-between text-[10px] text-slate-400">
          <span>{days[0]?.day}</span><span>{days[days.length - 1]?.day}</span>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Top pages</h2>
          {topPages.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">No data yet.</p>
          ) : (
            <div className="space-y-2.5">
              {topPages.map(([path, v]) => (
                <div key={path} className="flex items-center gap-3">
                  <span className="w-40 shrink-0 truncate text-xs font-medium text-slate-700" title={path}>{path}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${(v / maxPage) * 100}%` }} />
                  </div>
                  <span className="w-10 shrink-0 text-right text-xs font-bold text-slate-700">{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Enquiry funnel</h2>
          <div className="space-y-2.5">
            {(["new", "contacted", "enrolled", "dropped"] as const).map((s) => {
              const c = statusCount(s);
              const pct = total ? Math.round((c / total) * 100) : 0;
              const color = s === "enrolled" ? "bg-green-500" : s === "dropped" ? "bg-slate-400" : s === "contacted" ? "bg-amber-500" : "bg-brand-500";
              return (
                <div key={s} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-xs font-medium capitalize text-slate-700">{s}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-10 shrink-0 text-right text-xs font-bold text-slate-700">{c}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
