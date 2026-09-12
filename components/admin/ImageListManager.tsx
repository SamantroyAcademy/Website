"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { bustCmsCache } from "@/lib/revalidate-client";
import { mediaUrl } from "@/lib/supabase/media";
import { compressImage } from "@/lib/image-client";
import { asArray } from "@/lib/shape";
import { useImageCropper, FRAMES } from "./useImageCropper";
import { uploadMedia } from "@/lib/upload-client";


/** Thumbnail shapes. The frame matches the artwork so nothing is cropped and
 *  the admin can actually read the names on wide banner images. */
const SHAPES = {
  square: { box: "aspect-square", grid: "grid-cols-2 sm:grid-cols-4 lg:grid-cols-5", size: "220px", ratio: 1 },
  tall: { box: "aspect-[2/3]", grid: "grid-cols-2 sm:grid-cols-4 lg:grid-cols-6", size: "200px", ratio: 2 / 3 },
  wide: { box: "aspect-[3/1]", grid: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3", size: "560px", ratio: 3 },
} as const;

/** Reusable "a list of images" editor for simple gallery-style CMS docs. */
export default function ImageListManager({
  initial,
  docKey,
  label,
  folder,
  note,
  shape = "square",
  cropAspect,
  cropLabel,
}: {
  initial: string[];
  docKey: string;
  label: string;
  folder: string;
  note?: string;
  shape?: keyof typeof SHAPES;
  /** Frame ratio the admin crops to; defaults to the thumbnail's own shape. */
  cropAspect?: number;
  cropLabel?: string;
}) {
  const thumb = SHAPES[shape];
  const { crop, cropperUi } = useImageCropper();
  const aspect = cropAspect ?? thumb.ratio;
  const supabase = createClient();
  const [images, setImages] = useState<string[]>(asArray<string>(initial));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setBusy(true);
    setMsg(null);
    try {
      const added: string[] = [];
      for (const raw of files) {
        // One crop dialog per file, in the frame's own shape.
        const picked = await crop(raw, { aspect, label: cropLabel ?? label });
        if (!picked) continue; // cancelled — skip this one
        const f = await compressImage(picked);
        const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.webp`;
        const { error } = await uploadMedia(path, f);
        if (error) throw new Error(error.message);
        added.push(path);
      }
      setImages((im) => [...im, ...added]);
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Upload failed." });
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= images.length) return;
    const c = [...images];
    [c[i], c[j]] = [c[j], c[i]];
    setImages(c);
  };
  const remove = (i: number) => setImages((im) => im.filter((_, j) => j !== i));

  async function save() {
    setBusy(true);
    setMsg(null);
    const doc = { images };
    const { error } = await supabase
      .from("site_content")
      .upsert({ key: docKey, label, draft: doc, published: doc }, { onConflict: "key" });
    setBusy(false);
    if (error) return setMsg({ ok: false, text: error.message });
    setMsg({ ok: true, text: "Saved & published — live on the site." });
    void bustCmsCache();
  }

  return (
    <div className="mt-6 space-y-5">
      {cropperUi}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          {busy ? "Working…" : "⬆ Upload images"}
          <input type="file" accept="image/*" multiple onChange={onUpload} className="hidden" disabled={busy} />
        </label>
        {note && <p className="mt-2 text-xs text-slate-400">{note}</p>}
      </div>

      {images.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
          No images yet — the site is showing the built-in defaults.
        </p>
      ) : (
        <div className={`grid gap-4 ${thumb.grid}`}>
          {images.map((p, i) => (
            <figure key={p + i} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              {/* object-contain, not cover: the whole image must stay readable
                  here even when its shape differs from the frame. */}
              <div className={`relative ${thumb.box} bg-slate-800`}>
                <Image src={mediaUrl(p)} alt="" fill sizes={thumb.size} className="object-contain" />
              </div>
              <figcaption className="flex items-center justify-between gap-1 p-1.5">
                <div className="flex items-center gap-1">
                  {/* Position, so the order is legible while reordering. */}
                  <span className="rounded bg-slate-100 px-1.5 text-xs font-semibold text-slate-500">{i + 1}</span>
                  <button onClick={() => move(i, -1)} disabled={i === 0}
                    className="rounded border border-slate-200 px-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-30">←</button>
                  <button onClick={() => move(i, 1)} disabled={i === images.length - 1}
                    className="rounded border border-slate-200 px-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-30">→</button>
                </div>
                <button onClick={() => remove(i)} className="rounded border border-red-200 px-1.5 text-xs text-red-600 hover:bg-red-50">✕</button>
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      {msg && <p className={`rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{msg.text}</p>}
      <button onClick={save} disabled={busy} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
        {busy ? "Saving…" : "Save & publish"}
      </button>
    </div>
  );
}
