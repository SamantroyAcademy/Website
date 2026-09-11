"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { mediaUrl, MEDIA_CACHE_CONTROL } from "@/lib/supabase/media";
import { compressImage } from "@/lib/image-client";
import { useImageCropper } from "./useImageCropper";

const FOLDERS = ["library", "candidates", "testimonials", "mentors", "students", "services", "campus"];

export default function MediaLibrary() {
  const supabase = createClient();
  const [folder, setFolder] = useState("library");
  const { crop, cropperUi } = useImageCropper();
  const [files, setFiles] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const load = useCallback(async (f: string) => {
    const { data } = await supabase.storage.from("media").list(f, { limit: 200, sortBy: { column: "created_at", order: "desc" } });
    setFiles((data ?? []).filter((x) => x.name && !x.name.startsWith(".")).map((x) => `${f}/${x.name}`));
  }, [supabase]);

  useEffect(() => { load(folder); }, [folder, load]);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.files?.[0];
    e.target.value = "";
    if (!raw) return;
    // No fixed destination here, so the dialog offers a shape picker
    // (defaulting to Original) alongside rotate.
    const picked = await crop(raw);
    if (!picked) return;
    setBusy(true);
    const f = await compressImage(picked);
    const path = `library/${Date.now()}-${f.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const { error } = await supabase.storage.from("media").upload(path, f, { cacheControl: MEDIA_CACHE_CONTROL, upsert: true, contentType: f.type });
    setBusy(false);
    if (error) return alert(error.message);
    setFolder("library");
    load("library");
    e.target.value = "";
  }

  const copy = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopied(path);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="mt-6 space-y-5">
      {cropperUi}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          {busy ? "Uploading…" : "⬆ Upload image"}
          <input type="file" accept="image/*" onChange={onUpload} className="hidden" disabled={busy} />
        </label>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">Folder:</span>
          <select value={folder} onChange={(e) => setFolder(e.target.value)} className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm">
            {FOLDERS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <span className="text-xs text-slate-400">{files.length} file(s)</span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        {files.map((p) => (
          <figure key={p} className="group overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="relative aspect-square bg-slate-100">
              <Image src={mediaUrl(p)} alt={p} fill sizes="200px" className="object-cover" />
            </div>
            <figcaption className="p-1.5">
              <button onClick={() => copy(p)} className="w-full truncate rounded bg-slate-100 px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-200" title={p}>
                {copied === p ? "✓ Copied path" : p.split("/").pop()}
              </button>
            </figcaption>
          </figure>
        ))}
        {files.length === 0 && <p className="col-span-full py-8 text-center text-sm text-slate-400">No files in this folder yet.</p>}
      </div>
    </div>
  );
}
