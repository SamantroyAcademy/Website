/** Geometry for the admin image cropper.
 *
 *  Pure and dependency-free so it can be unit-tested without a DOM.
 *
 *  The frame's shape is fixed by whichever section the image belongs to — the
 *  admin only ever moves and zooms. Zoom 1 is "the image exactly covers the
 *  frame"; zooming below that shrinks the image inside the frame and the gap
 *  is painted with a background colour, so an awkwardly-shaped photo can still
 *  be used whole without ever changing the frame's ratio.
 */

export type CropInput = {
  /** Source size after any 90° rotation has been applied. */
  imageW: number;
  imageH: number;
  /** The frame on screen. */
  viewW: number;
  viewH: number;
  /** 1 = image exactly covers the frame; below 1 leaves background showing. */
  zoom: number;
  /** Pan, in screen pixels, of the image centre from the frame centre. */
  offsetX: number;
  offsetY: number;
};

const usable = (i: Pick<CropInput, "imageW" | "imageH" | "viewW" | "viewH">) =>
  i.imageW > 0 && i.imageH > 0 && i.viewW > 0 && i.viewH > 0;

/** Scale at which the image just covers the frame (edges may overflow). */
export function coverScale(i: Pick<CropInput, "imageW" | "imageH" | "viewW" | "viewH">): number {
  if (!usable(i)) return 1;
  return Math.max(i.viewW / i.imageW, i.viewH / i.imageH);
}

/** Scale at which the whole image fits inside the frame (gaps may show). */
export function containScale(i: Pick<CropInput, "imageW" | "imageH" | "viewW" | "viewH">): number {
  if (!usable(i)) return 1;
  return Math.min(i.viewW / i.imageW, i.viewH / i.imageH);
}

/**
 * Lowest zoom worth offering: the point where the entire image is visible.
 * Always ≤ 1, and exactly 1 when the photo already matches the frame's shape
 * (there is nothing to zoom out of).
 */
export function minZoom(i: Pick<CropInput, "imageW" | "imageH" | "viewW" | "viewH">): number {
  if (!usable(i)) return 1;
  return containScale(i) / coverScale(i);
}

/**
 * How far the image may be panned on each axis.
 *
 * The absolute difference covers both directions at once: when the image
 * overflows the frame you may pan across the overflow, and when it is smaller
 * than the frame you may position it anywhere inside — either way it can never
 * be dragged past an edge.
 */
export function panBounds(i: CropInput): { maxX: number; maxY: number } {
  const s = coverScale(i) * i.zoom;
  return {
    maxX: Math.abs(i.imageW * s - i.viewW) / 2,
    maxY: Math.abs(i.imageH * s - i.viewH) / 2,
  };
}

/** Clamp a pan to those bounds. */
export function clampOffset(i: CropInput): { x: number; y: number } {
  const { maxX, maxY } = panBounds(i);
  return {
    x: Math.min(maxX, Math.max(-maxX, i.offsetX)),
    y: Math.min(maxY, Math.max(-maxY, i.offsetY)),
  };
}

/**
 * Size of the exported canvas. Always the frame's shape, and never larger than
 * the source resolution the frame is showing — so a crop is never upscaled.
 */
export function outputSize(i: CropInput, maxEdge: number): { width: number; height: number } {
  if (!usable(i)) return { width: 1, height: 1 };
  const s = coverScale(i) * i.zoom;
  let w = i.viewW / s; // source pixels spanned by the frame
  let h = w * (i.viewH / i.viewW); // keep the frame's ratio exactly
  const k = Math.min(1, maxEdge / Math.max(w, h));
  return {
    width: Math.max(1, Math.round(w * k)),
    height: Math.max(1, Math.round(h * k)),
  };
}

/**
 * Where to paint the image on that canvas. Anything the image does not cover
 * is the background colour, which is why this returns a destination rectangle
 * rather than a source crop.
 */
export function drawRect(
  i: CropInput,
  out: { width: number; height: number },
): { dx: number; dy: number; dw: number; dh: number } {
  const s = coverScale(i) * i.zoom;
  const k = i.viewW > 0 ? out.width / i.viewW : 1; // output px per screen px
  const dw = i.imageW * s * k;
  const dh = i.imageH * s * k;
  return {
    dx: out.width / 2 + i.offsetX * k - dw / 2,
    dy: out.height / 2 + i.offsetY * k - dh / 2,
    dw,
    dh,
  };
}

/**
 * Largest box of a given shape that fits inside the space available.
 *
 * The crop frame is sized from this rather than by CSS: a percentage
 * max-height cannot resolve against a flex parent with no definite height, so
 * the frame kept its natural size and flex centring spilled it over the
 * dialog's header and buttons.
 */
export function fitBox(avail: { w: number; h: number }, ratio: number): { w: number; h: number } {
  if (avail.w <= 0 || avail.h <= 0 || !(ratio > 0) || !Number.isFinite(ratio)) return { w: 0, h: 0 };
  const w = Math.min(avail.w, avail.h * ratio);
  return { w, h: w / ratio };
}
