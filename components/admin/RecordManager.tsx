"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { bustCmsCache } from "@/lib/revalidate-client";
import { mediaUrl, MEDIA_CACHE_CONTROL } from "@/lib/supabase/media";
import { compressImage } from "@/lib/image-client";
import RichText from "./RichText";
import CropFileInput from "./CropFileInput";

export type Field = { key: string; label: string; type: "text" | "rich" | "image" };
type Row = Record<string, unknown> & { id: string; sort_order: number; published: boolean; image_path?: string | null };

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function RecordManager({
  table,
  fields,
  initial,
  titleKey,
  subtitleKey,
  imageAspect,
  imageRound = false,
  imageLabel,
  imageOptional = false,
}: {
  table: string;
  fields: Field[];
  initial: Row[];
  titleKey: string;
  subtitleKey?: string;
  /** Ratio of the frame this record's photo renders in, for the crop dialog. */
  imageAspect?: number;
  imageRound?: boolean;
  imageLabel?: string;
  /** Allow records without a photo (the site shows a monogram instead). */
  imageOptional?: boolean;
}) {
  const supabase = createClient();
  const [rows, setRows] = useState<Row[]>(initial);
  const [form, setForm] = useState<Record<string, string>>({});
  const [file, setFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const imageField = fields.find((f) => f.type === "image")?.key;

  const reset = () => { setForm({}); setFile(null); setEditingId(null); };

  const startEdit = (r: Row) => {
    const f: Record<string, string> = {};
    fields.forEach((fl) => { if (fl.type !== "image") f[fl.key] = String(r[fl.key] ?? ""); });
    setForm(f);
    setEditingId(r.id);
    setFile(null);
    setMsg(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  async function upload(f: File): Promise<string> {
    const c = await compressImage(f);
    const ext = c.name.split(".").pop()?.toLowerCase() || "webp";
    const path = `${table}/${Date.now()}-${slug(form[titleKey] || "item")}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, c, { cacheControl: MEDIA_CACHE_CONTROL, upsert: true, contentType: c.type });
    if (error) throw new Error(error.message);
    return path;
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      const payload: Record<string, unknown> = {};
      fields.forEach((fl) => { if (fl.type !== "image") payload[fl.key] = form[fl.key] ?? ""; });
      if (imageField) {
        if (file) payload[imageField] = await upload(file);
        else if (!editingId && !imageOptional) throw new Error("Please choose an image.");
      }

      if (editingId) {
        const { data, error } = await supabase.from(table).update(payload).eq("id", editingId).select("*").single();
        if (error) throw new Error(error.message);
        setRows((r) => r.map((x) => (x.id === editingId ? (data as Row) : x)));
        setMsg({ ok: true, text: "Saved." }); void bustCmsCache();
      } else {
        payload.sort_order = rows.length ? Math.max(...rows.map((r) => r.sort_order)) + 1 : 0;
        payload.published = true;
        const { data, error } = await supabase.from(table).insert(payload).select("*").single();
        if (error) throw new Error(error.message);
        setRows((r) => [...r, data as Row]);
        setMsg({ ok: true, text: "Added." }); void bustCmsCache();
      }
      reset();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Failed." });
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this item?")) return;
    const prev = rows;
    setRows((r) => r.filter((x) => x.id !== id));
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) { setRows(prev); alert(error.message); }
  }

  async function togglePublished(r: Row) {
    const next = !r.published;
    setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, published: next } : x)));
    await supabase.from(table).update({ published: next }).eq("id", r.id);
  }

  async function move(index: number, dir: -1 | 1) {
    const j = index + dir;
    if (j < 0 || j >= rows.length) return;
    const a = rows[index], b = rows[j];
    await Promise.all([
      supabase.from(table).update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from(table).update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    const swapped = rows.map((x) => (x.id === a.id ? { ...a, sort_order: b.sort_order } : x.id === b.id ? { ...b, sort_order: a.sort_order } : x));
    setRows([...swapped].sort((x, y) => x.sort_order - y.sort_order));
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Add / edit form */}
      <form onSubmit={save} className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">{editingId ? "Edit item" : "Add new"}</h2>
          {editingId && <button type="button" onClick={reset} className="text-xs font-medium text-slate-500 hover:text-slate-800">Cancel edit</button>}
        </div>
        <div className="grid gap-4">
          {fields.map((f) => (
            <div key={f.key} className={f.type === "rich" ? "sm:col-span-2" : ""}>
              <label className="mb-1 block text-sm font-medium text-slate-700">{f.label}</label>
              {f.type === "text" && (
                <input value={form[f.key] ?? ""} onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))} required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
              )}
              {f.type === "rich" && (
                <RichText key={`${editingId ?? "new"}-${f.key}`} value={form[f.key] ?? ""} onChange={(html) => setForm((s) => ({ ...s, [f.key]: html }))} />
              )}
              {f.type === "image" && (
                <div className="flex items-center gap-3">
                  {editingId && (rows.find((r) => r.id === editingId)?.image_path) && !file && (
                    <div className="relative h-14 w-14 overflow-hidden rounded-md bg-slate-100">
                      <Image src={mediaUrl(String(rows.find((r) => r.id === editingId)?.image_path))} alt="" fill sizes="56px" className="object-cover" />
                    </div>
                  )}
                  <CropFileInput
                    file={file}
                    onPick={setFile}
                    aspect={imageAspect}
                    round={imageRound}
                    label={imageLabel}
                    buttonLabel="Choose photo"
                  />
                  {editingId && <span className="text-xs text-slate-400">Leave empty to keep current image</span>}
                </div>
              )}
            </div>
          ))}
        </div>
        {msg && <p className={`mt-3 rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{msg.text}</p>}
        <button type="submit" disabled={busy} className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60">
          {busy ? "Saving…" : editingId ? "Save changes" : "Add"}
        </button>
      </form>

      {/* List */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-base font-semibold text-slate-900">All items ({rows.length})</h2>
        <ul className="divide-y divide-slate-100">
          {rows.map((r, i) => (
            <li key={r.id} className={`flex items-center gap-4 py-3 ${r.published ? "" : "opacity-50"}`}>
              {imageField && r.image_path && (
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-slate-100">
                  <Image src={mediaUrl(String(r.image_path))} alt="" fill sizes="48px" className="object-cover" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{String(r[titleKey])}</p>
                {subtitleKey && <p className="truncate text-xs text-slate-500">{String(r[subtitleKey] ?? "")}</p>}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => move(i, -1)} title="Up" className="rounded border border-slate-200 px-1.5 text-slate-600 hover:bg-slate-50">↑</button>
                <button onClick={() => move(i, 1)} title="Down" className="rounded border border-slate-200 px-1.5 text-slate-600 hover:bg-slate-50">↓</button>
                <button onClick={() => startEdit(r)} className="rounded border border-slate-200 px-2 py-0.5 text-xs font-medium text-brand-600 hover:bg-brand-50">Edit</button>
                <button onClick={() => togglePublished(r)} title={r.published ? "Hide" : "Show"} className="rounded border border-slate-200 px-1.5 text-xs hover:bg-slate-50">{r.published ? "👁" : "🚫"}</button>
                <button onClick={() => remove(r.id)} title="Delete" className="rounded border border-red-200 px-1.5 text-xs text-red-600 hover:bg-red-50">✕</button>
              </div>
            </li>
          ))}
          {rows.length === 0 && <li className="py-6 text-center text-sm text-slate-400">Nothing yet — add the first item above.</li>}
        </ul>
      </div>
    </div>
  );
}
