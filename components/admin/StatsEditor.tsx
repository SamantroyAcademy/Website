"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { bustCmsCache } from "@/lib/revalidate-client";

type Stat = { value: number; label: string; suffix?: string };

export default function StatsEditor({ initial }: { initial: Stat[] }) {
  const supabase = createClient();
  const [items, setItems] = useState<Stat[]>(initial.length ? initial : [{ value: 0, label: "", suffix: "+" }]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const update = (i: number, patch: Partial<Stat>) =>
    setItems((s) => s.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const add = () => setItems((s) => [...s, { value: 0, label: "", suffix: "+" }]);
  const remove = (i: number) => setItems((s) => s.filter((_, j) => j !== i));
  const move = (i: number, d: -1 | 1) => {
    const j = i + d; if (j < 0 || j >= items.length) return;
    const copy = [...items]; [copy[i], copy[j]] = [copy[j], copy[i]]; setItems(copy);
  };

  async function save() {
    setBusy(true); setMsg(null);
    const doc = { items };
    const { error } = await supabase.from("site_content").upsert({
      key: "stats", label: "Scoreboard Stats", draft: doc, published: doc,
    });
    setBusy(false);
    if (error) return setMsg({ ok: false, text: error.message });
    setMsg({ ok: true, text: "Saved & published — live on the site." }); void bustCmsCache();
  }

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <span className="w-24">Number</span><span className="w-14 text-center">After</span><span className="flex-1">Label</span>
      </div>
      <div className="space-y-3">
        {items.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <input type="number" value={s.value} onChange={(e) => update(i, { value: Number(e.target.value) })}
              className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500" placeholder="Number" />
            <input value={s.suffix ?? "+"} onChange={(e) => update(i, { suffix: e.target.value })}
              className="w-14 rounded-lg border border-slate-300 px-2 py-2 text-center text-sm outline-none focus:border-brand-500"
              title="Shown right after the number — blank it out for an exact figure" placeholder="+" />
            <input value={s.label} onChange={(e) => update(i, { label: e.target.value })}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500" placeholder="Label (e.g. Recommendations)" />
            <button onClick={() => move(i, -1)} className="rounded border border-slate-200 px-1.5 text-slate-600 hover:bg-slate-50">↑</button>
            <button onClick={() => move(i, 1)} className="rounded border border-slate-200 px-1.5 text-slate-600 hover:bg-slate-50">↓</button>
            <button onClick={() => remove(i)} className="rounded border border-red-200 px-1.5 text-xs text-red-600 hover:bg-red-50">✕</button>
          </div>
        ))}
      </div>
      <button onClick={add} className="mt-3 text-sm font-medium text-brand-600 hover:text-brand-800">+ Add stat</button>

      {msg && <p className={`mt-4 rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{msg.text}</p>}
      <div className="mt-4">
        <button onClick={save} disabled={busy} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
          {busy ? "Saving…" : "Save & publish"}
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-400">
        These are the “The Scoreboard Speaks” cards under <b>Proof, Not Promises</b>. The first four also appear as
        the plates under the homepage hero. The <b>After</b> box is printed straight after the number — keep “+” for
        an approximate figure, or clear it to show an exact one.
      </p>
    </div>
  );
}
