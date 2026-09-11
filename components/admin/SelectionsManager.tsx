"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { bustCmsCache } from "@/lib/revalidate-client";
import type { Selection } from "@/lib/selection-defaults";

type Row = Selection & { id: string; published: boolean; sort_order: number };

export default function SelectionsManager({ initial }: { initial: Row[] }) {
  const supabase = createClient();
  const [rows, setRows] = useState<Row[]>(initial);
  const [form, setForm] = useState({ year: new Date().getFullYear(), exam: "", center: "", count: 1 });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function add() {
    if (!form.exam.trim()) return setMsg("Enter an entry/exam name.");
    setBusy(true); setMsg(null);
    const sort_order = rows.length ? Math.max(...rows.map((r) => r.sort_order)) + 1 : 0;
    const { data, error } = await supabase
      .from("selections")
      .insert({ year: form.year, exam: form.exam.trim(), center: form.center.trim() || null, count: form.count, sort_order, published: true })
      .select("*")
      .single();
    setBusy(false);
    if (error) return setMsg(error.message);
    setRows((r) => [...r, data as Row]); void bustCmsCache();
    setForm({ year: form.year, exam: "", center: "", count: 1 });
  }

  async function patch(id: string, field: keyof Row, value: string | number | boolean) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    await supabase.from("selections").update({ [field]: value }).eq("id", id); void bustCmsCache();
  }

  async function remove(id: string) {
    if (!confirm("Delete this record?")) return;
    const prev = rows;
    setRows((rs) => rs.filter((r) => r.id !== id));
    const { error } = await supabase.from("selections").delete().eq("id", id);
    if (error) { setRows(prev); alert(error.message); } else void bustCmsCache();
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-base font-semibold text-slate-900">Add a result</h2>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs text-slate-500">Year
            <input type="number" value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) }))}
              className="mt-1 block w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="flex-1 text-xs text-slate-500">Entry / Exam
            <input value={form.exam} onChange={(e) => setForm((f) => ({ ...f, exam: e.target.value }))} placeholder="e.g. CDS OTA"
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="flex-1 text-xs text-slate-500">SSB Centre
            <input value={form.center} onChange={(e) => setForm((f) => ({ ...f, center: e.target.value }))} placeholder="e.g. Allahabad"
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="text-xs text-slate-500">Count
            <input type="number" value={form.count} onChange={(e) => setForm((f) => ({ ...f, count: Number(e.target.value) }))}
              className="mt-1 block w-20 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <button onClick={add} disabled={busy} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">Add</button>
        </div>
        {msg && <p className="mt-2 text-sm text-red-600">{msg}</p>}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Year</th><th className="px-4 py-3">Entry</th>
              <th className="px-4 py-3">Centre</th><th className="px-4 py-3">Count</th>
              <th className="px-4 py-3">Shown</th><th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-2"><input type="number" defaultValue={r.year} onBlur={(e) => patch(r.id, "year", Number(e.target.value))} className="w-20 rounded border border-slate-200 px-2 py-1" /></td>
                <td className="px-4 py-2"><input defaultValue={r.exam} onBlur={(e) => patch(r.id, "exam", e.target.value)} className="w-32 rounded border border-slate-200 px-2 py-1" /></td>
                <td className="px-4 py-2"><input defaultValue={r.center ?? ""} onBlur={(e) => patch(r.id, "center", e.target.value)} className="w-32 rounded border border-slate-200 px-2 py-1" /></td>
                <td className="px-4 py-2"><input type="number" defaultValue={r.count} onBlur={(e) => patch(r.id, "count", Number(e.target.value))} className="w-16 rounded border border-slate-200 px-2 py-1" /></td>
                <td className="px-4 py-2">
                  <button onClick={() => patch(r.id, "published", !r.published)} className="rounded border border-slate-200 px-1.5 text-xs hover:bg-slate-50">{r.published ? "👁" : "🚫"}</button>
                </td>
                <td className="px-4 py-2 text-right"><button onClick={() => remove(r.id)} className="rounded border border-red-200 px-1.5 text-xs text-red-600 hover:bg-red-50">✕</button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">No records yet.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400">Edits save when you click away from a field. The public tracker aggregates totals, years and centres automatically.</p>
    </div>
  );
}
