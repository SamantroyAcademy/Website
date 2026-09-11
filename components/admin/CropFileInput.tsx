"use client";

import { useEffect, useRef, useState } from "react";
import { useImageCropper } from "./useImageCropper";

/**
 * File picker that always routes the chosen image through the crop dialog and
 * then shows the result, so the admin sees exactly what the site will show
 * before saving. Hands the parent the already-cropped File.
 */
export default function CropFileInput({
  file,
  onPick,
  aspect,
  label,
  round = false,
  existing,
  buttonLabel = "Choose image",
}: {
  file: File | null;
  onPick: (f: File | null) => void;
  aspect?: number;
  /** Where the image appears, shown inside the crop dialog. */
  label?: string;
  round?: boolean;
  /** URL of the image already saved on this record, shown until a new one is picked. */
  existing?: string;
  buttonLabel?: string;
}) {
  const { crop, cropperUi } = useImageCropper();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.files?.[0];
    // Cleared straight away so picking the same file twice still fires.
    e.target.value = "";
    if (!raw) return;
    const cropped = await crop(raw, { aspect, label, round });
    if (cropped) onPick(cropped);
  }

  const shown = previewUrl || existing || "";

  return (
    <div>
      {cropperUi}
      <div className="flex items-center gap-3">
        {shown && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={shown}
            alt=""
            className={`h-16 shrink-0 border border-slate-200 bg-slate-100 object-cover ${round ? "w-16 rounded-full" : "rounded-md"}`}
            style={aspect && !round ? { width: 64 * aspect } : undefined}
          />
        )}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {shown ? "Replace image" : buttonLabel}
          </button>
          {file && (
            <button type="button" onClick={() => onPick(null)} className="text-xs font-medium text-red-600 hover:underline">
              Clear
            </button>
          )}
          <input ref={inputRef} type="file" accept="image/*" onChange={onChange} className="hidden" />
        </div>
      </div>
      <p className="mt-1 text-[11px] text-slate-400">
        You&apos;ll be able to crop, zoom and rotate before it is saved.
      </p>
    </div>
  );
}
