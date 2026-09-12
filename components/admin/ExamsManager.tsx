"use client";

import { useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { bustCmsCache } from "@/lib/revalidate-client";
import { mediaUrl } from "@/lib/supabase/media";
import { compressImage } from "@/lib/image-client";
import { EXAMS, VERTICALS, STAGE_LABELS, type Exam, type Vertical } from "@/lib/exams";
import RichText from "./RichText";
import { useImageCropper, FRAMES } from "./useImageCropper";
import { uploadMedia } from "@/lib/upload-client";

export type ExamRow = Exam & { id: string; published: boolean };

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const STAGE_KEYS = Object.keys(STAGE_LABELS);

const blank = (): Exam => ({
  slug: "", name: "", short_name: "", vertical: "armed-forces", force: "", stage: "", qualification: "",
  age_min: null, age_max: null, gender: "both", marital_status: "", domicile: "All India",
  intro: "", pattern: "", syllabus: "", salary: "", stages: [...STAGE_KEYS],
  notification_month: "", exam_month: "", official_url: "", banner_path: "", sort_order: 0,
});

const input = "mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500";
const COLUMNS = "id, slug, name, short_name, vertical, force, stage, qualification, age_min, age_max, gender, marital_status, domicile, intro, pattern, syllabus, salary, stages, notification_month, exam_month, official_url, banner_path, sort_order, published";

export default function ExamsManager({ initial }: { initial: ExamRow[] }) {
  const supabase = createClient();
  const { crop, cropperUi } = useImageCropper();
  const [rows, setRows] = useState<ExamRow[]>(initial);
  const [tab, setTab] = useState<Vertical | "all">("all");
  const [form, setForm] = useState<Exam>(blank);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const shown = useMemo(
    () => [...rows].filter((r) => tab === "all" || r.vertical === tab).sort((a, b) => a.sort_order - b.sort_order),
    [rows, tab],
  );

  const set = (patch: Partial<Exam>) => setForm((f) => ({ ...f, ...patch }));
  const reset = () => { setForm(blank()); setEditingId(null); setSlugTouched(false); };

  function startEdit(r: ExamRow) {
    const { id, published: _p, ...rest } = r;
    void _p;
    setForm({ ...blank(), ...rest, stages: Array.isArray(rest.stages) ? rest.stages : [] });
    setEditingId(id);
    setSlugTouched(true);
    setMsg(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function uploadBanner(file: File) {
    const picked = await crop(file, { aspect: FRAMES.pageHero, label: "the exam page banner" });
    if (!picked) return;
    setBusy(true);
    try {
      const f = await compressImage(picked);
      const path = `exams/${Date.now()}-${slugify(form.name) || "exam"}.webp`;
      const { error } = await uploadMedia(path, f);
      if (error) throw new Error(error.message);
      set({ banner_path: path });
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Upload failed." });
    } finally {
      setBusy(false);
    }
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      const slug = slugify(form.slug || form.name);
      if (!form.name.trim()) throw new Error("Exam name is required.");
      if (!slug) throw new Error("Add a URL slug.");
      if (form.official_url && !/^https?:\/\//i.test(form.official_url)) throw new Error("Official link must start with http:// or https://");
      const payload = {
        ...form,
        slug,
        age_min: form.age_min === null || Number.isNaN(Number(form.age_min)) ? null : Number(form.age_min),
        age_max: form.age_max === null || Number.isNaN(Number(form.age_max)) ? null : Number(form.age_max),
        updated_at: new Date().toISOString(),
      };
      if (editingId) {
        const { data, error } = await supabase.from("exams").update(payload).eq("id", editingId).select(COLUMNS).single();
        if (error) throw new Error(error.message);
        setRows((r) => r.map((x) => (x.id === editingId ? (data as ExamRow) : x)));
        setMsg({ ok: true, text: "Saved. The exam page updates within seconds." });
      } else {
        const sort_order = rows.length ? Math.max(...rows.map((r) => r.sort_order)) + 1 : 0;
        const { data, error } = await supabase.from("exams").insert({ ...payload, sort_order, published: true }).select(COLUMNS).single();
        if (error) throw new Error(error.message.includes("duplicate") ? "Another exam already uses this slug." : error.message);
        setRows((r) => [...r, data as ExamRow]);
        setMsg({ ok: true, text: `Added. Live at /exams/${slug}` });
      }
      void bustCmsCache();
      reset();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Failed." });
    } finally {
      setBusy(false);
    }
  }

  async function togglePublished(r: ExamRow) {
    const next = !r.published;
    setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, published: next } : x)));
    await supabase.from("exams").update({ published: next }).eq("id", r.id);
    void bustCmsCache();
  }

  async function remove(r: ExamRow) {
    if (!confirm(`Delete "${r.name}"? Its physical standards rows are deleted too.`)) return;
    const prev = rows;
    setRows((rs) => rs.filter((x) => x.id !== r.id));
    const { error } = await supabase.from("exams").delete().eq("id", r.id);
    if (error) { setRows(prev); alert(error.message); } else void bustCmsCache();
  }

  async function move(r: ExamRow, dir: -1 | 1) {
    const idx = shown.findIndex((x) => x.id === r.id);
    const other = shown[idx + dir];
    if (!other) return;
    setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, sort_order: other.sort_order } : x.id === other.id ? { ...x, sort_order: r.sort_order } : x)));
    await Promise.all([
      supabase.from("exams").update({ sort_order: other.sort_order }).eq("id", r.id),
      supabase.from("exams").update({ sort_order: r.sort_order }).eq("id", other.id),
    ]);
    void bustCmsCache();
  }

  /** One-click seed: copies the built-in catalogue into the table. */
  async function importDefaults() {
    if (!confirm(`Import the ${EXAMS.length} built-in exams? Exams whose slug already exists are skipped.`)) return;
    setBusy(true); setMsg(null);
    const existing = new Set(rows.map((r) => r.slug));
    const toAdd = EXAMS.filter((e) => !existing.has(e.slug)).map((e) => ({ ...e, published: true }));
    if (!toAdd.length) { setBusy(false); return setMsg({ ok: true, text: "Every built-in exam is already in the table." }); }
    const { data, error } = await supabase.from("exams").insert(toAdd).select(COLUMNS);
    setBusy(false);
    if (error) return setMsg({ ok: false, text: error.message });
    setRows((r) => [...r, ...((data ?? []) as ExamRow[])]);
    setMsg({ ok: true, text: `Imported ${toAdd.length} exams. Review each against the current notification.` });
    void bustCmsCache();
  }

  return (
    <div className="mt-6 space-y-6">
      {cropperUi}

      {rows.length === 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          The table is empty, so the site is showing the built-in catalogue.{" "}
          <button type="button" onClick={importDefaults} disabled={busy} className="font-semibold underline">
            Import it here
          </button>{" "}
          to start editing each exam.
        </div>
      )}

      <form onSubmit={save} className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-base font-semibold text-slate-900">{editingId ? `Edit: ${form.name}` : "Add an exam"}</h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-xs font-medium text-slate-500 sm:col-span-2">Exam name
            <input value={form.name} required className={input}
              onChange={(e) => set({ name: e.target.value, ...(slugTouched ? {} : { slug: slugify(e.target.value) }) })} />
          </label>
          <label className="text-xs font-medium text-slate-500">Short name
            <input value={form.short_name} onChange={(e) => set({ short_name: e.target.value })} className={input} placeholder="e.g. SSC GD" />
          </label>
          <label className="text-xs font-medium text-slate-500">URL slug (/exams/…)
            <input value={form.slug} onChange={(e) => { setSlugTouched(true); set({ slug: e.target.value }); }} className={input} />
          </label>
          <label className="text-xs font-medium text-slate-500">Vertical
            <select value={form.vertical} onChange={(e) => set({ vertical: e.target.value as Vertical })} className={input}>
              {VERTICALS.map((v) => <option key={v.key} value={v.key}>{v.label}</option>)}
            </select>
          </label>
          <label className="text-xs font-medium text-slate-500">Force / department
            <input value={form.force} onChange={(e) => set({ force: e.target.value })} className={input} />
          </label>
          <label className="text-xs font-medium text-slate-500">When you can apply
            <input value={form.stage} onChange={(e) => set({ stage: e.target.value })} className={input} placeholder="e.g. After 10th" />
          </label>
          <label className="text-xs font-medium text-slate-500 sm:col-span-2">Qualification
            <input value={form.qualification} onChange={(e) => set({ qualification: e.target.value })} className={input} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs font-medium text-slate-500">Min age
              <input type="number" value={form.age_min ?? ""} onChange={(e) => set({ age_min: e.target.value === "" ? null : Number(e.target.value) })} className={input} />
            </label>
            <label className="text-xs font-medium text-slate-500">Max age
              <input type="number" value={form.age_max ?? ""} onChange={(e) => set({ age_max: e.target.value === "" ? null : Number(e.target.value) })} className={input} />
            </label>
          </div>
          <label className="text-xs font-medium text-slate-500">Open to
            <select value={form.gender} onChange={(e) => set({ gender: e.target.value as Exam["gender"] })} className={input}>
              <option value="both">Men and women</option>
              <option value="male">Men only</option>
              <option value="female">Women only</option>
            </select>
          </label>
          <label className="text-xs font-medium text-slate-500">Marital status
            <input value={form.marital_status} onChange={(e) => set({ marital_status: e.target.value })} className={input} placeholder="e.g. Unmarried" />
          </label>
          <label className="text-xs font-medium text-slate-500">Domicile
            <input value={form.domicile} onChange={(e) => set({ domicile: e.target.value })} className={input} placeholder="All India / Odisha" />
          </label>
          <label className="text-xs font-medium text-slate-500">Usual notification month
            <input value={form.notification_month} onChange={(e) => set({ notification_month: e.target.value })} className={input} />
          </label>
          <label className="text-xs font-medium text-slate-500">Usual exam month
            <input value={form.exam_month} onChange={(e) => set({ exam_month: e.target.value })} className={input} />
          </label>
          <label className="text-xs font-medium text-slate-500 sm:col-span-2">Official website
            <input value={form.official_url} onChange={(e) => set({ official_url: e.target.value })} className={input} placeholder="https://" />
          </label>
        </div>

        <fieldset className="mt-4">
          <legend className="text-xs font-medium text-slate-500">Stages this exam uses</legend>
          <div className="mt-1 flex flex-wrap gap-2">
            {STAGE_KEYS.map((k) => {
              const on = form.stages.includes(k);
              return (
                <button type="button" key={k} onClick={() => set({ stages: on ? form.stages.filter((s) => s !== k) : STAGE_KEYS.filter((s) => s === k || form.stages.includes(s)) })}
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${on ? "border-brand-500 bg-brand-50 text-brand-800" : "border-slate-200 text-slate-500"}`}>
                  {STAGE_LABELS[k]}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {([
            ["intro", "Overview"],
            ["pattern", "Exam pattern"],
            ["syllabus", "Syllabus"],
            ["salary", "Salary and career (optional)"],
          ] as const).map(([k, label]) => (
            <div key={k}>
              <p className="mb-1 text-xs font-medium text-slate-500">{label}</p>
              <RichText value={form[k]} onChange={(html) => set({ [k]: html } as Partial<Exam>)} minHeight={100} />
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3">
          {form.banner_path && (
            <div className="relative h-14 w-24 overflow-hidden rounded-md bg-slate-100">
              <Image src={mediaUrl(form.banner_path)} alt="" fill sizes="96px" className="object-cover" />
            </div>
          )}
          <label className="text-xs text-slate-500">Page banner (optional)
            <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) uploadBanner(f); }}
              className="mt-1 block text-sm file:mr-3 file:rounded file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-slate-700" />
          </label>
        </div>

        {msg && <p className={`mt-4 rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{msg.text}</p>}
        <div className="mt-4 flex gap-2">
          <button type="submit" disabled={busy} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
            {busy ? "Saving…" : editingId ? "Save changes" : "Add exam"}
          </button>
          {editingId && <button type="button" onClick={reset} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>}
        </div>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex flex-wrap gap-2">
          {([{ key: "all", short: "All" }, ...VERTICALS] as { key: Vertical | "all"; short: string }[]).map((v) => (
            <button key={v.key} type="button" onClick={() => setTab(v.key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${tab === v.key ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}>
              {v.short} ({v.key === "all" ? rows.length : rows.filter((r) => r.vertical === v.key).length})
            </button>
          ))}
        </div>
        <ul className="divide-y divide-slate-100">
          {shown.map((r) => (
            <li key={r.id} className={`flex flex-wrap items-center gap-3 py-3 ${r.published ? "" : "opacity-50"}`}>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">{r.name}</p>
                <p className="truncate text-xs text-slate-500">/exams/{r.slug} · {r.qualification || "no qualification set"}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => move(r, -1)} aria-label="Move up" className="rounded border border-slate-200 px-1.5 text-slate-600 hover:bg-slate-50">↑</button>
                <button onClick={() => move(r, 1)} aria-label="Move down" className="rounded border border-slate-200 px-1.5 text-slate-600 hover:bg-slate-50">↓</button>
                <Link href={`/admin/standards?exam=${r.id}`} className="rounded border border-slate-200 px-2 text-xs leading-6 text-slate-600 hover:bg-slate-50">Standards</Link>
                <button onClick={() => startEdit(r)} className="rounded border border-slate-200 px-2 text-xs text-slate-600 hover:bg-slate-50">Edit</button>
                <button onClick={() => togglePublished(r)} className="rounded border border-slate-200 px-2 text-xs text-slate-600 hover:bg-slate-50">{r.published ? "Hide" : "Show"}</button>
                <button onClick={() => remove(r)} className="rounded border border-red-200 px-1.5 text-xs text-red-600 hover:bg-red-50">✕</button>
              </div>
            </li>
          ))}
          {shown.length === 0 && <li className="py-6 text-center text-sm text-slate-400">No exams in this group yet.</li>}
        </ul>
      </div>
    </div>
  );
}
