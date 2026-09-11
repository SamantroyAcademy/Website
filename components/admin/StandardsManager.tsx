"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { bustCmsCache } from "@/lib/revalidate-client";
import { STANDARD_ROWS, CATEGORIES, type StandardRow, type Category } from "@/lib/standards";

export type DbStandard = StandardRow & { id: string; exam_id: string | null; published: boolean; sort_order: number };
export type ExamLite = { id: string; name: string; slug: string };

const input = "mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500";

type Form = Omit<StandardRow, "height_cm" | "chest_cm" | "chest_expanded_cm" | "run_distance_m"> & {
  height_cm: string; chest_cm: string; chest_expanded_cm: string; run_distance_m: string;
};

const blank = (exam_id: string): Form => ({
  exam_id, label: "", gender: "male", category: "All", region: "",
  height_cm: "", chest_cm: "", chest_expanded_cm: "", weight_kg: "",
  run_distance_m: "", run_time: "", long_jump: "", high_jump: "", beam_pullups: "",
  ditch: "", zigzag: "", vision: "", notes: "",
});

const num = (s: string) => (s.trim() === "" ? null : Number(s));
const str = (n: number | null | undefined) => (n == null ? "" : String(n));

const COLUMNS = "id, exam_id, label, gender, category, region, height_cm, chest_cm, chest_expanded_cm, weight_kg, run_distance_m, run_time, long_jump, high_jump, beam_pullups, ditch, zigzag, vision, notes, sort_order, published";

export default function StandardsManager({ initial, exams, focusExam }: { initial: DbStandard[]; exams: ExamLite[]; focusExam?: string }) {
  const supabase = createClient();
  const [rows, setRows] = useState<DbStandard[]>(initial);
  const [examFilter, setExamFilter] = useState<string>(focusExam && exams.some((e) => e.id === focusExam) ? focusExam : "all");
  const [form, setForm] = useState<Form>(() => blank(focusExam ?? exams[0]?.id ?? ""));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const set = (patch: Partial<Form>) => setForm((f) => ({ ...f, ...patch }));
  const examName = (id: string | null | undefined) => exams.find((e) => e.id === id)?.name ?? "Unassigned";

  const grouped = useMemo(() => {
    const list = rows.filter((r) => examFilter === "all" || r.exam_id === examFilter);
    const map = new Map<string, DbStandard[]>();
    for (const r of list) {
      const k = r.exam_id ?? "none";
      map.set(k, [...(map.get(k) ?? []), r]);
    }
    return [...map.entries()].sort((a, b) => examName(a[0]).localeCompare(examName(b[0])));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, examFilter, exams]);

  function load(r: DbStandard, asCopy = false) {
    setForm({
      ...blank(r.exam_id ?? ""), ...r,
      height_cm: str(r.height_cm), chest_cm: str(r.chest_cm), chest_expanded_cm: str(r.chest_expanded_cm), run_distance_m: str(r.run_distance_m),
      category: asCopy && r.category !== "ST" ? "ST" : r.category,
    });
    setEditingId(asCopy ? null : r.id);
    setMsg(asCopy ? { ok: true, text: "Copied. Adjust the numbers for the new category and save." } : null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      if (!form.exam_id) throw new Error("Choose the exam this row belongs to.");
      for (const k of ["height_cm", "chest_cm", "chest_expanded_cm", "run_distance_m"] as const) {
        if (form[k].trim() && Number.isNaN(Number(form[k]))) throw new Error(`${k.replace(/_/g, " ")} must be a number.`);
      }
      const { exam_slug: _s, id: _i, ...clean } = form as Form & { exam_slug?: string; id?: string };
      void _s; void _i;
      const payload = {
        ...clean,
        height_cm: num(form.height_cm), chest_cm: num(form.chest_cm),
        chest_expanded_cm: num(form.chest_expanded_cm), run_distance_m: num(form.run_distance_m),
      };
      if (editingId) {
        const { data, error } = await supabase.from("physical_standards").update(payload).eq("id", editingId).select(COLUMNS).single();
        if (error) throw new Error(error.message);
        setRows((r) => r.map((x) => (x.id === editingId ? (data as DbStandard) : x)));
      } else {
        const sort_order = rows.length ? Math.max(...rows.map((r) => r.sort_order)) + 1 : 0;
        const { data, error } = await supabase.from("physical_standards").insert({ ...payload, sort_order, published: true }).select(COLUMNS).single();
        if (error) throw new Error(error.message);
        setRows((r) => [...r, data as DbStandard]);
      }
      setMsg({ ok: true, text: "Saved. Tables, calculator and exam pages update within seconds." });
      void bustCmsCache();
      setForm(blank(form.exam_id ?? ""));
      setEditingId(null);
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Failed." });
    } finally {
      setBusy(false);
    }
  }

  async function togglePublished(r: DbStandard) {
    const next = !r.published;
    setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, published: next } : x)));
    await supabase.from("physical_standards").update({ published: next }).eq("id", r.id);
    void bustCmsCache();
  }

  async function remove(r: DbStandard) {
    if (!confirm("Delete this standards row?")) return;
    const prev = rows;
    setRows((rs) => rs.filter((x) => x.id !== r.id));
    const { error } = await supabase.from("physical_standards").delete().eq("id", r.id);
    if (error) { setRows(prev); alert(error.message); } else void bustCmsCache();
  }

  /** Seed the built-in rows, matching each to an exam by slug. */
  async function importDefaults() {
    const bySlug = new Map(exams.map((e) => [e.slug, e.id]));
    const toAdd = STANDARD_ROWS.filter((r) => r.exam_slug && bySlug.has(r.exam_slug)).map(({ exam_slug, ...r }, i) => ({
      ...r, exam_id: bySlug.get(exam_slug!)!, sort_order: i, published: true,
    }));
    const missing = STANDARD_ROWS.length - toAdd.length;
    if (!toAdd.length) return setMsg({ ok: false, text: "Import the exams catalogue first, so the rows have exams to attach to." });
    if (!confirm(`Import ${toAdd.length} built-in rows?${missing ? ` ${missing} rows are skipped because their exam is not in the catalogue.` : ""}`)) return;
    setBusy(true);
    const { data, error } = await supabase.from("physical_standards").insert(toAdd).select(COLUMNS);
    setBusy(false);
    if (error) return setMsg({ ok: false, text: error.message });
    setRows((r) => [...r, ...((data ?? []) as DbStandard[])]);
    setMsg({ ok: true, text: "Imported. Verify every number against the current notification before relying on it." });
    void bustCmsCache();
  }

  const field = (k: keyof Form, label: string, placeholder = "") => (
    <label className="text-xs font-medium text-slate-500">{label}
      <input value={String(form[k] ?? "")} onChange={(e) => set({ [k]: e.target.value } as Partial<Form>)} placeholder={placeholder} className={input} />
    </label>
  );

  return (
    <div className="mt-6 space-y-6">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        These numbers decide whether an aspirant trains to the right target. Re-verify them against the official notification
        every cycle, and update the accuracy note under{" "}
        <Link href="/admin/sections/standards" className="font-semibold underline">Standards Page Content</Link>.
        {rows.length === 0 && (
          <> The table is empty, so the site shows the built-in rows.{" "}
            <button type="button" onClick={importDefaults} disabled={busy} className="font-semibold underline">Import them here</button>.
          </>
        )}
      </div>

      <form onSubmit={save} className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-base font-semibold text-slate-900">{editingId ? "Edit row" : "Add a row"}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs font-medium text-slate-500 sm:col-span-2">Exam
            <select value={form.exam_id ?? ""} onChange={(e) => set({ exam_id: e.target.value })} className={input} required>
              <option value="" disabled>Select an exam</option>
              {exams.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
            </select>
          </label>
          <label className="text-xs font-medium text-slate-500">Gender
            <select value={form.gender} onChange={(e) => set({ gender: e.target.value as Form["gender"] })} className={input}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </label>
          <label className="text-xs font-medium text-slate-500">Category
            <select value={form.category} onChange={(e) => set({ category: e.target.value as Category })} className={input}>
              <option value="All">All categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          {field("region", "Region (optional)", "e.g. Odisha")}
          {field("label", "Label (optional)", "e.g. Hill areas")}
          {field("vision", "Vision")}
          {field("weight_kg", "Weight")}
        </div>

        <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">Physical standard test</p>
        <div className="mt-2 grid gap-3 sm:grid-cols-3">
          {field("height_cm", "Height (cm)")}
          {field("chest_cm", "Chest unexpanded (cm)")}
          {field("chest_expanded_cm", "Chest expanded (cm)")}
        </div>

        <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">Physical efficiency test</p>
        <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {field("run_distance_m", "Run distance (m)", "1600")}
          {field("run_time", "Run time", "e.g. 5 min 45 sec")}
          {field("long_jump", "Long jump")}
          {field("high_jump", "High jump")}
          {field("beam_pullups", "Beam / other events")}
          {field("ditch", "Ditch")}
          {field("zigzag", "Zig-zag balance")}
        </div>
        <label className="mt-3 block text-xs font-medium text-slate-500">Notes
          <textarea value={form.notes} onChange={(e) => set({ notes: e.target.value })} rows={2} className={input} placeholder="Relaxations, exceptions, source" />
        </label>

        {msg && <p className={`mt-4 rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{msg.text}</p>}
        <div className="mt-4 flex gap-2">
          <button type="submit" disabled={busy || exams.length === 0} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
            {busy ? "Saving…" : editingId ? "Save changes" : "Add row"}
          </button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(blank(form.exam_id ?? "")); }} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>}
        </div>
        {exams.length === 0 && <p className="mt-2 text-xs text-slate-500">Add or import exams first under Exams Catalogue.</p>}
      </form>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-slate-900">Rows ({rows.length})</h2>
          <select value={examFilter} onChange={(e) => setExamFilter(e.target.value)} className="rounded-lg border border-slate-300 px-2 py-1 text-sm" aria-label="Filter by exam">
            <option value="all">All exams</option>
            {exams.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
        </div>
        <div className="space-y-5">
          {grouped.map(([examId, list]) => (
            <div key={examId}>
              <h3 className="mb-2 text-sm font-bold text-slate-800">{examName(examId)}</h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-xs">
                  <thead className="text-slate-400">
                    <tr><th className="py-1 pr-3">Who</th><th className="pr-3">Height</th><th className="pr-3">Chest</th><th className="pr-3">Run</th><th className="pr-3">Other</th><th /></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {list.map((r) => (
                      <tr key={r.id} className={r.published ? "" : "opacity-50"}>
                        <td className="py-2 pr-3 font-medium capitalize text-slate-700">{r.gender} · {r.category}{r.region ? ` · ${r.region}` : ""}</td>
                        <td className="pr-3 text-slate-600">{r.height_cm ?? "-"}</td>
                        <td className="pr-3 text-slate-600">{r.chest_cm ? `${r.chest_cm}/${r.chest_expanded_cm ?? "-"}` : "-"}</td>
                        <td className="pr-3 text-slate-600">{r.run_distance_m ? `${r.run_distance_m} m in ${r.run_time || "?"}` : "-"}</td>
                        <td className="max-w-[220px] truncate pr-3 text-slate-600">{[r.long_jump && `LJ ${r.long_jump}`, r.high_jump && `HJ ${r.high_jump}`, r.beam_pullups].filter(Boolean).join(", ") || "-"}</td>
                        <td className="whitespace-nowrap py-2 text-right">
                          <button onClick={() => load(r)} className="rounded border border-slate-200 px-2 text-slate-600 hover:bg-slate-50">Edit</button>{" "}
                          <button onClick={() => load(r, true)} className="rounded border border-slate-200 px-2 text-slate-600 hover:bg-slate-50">Duplicate</button>{" "}
                          <button onClick={() => togglePublished(r)} className="rounded border border-slate-200 px-2 text-slate-600 hover:bg-slate-50">{r.published ? "Hide" : "Show"}</button>{" "}
                          <button onClick={() => remove(r)} className="rounded border border-red-200 px-1.5 text-red-600 hover:bg-red-50">✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          {grouped.length === 0 && <p className="py-6 text-center text-sm text-slate-400">No rows yet.</p>}
        </div>
      </div>
    </div>
  );
}
