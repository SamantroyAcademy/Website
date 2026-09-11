"use client";

/** Client-side image compression: downscale to maxDim and re-encode as WebP.
 *  Keeps uploads small & fast. Falls back to the original on any failure. */
export async function compressImage(
  file: File,
  { maxDim = 1600, quality = 0.82 }: { maxDim?: number; quality?: number } = {},
): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") {
    return file;
  }
  try {
    const img = await createImageBitmap(file);
    let { width, height } = img;
    const longest = Math.max(width, height);
    if (longest > maxDim) {
      const scale = maxDim / longest;
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, width, height);
    const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/webp", quality));
    if (!blob || blob.size >= file.size) return file; // don't upsize
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".webp", { type: "image/webp" });
  } catch {
    return file;
  }
}
