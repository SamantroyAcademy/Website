"use client";

import { Fragment, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Status = "new" | "contacted" | "enrolled" | "dropped";
export type Enquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  entry: string | null;
  message: string | null;
  source: string;
  status: Status;
  notes: string | null;
  /** Extra answers the form collected — preferred batch, current status. */
  meta: Record<string, unknown> | null;
  created_at: string;
};

/** Read one extra answer off an enquiry's meta blob. */
const extra = (r: Enquiry, key: string) => {
  const v = r.meta?.[key];
  return typeof v === "string" && v.trim() ? v : "";
};

const STATUSES: Status[] = ["new", "contacted", "enrolled", "dropped"];
const STATUS_STYLE: Record<Status, string> = {
  new: "bg-brand-100 text-brand-700",
  contacted: "bg-amber-100 text-amber-700",
  enrolled: "bg-green-100 text-green-700",
  dropped: "bg-slate-200 text-slate-600",
};

const csvCell = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;

export default function EnquiryInbox({ initial }: { initial: Enquiry[] }) {
  const supabase = createClient();
  const [rows, setRows] = useState<Enquiry[]>(initial);
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    for (const s of STATUSES) c[s] = rows.filter((r) => r.status === s).length;
    return c;
  }, [rows]);

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (filter === "all" || r.status === filter) &&
        (!needle ||
          [r.name, r.email, r.phone, r.entry, r.message].some((f) => (f ?? "").toLowerCase().includes(needle))),
    );
  }, [rows, filter, q]);

  async function setStatus(id: string, status: Status) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
    await supabase.from("enquiries").update({ status }).eq("id", id);
  }

  async function saveNotes(id: string, notes: string) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, notes } : r)));
    await supabase.from("enquiries").update({ notes }).eq("id", id);
  }

  async function remove(id: string) {
    if (!confirm("Delete this enquiry?")) return;
    const prev = rows;
    setRows((rs) => rs.filter((r) => r.id !== id));
    const { error } = await supabase.from("enquiries").delete().eq("id", id);
    if (error) { setRows(prev); alert(error.message); }
  }

  function exportCsv() {
    const header = ["Date", "Name", "Email", "Phone", "Entry", "Batch", "Current status", "Source", "Status", "Message", "Notes"];
    const lines = [header.join(",")].concat(
      visible.map((r) =>
        [
          new Date(r.created_at).toLocaleString(),
          r.name, r.email, r.phone ?? "", r.entry ?? "",
          extra(r, "batch"), extra(r, "status"),
          r.source, r.status, r.message ?? "", r.notes ?? "",
        ].map((v) => csvCell(String(v))).join(","),
      ),
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `samantroy-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setFilter("all")} className={`rounded-full px-3 py-1 text-xs font-semibold ${filter === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}>
          All {counts.all}
        </button>
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${filter === s ? "bg-slate-900 text-white" : STATUS_STYLE[s]}`}>
            {s} {counts[s]}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…"
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-brand-500" />
          <button onClick={exportCsv} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">⬇ CSV</button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Aspirant</th>
              <th className="px-4 py-3 font-semibold">Entry</th>
              <th className="px-4 py-3 font-semibold">Source</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">When</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visible.map((r) => (
              <Fragment key={r.id}>
                <tr className="align-top">
                  <td className="px-4 py-3">
                    <button onClick={() => setOpenId(openId === r.id ? null : r.id)} className="text-left">
                      <span className="font-semibold text-slate-900">{r.name}</span>
                      <span className="block text-xs text-slate-500">{[r.email, r.phone].filter(Boolean).join(" · ") || "—"}</span>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{r.entry || "—"}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{r.source.replace("_", " ")}</td>
                  <td className="px-4 py-3">
                    <select value={r.status} onChange={(e) => setStatus(r.id, e.target.value as Status)}
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLE[r.status]}`}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => remove(r.id)} className="rounded border border-red-200 px-1.5 text-xs text-red-600 hover:bg-red-50">✕</button>
                  </td>
                </tr>
                {openId === r.id && (
                  <tr>
                    <td colSpan={6} className="bg-slate-50 px-4 py-4">
                      {(extra(r, "batch") || extra(r, "status")) && (
                        <div className="mb-3 flex flex-wrap gap-2">
                          {extra(r, "batch") && (
                            <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-700 ring-1 ring-slate-200">
                              <b className="text-slate-500">Batch:</b> {extra(r, "batch")}
                            </span>
                          )}
                          {extra(r, "status") && (
                            <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-700 ring-1 ring-slate-200">
                              <b className="text-slate-500">Current status:</b> {extra(r, "status")}
                            </span>
                          )}
                        </div>
                      )}
                      {r.message && <p className="mb-3 rounded-lg bg-white p-3 text-sm text-slate-700"><span className="font-semibold text-slate-500">Message: </span>{r.message}</p>}
                      <label className="mb-1 block text-xs font-medium text-slate-500">Internal notes</label>
                      <textarea defaultValue={r.notes ?? ""} onBlur={(e) => saveNotes(r.id, e.target.value)} rows={2}
                        placeholder="Add a note (saved on blur)…"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500" />
                      <div className="mt-2 flex flex-wrap gap-4">
                        {r.email && (
                          <a href={`mailto:${r.email}`} className="text-xs font-medium text-brand-600 hover:underline">Reply by email →</a>
                        )}
                        {r.phone && (
                          <>
                            <a href={`tel:${r.phone.replace(/[^\d+]/g, "")}`} className="text-xs font-medium text-brand-600 hover:underline">Call →</a>
                            <a href={`https://wa.me/${r.phone.replace(/\D/g, "").replace(/^0+/, "").replace(/^(?!91)/, "91")}`}
                              target="_blank" rel="noopener noreferrer"
                              className="text-xs font-medium text-green-700 hover:underline">WhatsApp →</a>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {visible.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">No enquiries{filter !== "all" ? ` with status "${filter}"` : " yet"}.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
