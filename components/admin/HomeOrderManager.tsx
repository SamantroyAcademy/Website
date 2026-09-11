"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { bustCmsCache } from "@/lib/revalidate-client";
import { HOME_SECTIONS, type HomeOrderItem } from "@/lib/homepage-order";

const META = new Map(HOME_SECTIONS.map((s) => [s.key, s]));

export default function HomeOrderManager({ initial }: { initial: HomeOrderItem[] }) {
  const supabase = createClient();
  const [items, setItems] = useState<HomeOrderItem[]>(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const move = (i: number, d: -1 | 1) => {
    const j = i + d; if (j < 0 || j >= items.length) return;
    const c = [...items]; [c[i], c[j]] = [c[j], c[i]]; setItems(c);
  };
  const toggle = (i: number) =>
    setItems((s) => s.map((x, j) => (j === i ? { ...x, enabled: !x.enabled } : x)));

  async function save() {
    setBusy(true); setMsg(null);
    const doc = { items };
    const { error } = await supabase.from("site_content").upsert(
      { key: "homepage_order", label: "Homepage Section Order", draft: doc, published: doc },
      { onConflict: "key" },
    );
    setBusy(false);
    if (error) return setMsg({ ok: false, text: error.message });
    setMsg({ ok: true, text: "Saved & published — the homepage now uses this order." });
    void bustCmsCache();
  }

  return (
    <div className="mt-6 space-y-4">
      <p className="rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-800">
        Drag order with the arrows. Use the eye to hide a section without deleting it.
        The <b>Hero</b> is always first and cannot be moved.
      </p>

      <ol className="space-y-2">
        <li className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
          <span className="w-6 text-center text-xs font-bold text-slate-400">—</span>
          <span className="flex-1 text-sm font-semibold text-slate-500">Hero (fixed)</span>
          <Link href="/admin/sections/hero" className="text-xs font-medium text-brand-600 hover:underline">Edit</Link>
        </li>

        {items.map((it, i) => {
          const m = META.get(it.key);
          return (
            <li key={it.key} className={`flex items-center gap-3 rounded-xl border bg-white p-3 ${it.enabled ? "border-slate-200" : "border-dashed border-slate-300 opacity-60"}`}>
              <span className="w-6 text-center text-xs font-bold text-slate-400">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">{m?.label ?? it.key}</p>
                {m?.hint && <p className="truncate text-xs text-slate-400">{m.hint}</p>}
              </div>
              {m?.editHref && (
                <Link href={m.editHref} className="shrink-0 text-xs font-medium text-brand-600 hover:underline">Edit</Link>
              )}
              <button onClick={() => toggle(i)} title={it.enabled ? "Hide section" : "Show section"}
                className="shrink-0 rounded border border-slate-200 px-1.5 text-xs hover:bg-slate-50">
                {it.enabled ? "👁" : "🚫"}
              </button>
              <div className="flex shrink-0 gap-1">
                <button onClick={() => move(i, -1)} className="rounded border border-slate-200 px-1.5 text-slate-600 hover:bg-slate-50">↑</button>
                <button onClick={() => move(i, 1)} className="rounded border border-slate-200 px-1.5 text-slate-600 hover:bg-slate-50">↓</button>
              </div>
            </li>
          );
        })}
      </ol>

      {msg && <p className={`rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{msg.text}</p>}
      <button onClick={save} disabled={busy} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
        {busy ? "Saving…" : "Save & publish"}
      </button>
    </div>
  );
}
