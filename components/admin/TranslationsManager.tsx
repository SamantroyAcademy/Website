"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export type TRow = { source: string; odia: string | null; kind: "text" | "html"; status: "pending" | "done" | "failed"; model: string | null; updated_at: string };

const pill = (on: boolean) => `rounded-full px-3 py-1.5 text-sm font-semibold ${on ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"}`;
const badge: Record<TRow["status"], string> = { done: "bg-emerald-50 text-emerald-700", pending: "bg-amber-50 text-amber-700", failed: "bg-red-50 text-red-700" };

/** Review and correct the automatic Odia translations. */
export default function TranslationsManager({ rows, counts, status, q }: { rows: TRow[]; counts: Record<string, number>; status: string; q: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [search, setSearch] = useState(q);

  const go = (next: { status?: string; q?: string }) => {
    const p = new URLSearchParams({ status: next.status ?? status, q: next.q ?? search });
    router.push(`/admin/translations?${p.toString()}`);
  };

  async function run(label: string, query: string) {
    setBusy(label); setMsg(null);
    try {
      const res = await fetch(`/api/cron/i18n?${query}`);
      const r = (await res.json()) as { translated?: number; pending?: number; queued?: number; published?: { count: number } | null; skipped?: string; error?: string };
      if (!res.ok || r.error) throw new Error(r.error || "Failed");
      setMsg(r.skipped ? `Skipped: ${r.skipped}` : `Done. ${r.queued ? `${r.queued} new texts found. ` : ""}${r.translated ?? 0} translated, ${r.pending ?? 0} still waiting.${r.published ? ` Published ${r.published.count} translations to the site.` : ""}`);
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally { setBusy(null); }
  }

  async function save(row: TRow) {
    const odia = (edits[row.source] ?? row.odia ?? "").trim();
    if (!odia) return;
    setBusy(row.source); setMsg(null);
    const { error } = await supabase.from("translations").update({ odia, status: "done", model: "manual", updated_at: new Date().toISOString() }).eq("source", row.source);
    if (error) { setBusy(null); return setMsg(error.message); }
    setEdits((e) => { const n = { ...e }; delete n[row.source]; return n; });
    await run("publish", "crawl=0&publish=1&budget=1");
  }

  return (
    <div className="mt-6 space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {(["done", "pending", "failed"] as const).map((s) => (
          <div key={s} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">{s === "done" ? "Translated" : s === "pending" ? "Waiting" : "Could not translate"}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{counts[s] ?? 0}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-4">
        <button type="button" disabled={!!busy} onClick={() => run("translate", "crawl=0&budget=50")} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
          {busy === "translate" ? "Translating…" : "Translate waiting texts now"}
        </button>
        <button type="button" disabled={!!busy} onClick={() => run("scan", "crawl=1&budget=50")} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
          {busy === "scan" ? "Scanning…" : "Rescan the website"}
        </button>
        <p className="text-xs text-slate-500">Free AI models are slow and limited per day; anything left waiting is picked up automatically after your next save and every night.</p>
        {msg && <p className="w-full text-sm text-slate-700">{msg}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {["all", "done", "pending", "failed"].map((s) => (
          <button key={s} type="button" onClick={() => go({ status: s })} className={pill(status === s)}>{s === "all" ? "All" : s === "done" ? "Translated" : s === "pending" ? "Waiting" : "Failed"}</button>
        ))}
        <form onSubmit={(e) => { e.preventDefault(); go({ q: search }); }} className="ml-auto flex gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search English text" className="w-56 rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
          <button type="submit" className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">Search</button>
        </form>
      </div>

      <ul className="space-y-2">
        {rows.map((r) => {
          const value = edits[r.source] ?? r.odia ?? "";
          const changed = edits[r.source] !== undefined && edits[r.source] !== (r.odia ?? "");
          return (
            <li key={r.source} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 md:grid-cols-2">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge[r.status]}`}>{r.status}</span>
                  {r.kind === "html" && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">rich text</span>}
                  {r.model && <span className="truncate text-[11px] text-slate-400">{r.model === "manual" ? "edited by you" : r.model}</span>}
                </div>
                <p className="text-sm text-slate-800">{r.source}</p>
              </div>
              <div className="flex flex-col gap-2">
                <textarea value={value} onChange={(e) => setEdits((x) => ({ ...x, [r.source]: e.target.value }))} rows={r.kind === "html" ? 4 : 2}
                  placeholder="Odia translation" lang="or" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                {changed && (
                  <button type="button" disabled={!!busy} onClick={() => save(r)} className="self-end rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
                    {busy === r.source || busy === "publish" ? "Saving…" : "Save and publish"}
                  </button>
                )}
              </div>
            </li>
          );
        })}
        {rows.length === 0 && <li className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">Nothing here.</li>}
      </ul>
    </div>
  );
}
