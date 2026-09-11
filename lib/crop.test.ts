import test from "node:test";
import assert from "node:assert/strict";
import {
  clampOffset,
  fitBox,
  containScale,
  coverScale,
  drawRect,
  minZoom,
  outputSize,
  type CropInput,
} from "./crop.ts";

/** A 4000×3000 photo (4:3) in a 600×200 frame (3:1) — the officer-banner case. */
const wide: CropInput = { imageW: 4000, imageH: 3000, viewW: 600, viewH: 200, zoom: 1, offsetX: 0, offsetY: 0 };
/** A portrait photo in a square frame — the candidate-wall case. */
const square: CropInput = { imageW: 1000, imageH: 1500, viewW: 400, viewH: 400, zoom: 1, offsetX: 0, offsetY: 0 };

const close = (a: number, b: number, msg?: string) =>
  assert.ok(Math.abs(a - b) < 0.001, `${msg ?? ""} expected ${b}, got ${a}`);

test("cover fills the frame, contain fits inside it", () => {
  close(coverScale(wide), 0.15); // 600/4000 beats 200/3000
  close(containScale(wide), 200 / 3000);
});

test("minimum zoom shows the whole image, and is 1 when shapes already match", () => {
  assert.ok(minZoom(wide) < 1, "a 4:3 photo in a 3:1 frame can be zoomed out");
  close(minZoom({ imageW: 900, imageH: 300, viewW: 600, viewH: 200 }), 1);
});

test("at zoom 1 the image covers the frame with nothing showing through", () => {
  const out = outputSize(wide, 1800);
  const r = drawRect(wide, out);
  assert.ok(r.dx <= 0.001 && r.dy <= 0.001, "no gap at the top-left");
  assert.ok(r.dx + r.dw >= out.width - 0.001, "no gap on the right");
  assert.ok(r.dy + r.dh >= out.height - 0.001, "no gap at the bottom");
});

test("at minimum zoom the whole image sits inside the frame", () => {
  const i = { ...wide, zoom: minZoom(wide) };
  const out = outputSize(i, 1800);
  const r = drawRect(i, out);
  assert.ok(r.dx >= -0.001 && r.dy >= -0.001, "image starts inside the canvas");
  assert.ok(r.dx + r.dw <= out.width + 0.001, "image ends inside the canvas");
  assert.ok(r.dy + r.dh <= out.height + 0.001, "image ends inside the canvas");
  // Which means background is visible on the left and right — the point of it.
  assert.ok(r.dx > 1, "background shows beside a photo that is too tall to fill");
});

test("the export always keeps the frame's ratio, whatever the photo's shape", () => {
  for (const i of [wide, square, { ...wide, zoom: 2 }, { ...square, zoom: minZoom(square) }]) {
    const out = outputSize(i, 1800);
    close(out.width / out.height, i.viewW / i.viewH, "frame ratio preserved");
  }
});

test("the export is capped, and is never upscaled past the source", () => {
  const out = outputSize(wide, 1800);
  assert.ok(Math.max(out.width, out.height) <= 1800);

  // A frame showing a small image must not invent pixels.
  const small = outputSize({ imageW: 300, imageH: 300, viewW: 400, viewH: 400, zoom: 1, offsetX: 0, offsetY: 0 }, 1800);
  assert.ok(small.width <= 300, `expected <= 300 source px, got ${small.width}`);
});

test("panning is bounded both when the image overflows and when it is smaller", () => {
  // Overflowing (zoom 1, 4:3 photo in a 3:1 frame): vertical slack only.
  const over = clampOffset({ ...wide, offsetX: 9999, offsetY: 9999 });
  close(over.x, 0, "width exactly fills the frame, so no horizontal pan");
  close(over.y, (3000 * 0.15 - 200) / 2);

  // Zoomed out past cover: the image is now narrower than the frame and may be
  // positioned within the background, but never dragged outside it.
  const i = { ...wide, zoom: minZoom(wide), offsetX: 9999, offsetY: 9999 };
  const c = clampOffset(i);
  const s = coverScale(i) * i.zoom;
  close(c.x, Math.abs(wide.imageW * s - wide.viewW) / 2);
  assert.ok(c.x > 0, "there is room to slide the image inside the frame");
});

test("panning moves the crop the opposite way, at source scale", () => {
  const out = outputSize(wide, 1800);
  const a = drawRect(wide, out);
  const b = drawRect({ ...wide, offsetY: 30 }, out);
  // Dragging down by 30 screen px moves the painted image down by 30 * k.
  close(b.dy - a.dy, 30 * (out.width / wide.viewW));
});

test("the crop frame always fits the space it is given", () => {
  const avail = { w: 488, h: 574 };
  for (const ratio of [1, 4 / 3, 3 / 4, 3, 5 / 7, 16 / 9]) {
    const box = fitBox(avail, ratio);
    assert.ok(box.w <= avail.w + 0.001, `ratio ${ratio}: too wide (${box.w} > ${avail.w})`);
    assert.ok(box.h <= avail.h + 0.001, `ratio ${ratio}: too tall (${box.h} > ${avail.h})`);
    close(box.w / box.h, ratio, `ratio ${ratio} preserved:`);
    // It must also be the LARGEST such box — one edge touches the boundary.
    const touches = Math.abs(box.w - avail.w) < 0.001 || Math.abs(box.h - avail.h) < 0.001;
    assert.ok(touches, `ratio ${ratio}: not using the full space`);
  }
});

test("an unmeasured or degenerate space yields no frame rather than a broken one", () => {
  assert.deepEqual(fitBox({ w: 0, h: 0 }, 1), { w: 0, h: 0 });
  assert.deepEqual(fitBox({ w: 400, h: 300 }, 0), { w: 0, h: 0 });
  assert.deepEqual(fitBox({ w: 400, h: 0 }, 1.5), { w: 0, h: 0 });
});
