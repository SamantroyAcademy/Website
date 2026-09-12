"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { bustCmsCache } from "@/lib/revalidate-client";
import { youtubeId } from "@/lib/youtube";
import { cleanTitle, type ShortItem, type ShortsDoc } from "@/lib/shorts";

type Found = { id: string; title: string; kind: "short" | "video"; published?: string };

const input = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
const thumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

/** Student stories on the homepage: paste a Short or video link (title and
 *  thumbnail are fetched from YouTube), or import from a channel and tick
 *  the ones to show. Reorder, retitle, remove, then save to publish. */
export default function ShortsManager({ initial }: { initial: ShortsDoc }) {
  const supabase = createClient();
  const [items, setItems] = useState<ShortItem[]>(initial.items);
  const [channelUrl, setChannelUrl] = useState(initial.channelUrl);
  const [link, setLink] = useState("");
  const [found, setFound] = useState<Found[] | null>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const has = (id: string) => items.some((s) => s.id === id);
  const set = (i: number, patch: Partial<ShortItem>) => setItems((s) => s.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const remove = (i: number) => setItems((s) => s.filter((_, j) => j !== i));
  const move = (i: number, d: -1 | 1) => {
    const j = i + d; if (j < 0 || j >= items.length) return;
    const c = [...items]; [c[i], c[j]] = [c[j], c[i]]; setItems(c);
  };

  async function addLink() {
    const id = youtubeId(link);
    if (!id) return setMsg({ ok: false, text: "Paste a YouTube Shorts or video link." });
    if (has(id)) return setMsg({ ok: false, text: "That video is already in the list." });
    setBusy(true); setMsg(null);
    try {
      const res = await fetch("/api/resources/youtube", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: link }) });
      const data = (await res.json()) as { title?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Could not read that video.");
      setItems((s) => [{ id, title: cleanTitle(data.title ?? "") || "Student story", url: `https://www.youtube.com/shorts/${id}` }, ...s]);
      setLink("");
      setMsg({ ok: true, text: "Added at the top. Save to publish." });
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Could not add that link." });
    } finally { setBusy(false); }
  }

  async function importChannel() {
    setBusy(true); setMsg(null); setFound(null);
    try {
      const res = await fetch(`/api/admin/youtube-channel?url=${encodeURIComponent(channelUrl)}`);
      const data = (await res.json()) as { items?: Found[]; error?: string };
      if (!res.ok || !data.items) throw new Error(data.error || "Could not read that channel.");
      setFound(data.items);
      setPicked(new Set());
      if (!data.items.length) setMsg({ ok: false, text: "No videos found on that channel." });
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Could not read that channel." });
    } finally { setBusy(false); }
  }

  function addPicked() {
    const add = (found ?? []).filter((f) => picked.has(f.id) && !has(f.id))
      .map((f) => ({ id: f.id, title: f.title, url: `https://www.youtube.com/shorts/${f.id}` }));
    setItems((s) => [...add, ...s]);
    setFound(null);
    setMsg({ ok: true, text: `${add.length} added at the top. Save to publish.` });
  }

  async function save() {
    setBusy(true); setMsg(null);
    const doc: ShortsDoc = { channelUrl: channelUrl.trim(), items: items.filter((s) => s.id).map((s) => ({ ...s, title: s.title.trim() })) };
    const { error } = await supabase.from("site_content").upsert(
      { key: "shorts", label: "Student Stories (YouTube Shorts)", draft: doc, published: doc },
      { onConflict: "key" },
    );
    setBusy(false);
    if (error) return setMsg({ ok: false, text: error.message });
    setMsg({ ok: true, text: "Saved and published. Live on the homepage." });
    void bustCmsCache();
  }

  return (
    <div className="mt-6 space-y-5">
      <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 lg:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Add one link</label>
          <div className="flex gap-2">
            <input value={link} onChange={(e) => setLink(e.target.value)} className={input} placeholder="https://www.youtube.com/shorts/..." />
            <button type="button" onClick={addLink} disabled={busy || !link.trim()} className="shrink-0 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">Add</button>
          </div>
          <p className="mt-1 text-xs text-slate-500">Shorts or normal video links. The title and thumbnail come from YouTube.</p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Import from a channel</label>
          <div className="flex gap-2">
            <input value={channelUrl} onChange={(e) => setChannelUrl(e.target.value)} className={input} placeholder="https://www.youtube.com/@channel" />
            <button type="button" onClick={importChannel} disabled={busy || !channelUrl.trim()} className="shrink-0 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
              {busy ? "Working…" : "Fetch latest"}
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-500">Lists the channel&apos;s Shorts and newest uploads to pick from.</p>
        </div>
      </div>

      {found && found.length > 0 && (
        <div className="rounded-xl border border-brand-200 bg-brand-50/40 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-800">Pick the videos to show ({picked.size} selected)</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setFound(null)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-white">Cancel</button>
              <button type="button" onClick={addPicked} disabled={!picked.size} className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">Add selected</button>
            </div>
          </div>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {found.map((f) => {
              const already = has(f.id);
              return (
                <li key={f.id}>
                  <label className={`flex items-center gap-3 rounded-lg border bg-white p-2 ${already ? "opacity-50" : "cursor-pointer hover:border-brand-300"}`}>
                    <input type="checkbox" disabled={already} checked={picked.has(f.id)}
                      onChange={(e) => setPicked((p) => { const n = new Set(p); if (e.target.checked) n.add(f.id); else n.delete(f.id); return n; })} />
                    <span className="relative h-14 w-10 shrink-0 overflow-hidden rounded bg-slate-100">
                      <Image src={thumb(f.id)} alt="" fill sizes="40px" className="object-cover" />
                    </span>
                    <span className="min-w-0">
                      <span className="line-clamp-2 text-sm text-slate-800">{f.title}</span>
                      <span className="text-xs text-slate-400">{f.kind === "short" ? "Short" : "Video"}{f.published ? ` · ${f.published.slice(0, 10)}` : ""}{already ? " · already added" : ""}</span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-base font-semibold text-slate-900">On the homepage ({items.length})</h2>
        {items.length === 0 && <p className="mt-3 text-sm text-slate-500">Nothing yet. The section stays hidden until you add a video.</p>}
        <ul className="mt-4 space-y-2">
          {items.map((s, i) => (
            <li key={s.id} className="flex items-center gap-3 rounded-lg border border-slate-200 p-2">
              <span className="relative h-16 w-12 shrink-0 overflow-hidden rounded bg-slate-100">
                <Image src={thumb(s.id)} alt="" fill sizes="48px" className="object-cover" />
              </span>
              <input value={s.title} onChange={(e) => set(i, { title: e.target.value })} className={input} aria-label="Title" />
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-xs text-brand-700 underline">Open</a>
              <div className="flex shrink-0 gap-1">
                <button type="button" onClick={() => move(i, -1)} title="Move up" className="rounded border border-slate-200 px-1.5 text-slate-600 hover:bg-slate-50">↑</button>
                <button type="button" onClick={() => move(i, 1)} title="Move down" className="rounded border border-slate-200 px-1.5 text-slate-600 hover:bg-slate-50">↓</button>
                <button type="button" onClick={() => remove(i)} title="Remove" className="rounded border border-red-200 px-1.5 text-xs text-red-600 hover:bg-red-50">Remove</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center gap-3">
        <button type="button" onClick={save} disabled={busy} className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
          {busy ? "Saving…" : "Save and publish"}
        </button>
        {msg && <p className={`text-sm ${msg.ok ? "text-emerald-700" : "text-red-600"}`}>{msg.text}</p>}
      </div>
    </div>
  );
}
