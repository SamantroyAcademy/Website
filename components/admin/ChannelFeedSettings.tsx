"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { FeedMode } from "@/lib/shorts";

type Found = { id: string; title: string; kind: "short" | "video"; published?: string };

const input = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
const thumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

export type FeedSettingsValue = { channelUrl: string; mode: FeedMode; limit: number; shortsLimit?: number; hidden: string[] };

/** Channel, Automatic / Hand-picked, how many to show, and the channel's
 *  latest uploads with a Hide switch on each (Automatic mode). Shared by
 *  both YouTube sections in Admin, YouTube Channels. */
export default function ChannelFeedSettings({
  value,
  onChange,
  manualLabel,
  limitLabel,
  shortsLabel,
}: {
  value: FeedSettingsValue;
  onChange: (v: FeedSettingsValue) => void;
  manualLabel: string;
  limitLabel: string;
  /** Shown only when the section also has a Shorts strip. */
  shortsLabel?: string;
}) {
  const [found, setFound] = useState<Found[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (p: Partial<FeedSettingsValue>) => onChange({ ...value, ...p });
  const hidden = new Set(value.hidden);

  async function load() {
    if (!value.channelUrl.trim()) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/admin/youtube-channel?url=${encodeURIComponent(value.channelUrl)}`);
      const data = (await res.json()) as { items?: Found[]; error?: string };
      if (!res.ok || !data.items) throw new Error(data.error || "Could not read that channel.");
      // Newest first, the order the website uses.
      setFound([...data.items].sort((a, b) => (b.published ?? "").localeCompare(a.published ?? "")));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read that channel.");
    } finally { setLoading(false); }
  }

  // Show the channel's latest as soon as the page opens (Automatic mode).
  useEffect(() => { if (value.mode === "auto") void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const toggle = (id: string) => set({ hidden: hidden.has(id) ? value.hidden.filter((x) => x !== id) : [...value.hidden, id] });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">YouTube channel</label>
          <div className="flex gap-2">
            <input value={value.channelUrl} onChange={(e) => set({ channelUrl: e.target.value })} className={input} placeholder="https://www.youtube.com/@channel" />
            <button type="button" onClick={load} disabled={loading || !value.channelUrl.trim()}
              className="shrink-0 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
              {loading ? "Loading…" : "Show latest"}
            </button>
          </div>
        </div>
        <div>
          <span className="mb-1 block text-sm font-medium text-slate-700">What the website shows</span>
          <div className="flex overflow-hidden rounded-lg border border-slate-300 text-sm font-semibold">
            {(["auto", "manual"] as FeedMode[]).map((m) => (
              <button key={m} type="button" onClick={() => set({ mode: m })} aria-pressed={value.mode === m}
                className={`flex-1 px-3 py-2 ${value.mode === m ? "bg-brand-600 text-white" : "bg-white text-slate-700 hover:bg-slate-50"}`}>
                {m === "auto" ? "Automatic: newest uploads" : manualLabel}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="text-sm text-slate-700">{limitLabel}
          <input type="number" min={1} max={24} value={value.limit} onChange={(e) => set({ limit: Number(e.target.value) })}
            className="ml-2 w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-sm" />
        </label>
        {shortsLabel && value.shortsLimit !== undefined && (
          <label className="text-sm text-slate-700">{shortsLabel}
            <input type="number" min={0} max={24} value={value.shortsLimit} onChange={(e) => set({ shortsLimit: Number(e.target.value) })}
              className="ml-2 w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-sm" />
          </label>
        )}
      </div>

      {value.mode === "auto" && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs text-slate-600">
            New uploads appear on the website within an hour, with no work from you. Hide any you do not want shown; {hidden.size} hidden.
          </p>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          {found && (
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {found.map((f) => {
                const off = hidden.has(f.id);
                return (
                  <li key={f.id} className={`flex items-center gap-3 rounded-lg border bg-white p-2 ${off ? "border-dashed border-slate-300 opacity-60" : "border-slate-200"}`}>
                    <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded bg-slate-100">
                      <Image src={thumb(f.id)} alt="" fill sizes="64px" className="object-cover" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 text-sm text-slate-800">{f.title}</span>
                      <span className="text-xs text-slate-400">{f.kind === "short" ? "Short" : "Video"}{f.published ? ` · ${f.published.slice(0, 10)}` : ""}</span>
                    </span>
                    <button type="button" onClick={() => toggle(f.id)}
                      className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold ${off ? "bg-slate-800 text-white" : "border border-slate-300 text-slate-700 hover:bg-slate-50"}`}>
                      {off ? "Hidden" : "Hide"}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
