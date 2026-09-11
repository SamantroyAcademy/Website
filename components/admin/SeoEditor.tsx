"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { bustCmsCache } from "@/lib/revalidate-client";
import { SEO_PAGES } from "@/lib/seo-pages";

type SeoDoc = { title: string; description: string };

export default function SeoEditor({ initial }: { initial: Record<string, SeoDoc> }) {
  const supabase = createClient();
  const [data, setData] = useState<Record<string, SeoDoc>>(initial);
  const [busy, setBusy] = useState<string>("");
  const [msg, setMsg] = useState<{ key: string; ok: boolean; text: string } | null>(null);

  const set = (key: string, patch: Partial<SeoDoc>) =>
    setData((d) => ({ ...d, [key]: { ...d[key], ...patch } }));

  async function save(key: string) {
    setBusy(key); setMsg(null);
    const doc = data[key];
    const { error } = await supabase.from("site_content").upsert({
      key: `seo.${key}`, label: `SEO — ${key}`, draft: doc, published: doc,
    });
    setBusy("");
    setMsg({ key, ok: !error, text: error ? error.message : "Saved & published." });
    if (!error) void bustCmsCache();
  }

  return (
    <div className="mt-6 space-y-5">
      {SEO_PAGES.map((p) => {
        const d = data[p.key];
        const titleLen = d.title.length, descLen = d.description.length;
        return (
          <div key={p.key} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">{p.label} <span className="font-normal text-slate-400">· {p.path}</span></h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <div className="mb-1 flex justify-between"><label className="text-sm font-medium text-slate-700">Title</label><span className={`text-xs ${titleLen > 60 ? "text-amber-600" : "text-slate-400"}`}>{titleLen}/60</span></div>
                  <input value={d.title} onChange={(e) => set(p.key, { title: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                </div>
                <div>
                  <div className="mb-1 flex justify-between"><label className="text-sm font-medium text-slate-700">Meta description</label><span className={`text-xs ${descLen > 160 ? "text-amber-600" : "text-slate-400"}`}>{descLen}/160</span></div>
                  <textarea value={d.description} onChange={(e) => set(p.key, { description: e.target.value })} rows={3}
                    className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                </div>
                <button onClick={() => save(p.key)} disabled={busy === p.key}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
                  {busy === p.key ? "Saving…" : "Save & publish"}
                </button>
                {msg?.key === p.key && <p className={`text-sm ${msg.ok ? "text-green-700" : "text-red-700"}`}>{msg.text}</p>}
              </div>

              {/* Google-style preview */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Google preview</p>
                <div className="rounded bg-white p-3 shadow-sm">
                  <p className="text-xs text-slate-600">www.samantroyacademy.com{p.path === "/" ? "" : p.path}</p>
                  <p className="truncate text-lg text-[#1a0dab]">{d.title}</p>
                  <p className="line-clamp-2 text-sm text-slate-600">{d.description}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
