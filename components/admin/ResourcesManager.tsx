"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { bustCmsCache } from "@/lib/revalidate-client";
import { compressImage } from "@/lib/image-client";
import { MEDIA_CACHE_CONTROL } from "@/lib/supabase/media";

export type Folder = { id: string; name: string; parent_id: string | null; sort_order: number };
export type Resource = {
  id: string; folder_id: string | null; kind: "file" | "youtube";
  title: string; path: string | null; url: string | null; mime: string | null; thumbnail: string | null;
};

const ACCEPT = ".jpg,.jpeg,.png,.webp,.pdf";
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export default function ResourcesManager({ initialFolders, initialResources }: { initialFolders: Folder[]; initialResources: Resource[] }) {
  const supabase = createClient();
  const [folders, setFolders] = useState<Folder[]>(initialFolders);
  const [resources, setResources] = useState<Resource[]>(initialResources);
  const [current, setCurrent] = useState<string | null>(null); // folder id, null = root
  const [newFolder, setNewFolder] = useState("");
  const [yt, setYt] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const subfolders = useMemo(() => folders.filter((f) => f.parent_id === current), [folders, current]);
  const items = useMemo(() => resources.filter((r) => r.folder_id === current), [resources, current]);
  const crumbs = useMemo(() => {
    const path: Folder[] = [];
    let id = current;
    while (id) { const f = folders.find((x) => x.id === id); if (!f) break; path.unshift(f); id = f.parent_id; }
    return path;
  }, [current, folders]);

  async function createFolder() {
    if (!newFolder.trim()) return;
    setBusy(true); setMsg(null);
    const { data, error } = await supabase.from("resource_folders")
      .insert({ name: newFolder.trim(), parent_id: current }).select("*").single();
    setBusy(false);
    if (error) return setMsg(error.message);
    setFolders((f) => [...f, data as Folder]); setNewFolder(""); void bustCmsCache();
  }

  async function deleteFolder(id: string) {
    if (!confirm("Delete this folder and everything inside it?")) return;
    const pf = folders, pr = resources;
    setFolders((f) => f.filter((x) => x.id !== id));
    const { error } = await supabase.from("resource_folders").delete().eq("id", id);
    if (error) { setFolders(pf); setResources(pr); alert(error.message); }
  }

  async function uploadFiles(fileList: FileList) {
    setBusy(true); setMsg(null);
    try {
      for (const raw of Array.from(fileList)) {
        const isImg = raw.type.startsWith("image/") && raw.type !== "image/gif";
        if (!ALLOWED.includes(raw.type)) { setMsg(`Skipped ${raw.name} — only JPG, PNG, WEBP and PDF are allowed.`); continue; }
        const file = isImg ? await compressImage(raw) : raw;
        const safe = raw.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const path = `resources/${Date.now()}-${safe}`;
        const { error } = await supabase.storage.from("media").upload(path, file, { cacheControl: MEDIA_CACHE_CONTROL, upsert: true, contentType: file.type });
        if (error) throw new Error(error.message);
        const { data, error: e2 } = await supabase.from("resources")
          .insert({ folder_id: current, kind: "file", title: raw.name.replace(/\.[^.]+$/, ""), path, mime: file.type })
          .select("*").single();
        if (e2) throw new Error(e2.message);
        setResources((r) => [...r, data as Resource]); void bustCmsCache();
      }
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Upload failed.");
    } finally { setBusy(false); }
  }

  async function addYoutube() {
    if (!yt.trim()) return;
    setBusy(true); setMsg(null);
    try {
      const res = await fetch("/api/resources/youtube", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: yt.trim() }) });
      const meta = await res.json();
      if (!res.ok) throw new Error(meta.error || "Could not read that link.");
      const { data, error } = await supabase.from("resources")
        .insert({ folder_id: current, kind: "youtube", title: meta.title, url: meta.url, thumbnail: meta.thumbnail })
        .select("*").single();
      if (error) throw new Error(error.message);
      setResources((r) => [...r, data as Resource]); setYt("");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed.");
    } finally { setBusy(false); }
  }

  async function deleteResource(id: string) {
    const prev = resources;
    setResources((r) => r.filter((x) => x.id !== id));
    const { error } = await supabase.from("resources").delete().eq("id", id);
    if (error) { setResources(prev); alert(error.message); } else void bustCmsCache();
  }

  return (
    <div className="mt-6 space-y-5">
      {/* Breadcrumbs */}
      <div className="flex flex-wrap items-center gap-1 text-sm">
        <button onClick={() => setCurrent(null)} className={`rounded px-2 py-1 font-medium ${current === null ? "bg-slate-900 text-white" : "text-brand-600 hover:bg-slate-100"}`}>🏠 Root</button>
        {crumbs.map((f) => (
          <span key={f.id} className="flex items-center gap-1">
            <span className="text-slate-400">/</span>
            <button onClick={() => setCurrent(f.id)} className={`rounded px-2 py-1 font-medium ${current === f.id ? "bg-slate-900 text-white" : "text-brand-600 hover:bg-slate-100"}`}>{f.name}</button>
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-3">
        <div className="flex gap-2">
          <input value={newFolder} onChange={(e) => setNewFolder(e.target.value)} placeholder="New folder name"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <button onClick={createFolder} disabled={busy} className="shrink-0 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60">+ Folder</button>
        </div>
        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          {busy ? "Working…" : "⬆ Upload (JPG/PNG/WEBP/PDF)"}
          <input type="file" accept={ACCEPT} multiple className="hidden" disabled={busy}
            onChange={(e) => { if (e.target.files?.length) uploadFiles(e.target.files); e.target.value = ""; }} />
        </label>
        <div className="flex gap-2">
          <input value={yt} onChange={(e) => setYt(e.target.value)} placeholder="Paste YouTube link"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <button onClick={addYoutube} disabled={busy} className="shrink-0 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">+ Video</button>
        </div>
      </div>
      {msg && <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{msg}</p>}

      {/* Folder tiles */}
      {subfolders.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {subfolders.map((f) => (
            <div key={f.id} className="group relative rounded-lg border border-slate-200 bg-white p-4 text-center">
              <button onClick={() => setCurrent(f.id)} className="block w-full">
                <span className="text-3xl" aria-hidden>📁</span>
                <span className="mt-1 block truncate text-sm font-medium text-slate-800">{f.name}</span>
              </button>
              <button onClick={() => deleteFolder(f.id)} className="absolute right-1 top-1 hidden rounded border border-red-200 px-1.5 text-xs text-red-600 group-hover:block">✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Resource tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((r) => (
          <div key={r.id} className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="flex aspect-video items-center justify-center bg-slate-100 text-4xl">
              {r.kind === "youtube" ? "▶️" : r.mime === "application/pdf" ? "📕" : "🖼"}
            </div>
            <p className="truncate px-2 py-1.5 text-xs font-medium text-slate-700" title={r.title}>{r.title}</p>
            <button onClick={() => deleteResource(r.id)} className="absolute right-1 top-1 hidden rounded border border-red-200 bg-white px-1.5 text-xs text-red-600 group-hover:block">✕</button>
          </div>
        ))}
      </div>
      {subfolders.length === 0 && items.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">This folder is empty — create a subfolder, upload files, or add a video.</p>
      )}
    </div>
  );
}
