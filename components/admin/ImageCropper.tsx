"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { clampOffset, coverScale, drawRect, fitBox, minZoom, outputSize } from "@/lib/crop";

/** Longest edge kept from the source before cropping — bounds canvas memory
 *  on phone photos without visibly softening anything we output. */
const MAX_SOURCE = 2600;
/** Longest edge of the exported image. */
const MAX_OUTPUT = 1800;

/** Backdrop colours for the gaps left when a photo is zoomed out below the
 *  frame. Cream and navy match the two backgrounds used across the site. */
const BACKDROPS = ["#ffffff", "#faf6ec", "#0a1524", "#000000", "#e8e2d4"];

export type CropOptions = {
  /** Width ÷ height of the frame this image lands in. Fixed by the section —
   *  never editable, so what the admin sees is what the site renders. */
  aspect?: number;
  /** Shown in the dialog so the admin knows where the image will appear. */
  label?: string;
  /** Set for avatars so the preview is masked as a circle. */
  round?: boolean;
};

/** Downscale the picked file once, so panning stays smooth on big photos. */
async function loadSource(file: File): Promise<HTMLCanvasElement> {
  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;
  const longest = Math.max(width, height);
  if (longest > MAX_SOURCE) {
    const s = MAX_SOURCE / longest;
    width = Math.round(width * s);
    height = Math.round(height * s);
  }
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  c.getContext("2d")?.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return c;
}

/** The source rotated by a multiple of 90°, so the maths stays arithmetic. */
function rotateCanvas(src: HTMLCanvasElement, deg: number): HTMLCanvasElement {
  if (deg % 360 === 0) return src;
  const quarter = ((deg % 360) + 360) % 360;
  const swap = quarter === 90 || quarter === 270;
  const out = document.createElement("canvas");
  out.width = swap ? src.height : src.width;
  out.height = swap ? src.width : src.height;
  const ctx = out.getContext("2d");
  if (!ctx) return src;
  ctx.translate(out.width / 2, out.height / 2);
  ctx.rotate((quarter * Math.PI) / 180);
  ctx.drawImage(src, -src.width / 2, -src.height / 2);
  return out;
}

export default function ImageCropper({
  file,
  aspect,
  label,
  round = false,
  onDone,
}: CropOptions & { file: File; onDone: (result: File | null) => void }) {
  const [source, setSource] = useState<HTMLCanvasElement | null>(null);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [backdrop, setBackdrop] = useState(BACKDROPS[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const boxRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  /** The space the frame may occupy. Measured rather than left to CSS: a
   *  percentage max-height cannot resolve against a flex parent with no
   *  definite height, which let the frame keep its natural size and spill over
   *  the header and buttons. */
  const [avail, setAvail] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const measure = () => setAvail({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let alive = true;
    loadSource(file)
      .then((c) => alive && setSource(c))
      .catch(() => alive && setError("That image could not be read. Try a JPG or PNG."));
    return () => {
      alive = false;
    };
  }, [file]);

  // Memoised: without this the whole image would be re-rotated on every
  // pointer move, which stutters badly on a large photo.
  const rotated = useMemo(() => (source ? rotateCanvas(source, rotation) : null), [source, rotation]);
  // The preview must be the ROTATED pixels — it is displayed at the rotated
  // dimensions, so showing the original here would stretch it.
  const preview = useMemo(() => (rotated ? rotated.toDataURL("image/webp", 0.9) : ""), [rotated]);
  const effW = rotated?.width ?? 0;
  const effH = rotated?.height ?? 0;

  /** Fixed by the destination. With no destination shape (the media library)
   *  the photo keeps its own, so nothing is cropped away by surprise. */
  const boxRatio = aspect ?? (effW && effH ? effW / effH : 1);

  /** Largest box of the required shape that fits the space available. */
  const view = useMemo(() => fitBox(avail, boxRatio), [avail, boxRatio]);

  const cover = coverScale({ imageW: effW, imageH: effH, viewW: view.w, viewH: view.h });
  const floor = minZoom({ imageW: effW, imageH: effH, viewW: view.w, viewH: view.h });

  // A fresh rotation restarts from "fills the frame".
  useEffect(() => {
    setOffset({ x: 0, y: 0 });
    setZoom(1);
  }, [rotation]);

  const clamp = useCallback(
    (next: { x: number; y: number }, z: number) => {
      if (!effW || !view.w) return next;
      return clampOffset({
        imageW: effW,
        imageH: effH,
        viewW: view.w,
        viewH: view.h,
        zoom: z,
        offsetX: next.x,
        offsetY: next.y,
      });
    },
    [effW, effH, view.w, view.h],
  );

  useEffect(() => {
    setOffset((o) => clamp(o, zoom));
  }, [zoom, clamp]);

  function onPointerDown(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  }
  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d) return;
    setOffset(clamp({ x: d.ox + (e.clientX - d.x), y: d.oy + (e.clientY - d.y) }, zoom));
  }
  const endDrag = () => {
    drag.current = null;
  };

  /** True once the photo no longer fills the frame — the backdrop is showing. */
  const showsBackdrop = zoom < 0.999 && floor < 0.999;

  async function apply() {
    if (!rotated || !view.w) return;
    setBusy(true);
    setError(null);
    try {
      const input = {
        imageW: effW,
        imageH: effH,
        viewW: view.w,
        viewH: view.h,
        zoom,
        offsetX: offset.x,
        offsetY: offset.y,
      };
      const size = outputSize(input, MAX_OUTPUT);
      const rect = drawRect(input, size);

      const out = document.createElement("canvas");
      out.width = size.width;
      out.height = size.height;
      const ctx = out.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");
      // Paint the backdrop first: whatever the photo does not cover keeps the
      // frame's exact ratio instead of leaving transparent edges.
      ctx.fillStyle = backdrop;
      ctx.fillRect(0, 0, out.width, out.height);
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(rotated, rect.dx, rect.dy, rect.dw, rect.dh);

      const blob: Blob | null = await new Promise((r) => out.toBlob(r, "image/webp", 0.9));
      if (!blob) throw new Error("Could not export the image");
      onDone(new File([blob], file.name.replace(/\.\w+$/, "") + ".webp", { type: "image/webp" }));
    } catch (err) {
      setBusy(false);
      setError(err instanceof Error ? err.message : "Could not process that image.");
    }
  }

  const btn =
    "rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40";
  const step = (d: number) => setZoom((z) => Math.min(4, Math.max(floor, Number((z + d).toFixed(3)))));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 p-2 sm:p-4">
      {/* One window: the dialog never exceeds the viewport and never scrolls —
          the frame simply takes whatever height the fixed chrome leaves. */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Position and crop image"
        className="flex h-[calc(100dvh-1rem)] max-h-[46rem] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:h-[calc(100dvh-2rem)]"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-2.5">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold text-slate-900">Position &amp; crop</h2>
            <p className="truncate text-[11px] text-slate-500">
              {label ? `Frame used by ${label}` : "Drag to move · zoom to fit"}
            </p>
          </div>
          <button
            onClick={() => onDone(null)}
            className="shrink-0 rounded-full px-2 text-xl leading-none text-slate-400 hover:text-slate-700"
            aria-label="Cancel"
          >
            ✕
          </button>
        </div>

        {/* The frame — fixed to the destination's shape, sized to fit whatever
            space is left, so it works on a phone as well as a desktop. */}
        <div className="relative min-h-0 flex-1 bg-slate-50">
          <div ref={boxRef} className="absolute inset-3 flex items-center justify-center overflow-hidden">
            <div
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              className={`relative shrink-0 cursor-move touch-none select-none overflow-hidden ${round ? "rounded-full" : "rounded-lg"}`}
              style={{ width: view.w, height: view.h, background: backdrop }}
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt=""
                  draggable={false}
                  className="pointer-events-none absolute left-1/2 top-1/2 max-w-none"
                  style={{
                    width: effW,
                    height: effH,
                    transform: `translate(-50%,-50%) translate(${offset.x}px, ${offset.y}px) scale(${cover * zoom})`,
                    transformOrigin: "center",
                  }}
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-sm text-slate-400">Loading…</div>
              )}
              {!round && (
                <div className="pointer-events-none absolute inset-0 border border-white/40" aria-hidden>
                  <div className="absolute inset-y-0 left-1/3 w-px bg-white/25" />
                  <div className="absolute inset-y-0 left-2/3 w-px bg-white/25" />
                  <div className="absolute inset-x-0 top-1/3 h-px bg-white/25" />
                  <div className="absolute inset-x-0 top-2/3 h-px bg-white/25" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-slate-100 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => step(-0.1)} disabled={zoom <= floor + 0.001} className={btn} title="Zoom out">
              −
            </button>
            <input
              type="range"
              min={floor}
              max={4}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="min-w-0 flex-1 accent-brand-600"
              aria-label="Zoom"
            />
            <button type="button" onClick={() => step(0.1)} disabled={zoom >= 4} className={btn} title="Zoom in">
              +
            </button>
            <button type="button" onClick={() => setRotation((r) => r - 90)} className={btn} title="Rotate left">
              ↺
            </button>
            <button type="button" onClick={() => setRotation((r) => r + 90)} className={btn} title="Rotate right">
              ↻
            </button>
          </div>

          {/* Only relevant once the photo has been zoomed past "fills the frame". */}
          {showsBackdrop && (
            <div className="mt-2 flex items-center gap-2">
              <span className="shrink-0 text-[11px] font-medium text-slate-500">Background</span>
              {BACKDROPS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setBackdrop(c)}
                  aria-label={`Background ${c}`}
                  className={`h-5 w-5 rounded-full border ${backdrop === c ? "ring-2 ring-brand-500 ring-offset-1" : "border-slate-300"}`}
                  style={{ background: c }}
                />
              ))}
              <input
                type="color"
                value={backdrop}
                onChange={(e) => setBackdrop(e.target.value)}
                className="h-6 w-8 cursor-pointer rounded border border-slate-300 bg-white p-0.5"
                aria-label="Custom background colour"
              />
            </div>
          )}

          {error && <p className="mt-2 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs text-red-700">{error}</p>}

          <div className="mt-2.5 flex justify-end gap-2">
            <button type="button" onClick={() => onDone(null)} className={btn} disabled={busy}>
              Cancel
            </button>
            <button
              type="button"
              onClick={apply}
              disabled={busy || !source}
              className="rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {busy ? "Working…" : "Use this image"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
