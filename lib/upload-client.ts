"use client";

/** Upload a file from the admin straight to Cloudflare R2.
 *  1. Ask our server for a five-minute signed URL (admins only).
 *  2. PUT the file to R2 directly, so the bytes never pass through Vercel.
 *  Returns the same `{ error }` shape the Supabase Storage client did. */
export async function uploadMedia(key: string, file: Blob): Promise<{ error: { message: string } | null }> {
  try {
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, contentType: file.type, size: file.size }),
    });
    const data = (await res.json().catch(() => ({}))) as { url?: string; headers?: Record<string, string>; error?: string };
    if (!res.ok || !data.url) return { error: { message: data.error || "Could not start the upload." } };

    const put = await fetch(data.url, { method: "PUT", headers: data.headers, body: file });
    if (!put.ok) return { error: { message: `Upload failed (${put.status}). Please try again.` } };
    return { error: null };
  } catch {
    return { error: { message: "Network error while uploading. Please try again." } };
  }
}

/** Delete a media-library file. Refused (with the reason) while the site uses it. */
export async function deleteMedia(key: string): Promise<{ error: string | null }> {
  try {
    const res = await fetch("/api/admin/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    if (res.ok) return { error: null };
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    return { error: data.error || "Could not delete the file." };
  } catch {
    return { error: "Network error. Please try again." };
  }
}

/** Keys in one media-library folder, newest first. */
export async function listMedia(folder: string): Promise<string[]> {
  const res = await fetch(`/api/admin/media?folder=${encodeURIComponent(folder)}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = (await res.json().catch(() => ({}))) as { keys?: string[] };
  return data.keys ?? [];
}
