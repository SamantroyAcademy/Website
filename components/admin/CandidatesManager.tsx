"use client";

import { useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { bustCmsCache } from "@/lib/revalidate-client";
import { mediaUrl } from "@/lib/supabase/media";
import CropFileInput from "./CropFileInput";
import { FRAMES } from "./useImageCropper";
import { EXAM_OPTIONS } from "@/lib/data";
import { uploadMedia } from "@/lib/upload-client";

const FORCES = ["Army", "Navy", "Air Force", "Coast Guard", "CAPF", "Odisha Police", "Odisha State", "Railways", "Bank", "Central Govt", "Officer"];

export type Candidate = {
  id: string;
  name: string;
  exam: string;
  post?: string | null;
  force?: string | null;
  year?: number | null;
  image_path: string | null;
  sort_order: number;
  published: boolean;
  selected_on?: string | null;
  hometown?: string | null;
};

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const today = () => new Date().toISOString().slice(0, 10);

/** The admin's order is the wall's order (lowest sort_order first). */
const sortCands = (arr: Candidate[]) =>
  [...arr].sort((a, b) => a.sort_order - b.sort_order || (b.selected_on ?? "").localeCompare(a.selected_on ?? ""));

/** Newest selection first: the "Sort by date" button. */
const byDate = (arr: Candidate[]) =>
  [...arr].sort((a, b) => (b.selected_on ?? "").localeCompare(a.selected_on ?? "") || a.sort_order - b.sort_order || a.name.localeCompare(b.name));

export default function CandidatesManager({ initial }: { initial: Candidate[] }) {
  const supabase = createClient();
  const [rows, setRows] = useState<Candidate[]>(() => sortCands(initial));
  const [name, setName] = useState("");
  const [exam, setExam] = useState("");
  const [post, setPost] = useState("");
  const [force, setForce] = useState("");
  const [hometown, setHometown] = useState("");
  const [date, setDate] = useState(today);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [orderMsg, setOrderMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  // Drop checks run before React re-renders, so they read a ref.
  const dragRef = useRef<number | null>(null);

  async function uploadImage(f: File): Promise<string> {
    const ext = f.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `candidates/${Date.now()}-${slug(name) || "candidate"}.${ext}`;
    const { error } = await uploadMedia(path, f);
    if (error) throw new Error(error.message);
    return path;
  }

  async function addCandidate(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      // Photo is optional: tiles without one render as a monogram.
      const image_path = file ? await uploadImage(file) : null;
      const year = date ? Number(date.slice(0, 4)) : null;
      // New selections go to the top of the wall.
      const sort_order = rows.length ? Math.min(...rows.map((r) => r.sort_order)) - 1 : 0;
      const { data, error } = await supabase
        .from("selected_candidates")
        .insert({ name, exam, post: post || null, force: force || null, hometown: hometown.trim() || null, year, image_path, sort_order, published: true, selected_on: date || null })
        .select("id, name, exam, post, force, year, image_path, sort_order, published, selected_on, hometown")
        .single();
      if (error) throw new Error(error.message);
      setRows((r) => sortCands([...r, data as Candidate]));
      setName(""); setExam(""); setPost(""); setForce(""); setHometown(""); setFile(null); setDate(today());
      setMsg({ ok: true, text: "Candidate added." }); void bustCmsCache();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Failed to add." });
    } finally {
      setBusy(false);
    }
  }

  async function removeCandidate(id: string) {
    if (!confirm("Remove this candidate from the Wall of Selection?")) return;
    const prev = rows;
    setRows((r) => r.filter((x) => x.id !== id));
    const { error } = await supabase.from("selected_candidates").delete().eq("id", id);
    if (error) { setRows(prev); alert(error.message); }
  }

  async function togglePublished(c: Candidate) {
    const next = !c.published;
    setRows((r) => r.map((x) => (x.id === c.id ? { ...x, published: next } : x)));
    await supabase.from("selected_candidates").update({ published: next }).eq("id", c.id); void bustCmsCache();
  }

  /** Save a new order: every card takes its position as sort_order, and only
   *  the cards whose number changed are written. */
  async function persistOrder(next: Candidate[]) {
    const numbered = next.map((c, i) => ({ ...c, sort_order: i }));
    const changed = numbered.filter((c, i) => c.sort_order !== next[i].sort_order);
    setRows(numbered);
    if (!changed.length) return;
    setOrderMsg({ ok: true, text: "Saving order…" });
    let failed = 0;
    for (let i = 0; i < changed.length; i += 10) {
      const res = await Promise.all(changed.slice(i, i + 10).map((c) => supabase.from("selected_candidates").update({ sort_order: c.sort_order }).eq("id", c.id)));
      failed += res.filter((r) => r.error).length;
    }
    setOrderMsg(failed ? { ok: false, text: `${failed} card(s) could not be saved. Reload and try again.` } : { ok: true, text: "Order saved: live on the website." });
    void bustCmsCache();
  }

  const moveTo = (from: number, to: number) => {
    if (from === to || to < 0 || to >= rows.length) return;
    const next = [...rows];
    const [c] = next.splice(from, 1);
    next.splice(to, 0, c);
    void persistOrder(next);
  };
  const move = (index: number, dir: -1 | 1) => moveTo(index, index + dir);

  function sortByDate() {
    if (!confirm("Put every candidate in date order, newest selection first? Your manual order will be replaced.")) return;
    void persistOrder(byDate(rows));
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Add form */}
      <form onSubmit={addCandidate} className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-base font-semibold text-slate-900">Add a candidate</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" placeholder="e.g. Sanjay Behera" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Exam</label>
            <input value={exam} onChange={(e) => setExam(e.target.value)} required list="exam-options"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" placeholder="e.g. SSC GD Constable" />
            <datalist id="exam-options">{EXAM_OPTIONS.map((o) => <option key={o} value={o} />)}</datalist>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Post (optional)</label>
            <input value={post} onChange={(e) => setPost(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" placeholder="e.g. Constable (GD)" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Force (optional)</label>
            <select value={force} onChange={(e) => setForce(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100">
              <option value="">Select</option>
              {FORCES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Hometown (optional)</label>
            <input value={hometown} onChange={(e) => setHometown(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" placeholder="e.g. Aska, Ganjam" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Date of selection</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Photo (optional)</label>
            <CropFileInput
              file={file}
              onPick={setFile}
              aspect={FRAMES.candidate}
              label="the Wall of Selection"
              buttonLabel="Choose photo"
            />
          </div>
        </div>
        {msg && <p className={`mt-3 rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{msg.text}</p>}
        <button type="submit" disabled={busy} className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60">
          {busy ? "Adding…" : "Add candidate"}
        </button>
      </form>

      {/* List */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-900">On the Wall ({rows.length})</h2>
            <p className="text-xs text-slate-500">Drag a card, or use ⤒ ↑ ↓. The public wall shows this order.</p>
          </div>
          <div className="flex items-center gap-3">
            {orderMsg && <span className={`text-xs font-medium ${orderMsg.ok ? "text-green-700" : "text-red-700"}`}>{orderMsg.text}</span>}
            <button type="button" onClick={sortByDate} disabled={rows.length < 2}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
              Sort by date (newest first)
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {rows.map((c, i) => (
            <div
              key={c.id}
              draggable
              onDragStart={(e) => { dragRef.current = i; setDragFrom(i); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", c.id); }}
              onDragEnd={() => { dragRef.current = null; setDragFrom(null); setDragOver(null); }}
              onDragOver={(e) => { if (dragRef.current !== null) { e.preventDefault(); if (dragOver !== i) setDragOver(i); } }}
              onDrop={(e) => { e.preventDefault(); const from = dragRef.current; dragRef.current = null; setDragFrom(null); setDragOver(null); if (from !== null) moveTo(from, i); }}
              className={`cursor-grab rounded-lg border p-2 transition active:cursor-grabbing ${c.published ? "border-slate-200" : "border-dashed border-slate-300 opacity-60"} ${dragOver === i && dragFrom !== null && dragFrom !== i ? "ring-2 ring-brand-500" : ""} ${dragFrom === i ? "opacity-40" : ""}`}
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-slate-100">
                <span className="absolute left-1.5 top-1.5 z-10 rounded bg-white/90 px-1.5 text-[10px] font-bold text-slate-600">{i + 1}</span>
                {c.image_path && (
                  <Image src={mediaUrl(c.image_path)} alt={c.name} fill sizes="200px" draggable={false} className="pointer-events-none object-cover" />
                )}
              </div>
              <p className="mt-2 truncate text-sm font-semibold text-slate-900">{c.name}</p>
              <p className="truncate text-xs text-slate-500">{c.exam}{c.force ? ` · ${c.force}` : ""}</p>
              {c.hometown && <p className="truncate text-xs text-slate-400">{c.hometown}</p>}
              <div className="mt-2 flex items-center justify-between gap-1">
                <div className="flex gap-1">
                  <button onClick={() => moveTo(i, 0)} disabled={i === 0} title="Move to the top" aria-label="Move to the top" className="rounded border border-slate-200 px-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-30">⤒</button>
                  <button onClick={() => move(i, -1)} disabled={i === 0} title="Move up" aria-label="Move up" className="rounded border border-slate-200 px-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-30">↑</button>
                  <button onClick={() => move(i, 1)} disabled={i === rows.length - 1} title="Move down" aria-label="Move down" className="rounded border border-slate-200 px-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-30">↓</button>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => togglePublished(c)} title={c.published ? "Hide" : "Show"} className="rounded border border-slate-200 px-1.5 text-xs text-slate-600 hover:bg-slate-50">
                    {c.published ? "👁" : "🚫"}
                  </button>
                  <button onClick={() => removeCandidate(c.id)} title="Delete" className="rounded border border-red-200 px-1.5 text-xs text-red-600 hover:bg-red-50">✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {rows.length === 0 && <p className="py-6 text-center text-sm text-slate-400">No candidates yet. Until you add one, the public wall shows labelled sample tiles.</p>}
      </div>
    </div>
  );
}
