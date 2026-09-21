"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { bustCmsCache } from "@/lib/revalidate-client";
import { COUNTDOWN, type CountdownDoc } from "@/lib/countdown-defaults";

/** On/off switch for the batches popup shown when the site opens. Saves the
 *  moment it is flipped (no Save button), changing only the popup setting of
 *  the countdown document, so the dates and colours are left as they are.
 *  Used on the Countdown page and the Enquiry Popup page. */
export default function BatchesPopupSwitch({ initial, onChange }: { initial: boolean; onChange?: (on: boolean) => void }) {
  const [on, setOn] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function flip() {
    const next = !on;
    setBusy(true);
    setMsg(null);
    const supabase = createClient();
    // Read the latest document first so nothing else in it is overwritten.
    const { data, error: readError } = await supabase.from("site_content").select("draft, published").eq("key", "countdown").maybeSingle();
    if (readError) { setBusy(false); return setMsg({ ok: false, text: readError.message }); }
    const base = (data?.published && Object.keys(data.published).length ? data.published : COUNTDOWN) as CountdownDoc;
    const draft = (data?.draft && Object.keys(data.draft).length ? data.draft : base) as CountdownDoc;
    const popup = next ? "on" : "off";
    const { error } = await supabase.from("site_content").upsert(
      { key: "countdown", label: "Batch & Exam Countdown", draft: { ...draft, popup }, published: { ...base, popup } },
      { onConflict: "key" },
    );
    setBusy(false);
    if (error) return setMsg({ ok: false, text: error.message });
    setOn(next);
    onChange?.(next);
    setMsg({ ok: true, text: next ? "On: the batches popup shows when the site opens." : "Off: visitors will not see the batches popup." });
    void bustCmsCache();
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label="Batches popup"
        onClick={flip}
        disabled={busy}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-60 ${on ? "bg-green-600" : "bg-slate-300"}`}
      >
        <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-[left] ${on ? "left-[1.4rem]" : "left-0.5"}`} />
      </button>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">Batches popup: {busy ? "saving…" : on ? "On" : "Off"}</p>
        <p className="text-xs text-slate-500">
          Shows the upcoming batches (from Batch &amp; Exam Countdown) once per visit, right after the intro and before the enquiry form.
        </p>
      </div>
      {msg && <p className={`w-full text-xs font-medium ${msg.ok ? "text-green-700" : "text-red-700"}`}>{msg.text}</p>}
    </div>
  );
}
