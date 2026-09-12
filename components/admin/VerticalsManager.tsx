"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { bustCmsCache } from "@/lib/revalidate-client";
import { mediaUrl } from "@/lib/supabase/media";
import { compressImage } from "@/lib/image-client";
import { useImageCropper, FRAMES } from "./useImageCropper";
import type { VerticalsDoc, VerticalCard } from "@/lib/verticals";
import { TONE_OPTIONS, type Tone } from "@/lib/data";
import { ICON_OPTIONS } from "@/lib/icons";
import { asArray } from "@/lib/shape";
import { uploadMedia } from "@/lib/upload-client";

const BLANK: VerticalCard = {
  name: "", motto: "", desc: "", image: "", alt: "", tone: "army", icon: "star", entries: [], link: "/exams",
};

const input = "w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm";

export default function VerticalsManager({ initial }: { initial: VerticalsDoc }) {
  const supabase = createClient();
  const { crop, cropperUi } = useImageCropper();
  const [doc, setDoc] = useState<VerticalsDoc>(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const cards = asArray<VerticalCard>(doc.cards);
  const setHead = (patch: Partial<VerticalsDoc>) => setDoc((d) => ({ ...d, ...patch }));
  const setCards = (next: VerticalCard[]) => setDoc((d) => ({ ...d, cards: next }));
  const setCard = (i: number, patch: Partial<VerticalCard>) => setCards(cards.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= cards.length) return;
    const c = [...cards];
    [c[i], c[j]] = [c[j], c[i]];
    setCards(c);
  };

  async function uploadImage(i: number, file: File) {
    const picked = await crop(file, { aspect: FRAMES.force, label: "a vertical card" });
    if (!picked) return;
    setBusy(true); setMsg(null);
    try {
      const f = await compressImage(picked);
      const path = `verticals/${Date.now()}-${Math.random().toString(36).slice(2, 6)}.webp`;
      const { error } = await uploadMedia(path, f);
      if (error) throw new Error(error.message);
      setCard(i, { image: path });
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Upload failed." });
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    setBusy(true); setMsg(null);
    const { error } = await supabase.from("site_content").upsert(
      { key: "verticals", label: "Six Verticals", draft: doc, published: doc },
      { onConflict: "key" },
    );
    setBusy(false);
    setMsg(error ? { ok: false, text: error.message } : { ok: true, text: "Saved and published. Live on the homepage." });
    if (!error) void bustCmsCache();
  }

  return (
    <div className="mt-6 space-y-6">
      {cropperUi}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-base font-semibold text-slate-900">Section heading</h2>
        <div className="grid gap-3">
          <label className="text-xs font-medium text-slate-500">Kicker (optional)
            <input value={doc.kicker} onChange={(e) => setHead({ kicker: e.target.value })} className={`mt-1 block ${input} py-2`} />
          </label>
          <label className="text-xs font-medium text-slate-500">Title (HTML allowed, e.g. &lt;span class=&quot;hl&quot;&gt;word&lt;/span&gt;)
            <input value={doc.title} onChange={(e) => setHead({ title: e.target.value })} className={`mt-1 block ${input} py-2`} />
          </label>
          <label className="text-xs font-medium text-slate-500">Subtitle
            <textarea value={doc.subtitle} onChange={(e) => setHead({ subtitle: e.target.value })} rows={2} className={`mt-1 block ${input} py-2`} />
          </label>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {cards.map((c, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md bg-slate-100">
                {c.image && <Image src={mediaUrl(c.image)} alt="" fill sizes="80px" className="object-cover" />}
              </div>
              <input value={c.name} onChange={(e) => setCard(i, { name: e.target.value })} placeholder="Vertical name" className={`${input} font-semibold`} />
              <div className="flex shrink-0 gap-1">
                <button type="button" onClick={() => move(i, -1)} aria-label="Move up" className="rounded border border-slate-200 px-1.5 text-slate-600 hover:bg-slate-100">↑</button>
                <button type="button" onClick={() => move(i, 1)} aria-label="Move down" className="rounded border border-slate-200 px-1.5 text-slate-600 hover:bg-slate-100">↓</button>
                <button type="button" onClick={() => confirm("Remove this card?") && setCards(cards.filter((_, j) => j !== i))} aria-label="Remove" className="rounded border border-red-200 px-1.5 text-xs text-red-600 hover:bg-red-50">✕</button>
              </div>
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs text-slate-500">Icon
                  <select value={c.icon} onChange={(e) => setCard(i, { icon: e.target.value })} className={`mt-1 ${input}`}>
                    {ICON_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </label>
                <label className="text-xs text-slate-500">Colour theme
                  <select value={c.tone} onChange={(e) => setCard(i, { tone: e.target.value as Tone })} className={`mt-1 ${input}`}>
                    {TONE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </label>
              </div>
              <input value={c.motto} onChange={(e) => setCard(i, { motto: e.target.value })} placeholder="Line under the name (e.g. SSC GD Constable)" className={input} />
              <textarea value={c.desc} onChange={(e) => setCard(i, { desc: e.target.value })} rows={2} placeholder="Description" className={input} />
              <input value={asArray<string>(c.entries).join(", ")} onChange={(e) => setCard(i, { entries: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                placeholder="Exam chips (comma-separated)" className={input} />
              <input value={c.link} onChange={(e) => setCard(i, { link: e.target.value })} placeholder="Link (e.g. /exams?vertical=capf)" className={input} />
              <input value={c.alt} onChange={(e) => setCard(i, { alt: e.target.value })} placeholder="Photo description (for screen readers)" className={input} />
              <label className="text-xs text-slate-500">Photo
                <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) uploadImage(i, f); }}
                  className="mt-1 block w-full text-sm file:mr-3 file:rounded file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-slate-700" />
              </label>
            </div>
          </div>
        ))}
      </div>

      <button type="button" onClick={() => setCards([...cards, { ...BLANK }])} className="text-sm font-medium text-brand-600 hover:text-brand-800">
        + Add a card
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
