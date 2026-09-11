"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { bustCmsCache } from "@/lib/revalidate-client";
import { asArray } from "@/lib/shape";
import { TONE_OPTIONS, type CourseItem, type Tone } from "@/lib/data";

/** Every field of a course card is editable, including price, highlight,
 *  button label and payment/enquiry link. Cards can be added, removed and
 *  reordered. Stored as site_content "courses_cards" { items }. */
export type CourseEdit = CourseItem;

const BLANK: CourseEdit = {
  tag: "", highlight: false, title: "", where: "", price: "", service: "army",
  desc: "", features: [], cta: "Enquire about this batch", enrollUrl: "",
};

const input = "mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";

export default function CoursesManager({ initial }: { initial: CourseEdit[] }) {
  const supabase = createClient();
  const [items, setItems] = useState<CourseEdit[]>(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const set = (i: number, patch: Partial<CourseEdit>) =>
    setItems((s) => s.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const c = [...items];
    [c[i], c[j]] = [c[j], c[i]];
    setItems(c);
  };

  async function save() {
    setBusy(true); setMsg(null);
    // Payment links must be absolute https URLs, never javascript: etc.
    const bad = items.find((c) => c.enrollUrl && !/^https:\/\//i.test(c.enrollUrl));
    if (bad) {
      setBusy(false);
      return setMsg({ ok: false, text: `The link on "${bad.title || "a course"}" must start with https://` });
    }
    const doc = { items };
    const { error } = await supabase.from("site_content").upsert(
      { key: "courses_cards", label: "Course Cards", draft: doc, published: doc },
      { onConflict: "key" },
    );
    setBusy(false);
    setMsg(error ? { ok: false, text: error.message } : { ok: true, text: "Saved and published. Live on the homepage and Courses page." });
    if (!error) void bustCmsCache();
  }

  return (
    <div className="mt-6 space-y-5">
      <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
        Leave the payment link blank to send the button to the enquiry form instead. Prices can be hidden site-wide under
        Pages and Sections, Course Prices.
      </p>

      {items.map((c, i) => (
        <div key={i} className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Course {i + 1}</h2>
            <div className="flex gap-1">
              <button type="button" onClick={() => move(i, -1)} aria-label="Move up" className="rounded border border-slate-200 px-1.5 text-slate-600 hover:bg-slate-100">↑</button>
              <button type="button" onClick={() => move(i, 1)} aria-label="Move down" className="rounded border border-slate-200 px-1.5 text-slate-600 hover:bg-slate-100">↓</button>
              <button type="button" onClick={() => confirm("Remove this course?") && setItems(items.filter((_, j) => j !== i))} aria-label="Remove" className="rounded border border-red-200 px-1.5 text-xs text-red-600 hover:bg-red-50">✕</button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-medium text-slate-500">Title
              <input value={c.title} onChange={(e) => set(i, { title: e.target.value })} className={input} />
            </label>
            <label className="text-xs font-medium text-slate-500">Badge
              <input value={c.tag} onChange={(e) => set(i, { tag: e.target.value })} className={input} placeholder="e.g. Most chosen" />
            </label>
            <label className="text-xs font-medium text-slate-500">Where / when
              <input value={c.where} onChange={(e) => set(i, { where: e.target.value })} className={input} />
            </label>
            <label className="text-xs font-medium text-slate-500">Price (text, e.g. ₹18,000 or Enquire)
              <input value={c.price ?? ""} onChange={(e) => set(i, { price: e.target.value })} className={input} />
            </label>
            <label className="text-xs font-medium text-slate-500">Button label
              <input value={c.cta} onChange={(e) => set(i, { cta: e.target.value })} className={input} />
            </label>
            <label className="text-xs font-medium text-slate-500">Payment link (optional, https://)
              <input value={c.enrollUrl ?? ""} onChange={(e) => set(i, { enrollUrl: e.target.value })} className={input} placeholder="https://pages.razorpay.com/..." />
            </label>
            <label className="text-xs font-medium text-slate-500">Colour theme
              <select value={c.service} onChange={(e) => set(i, { service: e.target.value as Tone })} className={input}>
                {TONE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2 self-end pb-2 text-sm text-slate-700">
              <input type="checkbox" checked={c.highlight} onChange={(e) => set(i, { highlight: e.target.checked })} />
              Highlight this card
            </label>
          </div>
          <label className="mt-3 block text-xs font-medium text-slate-500">Description
            <textarea value={c.desc} onChange={(e) => set(i, { desc: e.target.value })} rows={2} className={input} />
          </label>
          <label className="mt-3 block text-xs font-medium text-slate-500">Features (one per line)
            <textarea
              value={asArray<string>(c.features).join("\n")}
              onChange={(e) => set(i, { features: e.target.value.split("\n") })}
              onBlur={(e) => set(i, { features: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
              rows={5}
              className={input}
            />
          </label>
        </div>
      ))}

      <button type="button" onClick={() => setItems([...items, { ...BLANK, features: [] }])} className="text-sm font-medium text-brand-600 hover:text-brand-800">
        + Add a course
      </button>

      {msg && <p className={`rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{msg.text}</p>}
      <div>
        <button onClick={save} disabled={busy} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
          {busy ? "Saving…" : "Save & publish"}
        </button>
      </div>
    </div>
  );
}
