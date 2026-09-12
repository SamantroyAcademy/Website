/** Rules for what may be uploaded to R2 and under which key. Plain functions
 *  with no imports so the upload route and the unit tests share them. */

/** Every upload lives one folder deep: "candidates/1718000000000-name.webp". */
const KEY_RE = /^[a-z0-9][a-z0-9-]{1,39}\/[A-Za-z0-9][A-Za-z0-9._-]{0,159}$/;

const MB = 1024 * 1024;

/** Content types the admin may upload, with a size ceiling for each. SVG is
 *  left out on purpose: it can carry script. */
export const UPLOAD_TYPES: Record<string, number> = {
  "image/jpeg": 10 * MB,
  "image/png": 10 * MB,
  "image/webp": 10 * MB,
  "image/avif": 10 * MB,
  "image/gif": 10 * MB,
  "application/pdf": 25 * MB,
};

/** Objects never change once written (every key carries a timestamp), so
 *  browsers may keep them for a year. */
export const UPLOAD_CACHE_CONTROL = "public, max-age=31536000, immutable";

export const isValidKey = (key: unknown): key is string =>
  typeof key === "string" && KEY_RE.test(key) && !key.includes("..");

export const isValidFolder = (folder: unknown): folder is string =>
  typeof folder === "string" && /^[a-z0-9][a-z0-9-]{1,39}$/.test(folder);

/** Returns an error message, or null when the upload is acceptable. */
export function checkUpload(key: unknown, contentType: unknown, size: unknown): string | null {
  if (!isValidKey(key)) return "Invalid file name.";
  if (typeof contentType !== "string" || !(contentType in UPLOAD_TYPES)) return "Only JPG, PNG, WEBP, AVIF, GIF and PDF files can be uploaded.";
  if (typeof size !== "number" || !Number.isInteger(size) || size <= 0) return "Empty file.";
  const max = UPLOAD_TYPES[contentType];
  if (size > max) return `File is too large (max ${Math.round(max / MB)} MB).`;
  return null;
}
