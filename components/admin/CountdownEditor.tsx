"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { bustCmsCache } from "@/lib/revalidate-client";
import type { CountdownDoc, CountdownItem } from "@/lib/countdown-defaults";
import BatchesPopupSwitch from "./BatchesPopupSwitch";

export default function CountdownEditor({ initial }: { initial: CountdownDoc }) {
  const supabase = createClient();
  const [kicker, setKicker] = useState(initial.kicker ?? "Mark your calendar");
  const [heading, setHeading] = useState(initial.heading);
  const [bg, setBg] = useState(initial.bg ?? "#0a1524");
  const [textColor, setTextColor] = useState(initial.textColor ?? "#ffffff");
  const [kickerColor, setKickerColor] = useState(initial.kickerColor ?? "#f2d519");
  const [popup, setPopup] = useState(initial.popup !== "off");
  const [items, setItems] = useState<CountdownItem[]>(
    initial.items.length ? initial.items : [{ label: "", date: "", kind: "exam" }],
  );
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const update = (i: number, patch: Partial<CountdownItem>) =>
    setItems((s) => s.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const add = () => setItems((s) => [...s, { label: "", date: "", kind: "exam" }]);
  const remove = (i: number) => setItems((s) => s.filter((_, j) => j !== i));

  async function save() {
    setBusy(true); setMsg(null);
    const doc: CountdownDoc = { kicker, heading, bg, textColor, kickerColor, popup: popup ? "on" : "off", items: items.filter((i) => i.label && i.date) };
    const { error } = await supabase.from("site_content").upsert({
      key: "countdown", label: "Batch & Exam Countdown", draft: doc, published: doc,
    });
    setBusy(false);
    if (error) return setMsg({ ok: false, text: error.message });
    setMsg({ ok: true, text: "Saved & published — live on the site." }); void bustCmsCache();
  }

  return (
    <>
    {/* Saves on its own the moment it is flipped; Save & publish keeps it. */}
    <div className="mt-6"><BatchesPopupSwitch initial={popup} onChange={setPopup} /></div>
    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-medium text-slate-500">Kicker
          <input value={kicker} onChange={(e) => setKicker(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500" />
        </label>
        <label className="text-xs font-medium text-slate-500">Section heading
          <input value={heading} onChange={(e) => setHeading(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500" />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-5 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Section colours</span>
        <label className="flex items-center gap-2 text-xs text-slate-600">
          Background
          <input type="color" value={bg} onChange={(e) => setBg(e.target.value)}
            className="h-7 w-9 cursor-pointer rounded border border-slate-300 bg-transparent p-0.5" />
        </label>
        <label className="flex items-center gap-2 text-xs text-slate-600">
          All text &amp; numbers
          <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)}
            className="h-7 w-9 cursor-pointer rounded border border-slate-300 bg-transparent p-0.5" />
        </label>
        <label className="flex items-center gap-2 text-xs text-slate-600">
          Kicker
          <input type="color" value={kickerColor} onChange={(e) => setKickerColor(e.target.value)}
            className="h-7 w-9 cursor-pointer rounded border border-slate-300 bg-transparent p-0.5" />
        </label>
      </div>

      {/* Live preview so colour choices are obvious before publishing */}
      <div className="mt-3 rounded-lg p-4 text-center" style={{ background: bg }}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: kickerColor }}>{kicker}</p>
        <p className="mt-1 text-lg font-bold" style={{ color: textColor }}>{heading}</p>
        <p className="mt-2 font-mono text-2xl font-bold" style={{ color: textColor }}>02 10 30 03</p>
      </div>

      <p className="mt-4 mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Dates</p>

      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2">
            <input value={it.label} onChange={(e) => update(i, { label: e.target.value })}
              placeholder="Label (e.g. AFCAT 2 2026)"
              className="min-w-[180px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500" />
            <input type="date" value={it.date} onChange={(e) => update(i, { date: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500" />
            <select value={it.kind ?? "exam"} onChange={(e) => update(i, { kind: e.target.value as "exam" | "batch" })}
              className="rounded-lg border border-slate-300 px-2 py-2 text-sm">
              <option value="exam">Exam</option>
              <option value="batch">Batch</option>
            </select>
            <label className="flex items-center gap-1 text-xs text-slate-500" title="Card background">
              BG
              <input type="color" value={it.bg || "#0a1524"} onChange={(e) => update(i, { bg: e.target.value })}
                className="h-7 w-8 cursor-pointer rounded border border-slate-300 bg-transparent p-0.5" />
            </label>
            <label className="flex items-center gap-1 text-xs text-slate-500" title="Text colour">
              Text
              <input type="color" value={it.fg || "#ffffff"} onChange={(e) => update(i, { fg: e.target.value })}
                className="h-7 w-8 cursor-pointer rounded border border-slate-300 bg-transparent p-0.5" />
            </label>
            <button onClick={() => remove(i)} className="rounded border border-red-200 px-1.5 text-xs text-red-600 hover:bg-red-50">✕</button>
          </div>
        ))}
      </div>
      <button onClick={add} className="mt-3 text-sm font-medium text-brand-600 hover:text-brand-800">+ Add date</button>

      {msg && <p className={`mt-4 rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{msg.text}</p>}
      <div className="mt-4">
        <button onClick={save} disabled={busy} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
          {busy ? "Saving…" : "Save & publish"}
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-400">Live ticking countdowns appear on the homepage, auto-sorted by nearest date. Past dates show “passed”. Per-card BG/Text colours override the section colours above.</p>
    </div>
    </>
  );
}
