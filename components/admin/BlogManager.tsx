"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { bustCmsCache } from "@/lib/revalidate-client";
import { mediaUrl } from "@/lib/supabase/media";
import { compressImage } from "@/lib/image-client";
import CropFileInput from "./CropFileInput";
import { FRAMES } from "./useImageCropper";
import RichText from "./RichText";
import { uploadMedia } from "@/lib/upload-client";

export type Post = {
  id: string; slug: string; title: string; excerpt: string | null;
  cover_path: string | null; body: string; tag: string | null;
  author: string | null; published: boolean; published_at: string | null;
};

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const empty = { title: "", slug: "", excerpt: "", tag: "", author: "", body: "" };

export default function BlogManager({ initial }: { initial: Post[] }) {
  const supabase = createClient();
  const [posts, setPosts] = useState<Post[]>(initial);
  const [form, setForm] = useState({ ...empty });
  const [file, setFile] = useState<File | null>(null);
  const [existingCover, setExistingCover] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const reset = () => { setForm({ ...empty }); setFile(null); setExistingCover(null); setEditingId(null); };

  function edit(p: Post) {
    setForm({ title: p.title, slug: p.slug, excerpt: p.excerpt ?? "", tag: p.tag ?? "", author: p.author ?? "", body: p.body });
    setExistingCover(p.cover_path);
    setFile(null);
    setEditingId(p.id);
    setMsg(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function uploadCover(f: File): Promise<string> {
    const c = await compressImage(f);
    const path = `blog/${Date.now()}-${slugify(form.title || "post")}.webp`;
    const { error } = await uploadMedia(path, c);
    if (error) throw new Error(error.message);
    return path;
  }

  async function save(publish: boolean) {
    if (!form.title.trim()) return setMsg({ ok: false, text: "Title is required." });
    setBusy(true); setMsg(null);
    try {
      const cover_path = file ? await uploadCover(file) : existingCover;
      const slug = (form.slug.trim() || slugify(form.title));
      const payload = {
        title: form.title.trim(),
        slug,
        excerpt: form.excerpt.trim() || null,
        tag: form.tag.trim() || null,
        author: form.author.trim() || null,
        body: form.body,
        cover_path,
        published: publish,
        published_at: publish ? new Date().toISOString() : null,
      };
      if (editingId) {
        const { data, error } = await supabase.from("posts").update(payload).eq("id", editingId).select("*").single();
        if (error) throw new Error(error.message);
        setPosts((ps) => ps.map((p) => (p.id === editingId ? (data as Post) : p)));
      } else {
        const { data, error } = await supabase.from("posts").insert(payload).select("*").single();
        if (error) throw new Error(error.message);
        setPosts((ps) => [data as Post, ...ps]);
      }
      setMsg({ ok: true, text: publish ? "Published — live on /blog." : "Saved as draft." }); void bustCmsCache();
      reset();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Failed to save." });
    } finally {
      setBusy(false);
    }
  }

  async function togglePublish(p: Post) {
    const next = !p.published;
    setPosts((ps) => ps.map((x) => (x.id === p.id ? { ...x, published: next } : x)));
    await supabase.from("posts").update({ published: next, published_at: next ? new Date().toISOString() : p.published_at }).eq("id", p.id); void bustCmsCache();
  }

  async function remove(id: string) {
    if (!confirm("Delete this post?")) return;
    const prev = posts;
    setPosts((ps) => ps.filter((p) => p.id !== id));
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) { setPosts(prev); alert(error.message); }
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">{editingId ? "Edit article" : "New article"}</h2>
          {editingId && <button onClick={reset} className="text-xs font-medium text-slate-500 hover:text-slate-800">Cancel edit</button>}
        </div>
        <div className="grid gap-4">
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value, slug: editingId ? f.slug : slugify(e.target.value) }))}
            placeholder="Article title" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500" />
          <div className="grid gap-4 sm:grid-cols-3">
            <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))} placeholder="url-slug"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500" />
            <input value={form.tag} onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))} placeholder="Tag (e.g. Psychology)"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500" />
            <input value={form.author} onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))} placeholder="Author"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500" />
          </div>
          <textarea value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} rows={2}
            placeholder="Short excerpt shown on the blog list…" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500" />
          <div className="flex items-center gap-3">
            {existingCover && !file && (
              <div className="relative h-14 w-24 overflow-hidden rounded-md bg-slate-100">
                <Image src={mediaUrl(existingCover)} alt="" fill sizes="96px" className="object-cover" />
              </div>
            )}
            <CropFileInput file={file} onPick={setFile} aspect={FRAMES.blogCover} label="the blog cover" buttonLabel="Choose cover image" />
            <span className="text-xs text-slate-400">Cover image</span>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Article body</label>
            <RichText key={editingId ?? "new"} value={form.body} onChange={(html) => setForm((f) => ({ ...f, body: html }))} />
          </div>
        </div>
        {msg && <p className={`mt-3 rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{msg.text}</p>}
        <div className="mt-4 flex gap-2">
          <button onClick={() => save(false)} disabled={busy} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">Save draft</button>
          <button onClick={() => save(true)} disabled={busy} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">{busy ? "Saving…" : "Publish"}</button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-base font-semibold text-slate-900">Articles ({posts.length})</h2>
        <ul className="divide-y divide-slate-100">
          {posts.map((p) => (
            <li key={p.id} className="flex items-center gap-3 py-3">
              <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded bg-slate-100">
                {p.cover_path && <Image src={mediaUrl(p.cover_path)} alt="" fill sizes="64px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{p.title}</p>
                <p className="truncate text-xs text-slate-500">/blog/{p.slug}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${p.published ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>{p.published ? "Live" : "Draft"}</span>
              <button onClick={() => edit(p)} className="rounded border border-slate-200 px-2 py-0.5 text-xs font-medium text-brand-600 hover:bg-brand-50">Edit</button>
              <button onClick={() => togglePublish(p)} className="rounded border border-slate-200 px-1.5 text-xs hover:bg-slate-50">{p.published ? "🚫" : "🚀"}</button>
              <button onClick={() => remove(p.id)} className="rounded border border-red-200 px-1.5 text-xs text-red-600 hover:bg-red-50">✕</button>
            </li>
          ))}
          {posts.length === 0 && <li className="py-6 text-center text-sm text-slate-400">No articles yet — write your first above.</li>}
        </ul>
      </div>
    </div>
  );
}
