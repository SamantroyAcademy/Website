"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { bustCmsCache } from "@/lib/revalidate-client";
import { CONTACT_FORM, type ContactField, type ContactFormDoc } from "@/lib/form-defaults";

const HINTS: Record<ContactField["key"], string> = {
  name: "The aspirant's full name.",
  phone: "Callback number — validated as 10–15 digits.",
  email: "Used to reply and to send the auto-acknowledgement.",
  entry: "Dropdown — options are the Target Entry list below.",
  batch: "Dropdown — online or offline (options below).",
  status: "Dropdown — fresher or repeater (options below).",
  message: "Free-text box shown under the grid.",
};

/** Editor for the contact page form AND the enquiry popup — both render the
 *  same document, so one save updates both. */
export default function ContactFormManager({ initial }: { initial: ContactFormDoc }) {
  const supabase = createClient();
  const [doc, setDoc] = useState<ContactFormDoc>(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const setField = (key: ContactField["key"], patch: Partial<ContactField>) =>
    setDoc((d) => ({ ...d, fields: d.fields.map((f) => (f.key === key ? { ...f, ...patch } : f)) }));

  const setList = (key: "entryOptions" | "batchOptions" | "statusOptions", text: string) =>
    setDoc((d) => ({ ...d, [key]: text.split("\n").map((s) => s.trim()).filter(Boolean) }));

  async function save() {
    setBusy(true);
    setMsg(null);
    const { error } = await supabase.from("site_content").upsert(
      { key: "contact_form", label: "Contact & Enquiry Form", draft: doc, published: doc },
      { onConflict: "key" },
    );
    setBusy(false);
    if (error) return setMsg({ ok: false, text: error.message });
    setMsg({ ok: true, text: "Saved & published — live on the contact page and the enquiry popup." });
    void bustCmsCache();
  }

  function resetDefaults() {
    setDoc(CONTACT_FORM);
    setMsg({ ok: true, text: "Reset to the built-in defaults — press Save & publish to apply." });
  }

  const ListBox = ({
    id,
    label,
    hint,
    value,
  }: {
    id: "entryOptions" | "batchOptions" | "statusOptions";
    label: string;
    hint: string;
    value: string[];
  }) => (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <label className="block text-sm font-semibold text-slate-800">{label}</label>
      <p className="mb-2 mt-0.5 text-xs text-slate-500">{hint}</p>
      <textarea
        value={value.join("\n")}
        onChange={(e) => setList(id, e.target.value)}
        rows={Math.min(Math.max(value.length + 1, 4), 14)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs outline-none focus:border-brand-500"
      />
      <p className="mt-1 text-xs text-slate-400">{value.length} option(s) — one per line.</p>
    </div>
  );

  return (
    <div className="mt-6 space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-bold text-slate-900">Fields</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Rename a field, change its placeholder, mark it mandatory (a red <b className="text-red-600">*</b> appears
            next to the label and an empty submit is blocked), or hide it entirely.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {doc.fields.map((f) => (
            <div key={f.key} className="grid gap-3 p-4 sm:grid-cols-[1fr_1.3fr_auto_auto]">
              <div>
                <label className="text-xs text-slate-500">Label</label>
                <input
                  value={f.label}
                  onChange={(e) => setField(f.key, { label: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                />
                <p className="mt-1 text-[11px] text-slate-400">{HINTS[f.key]}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500">
                  {f.key === "entry" || f.key === "batch" || f.key === "status" ? "Dropdown prompt" : "Placeholder"}
                </label>
                <input
                  value={f.placeholder}
                  onChange={(e) => setField(f.key, { placeholder: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                />
              </div>
              <label className="flex items-end gap-2 pb-1.5 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={f.required}
                  onChange={(e) => setField(f.key, { required: e.target.checked })}
                  className="h-4 w-4"
                />
                Mandatory <span className="text-red-600">*</span>
              </label>
              <label className="flex items-end gap-2 pb-1.5 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={f.enabled}
                  onChange={(e) => setField(f.key, { enabled: e.target.checked })}
                  className="h-4 w-4"
                />
                Show
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ListBox id="entryOptions" label="Target Entry options" hint="Everything an aspirant can pick in the Target Entry dropdown." value={doc.entryOptions} />
        <ListBox id="batchOptions" label="Preferred Batch options" hint="Usually offline and online." value={doc.batchOptions} />
        <ListBox id="statusOptions" label="Current Status options" hint="Usually fresher and repeater." value={doc.statusOptions} />
      </div>

      <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <label className="text-xs text-slate-500">
          Submit button text
          <input
            value={doc.submitLabel}
            onChange={(e) => setDoc((d) => ({ ...d, submitLabel: e.target.value }))}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
          />
        </label>
        <label className="text-xs text-slate-500">
          Privacy note under the button
          <input
            value={doc.privacyNote}
            onChange={(e) => setDoc((d) => ({ ...d, privacyNote: e.target.value }))}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
          />
        </label>
        <label className="text-xs text-slate-500 sm:col-span-2">
          Thank-you message after a successful submit
          <input
            value={doc.successMessage}
            onChange={(e) => setDoc((d) => ({ ...d, successMessage: e.target.value }))}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
          />
        </label>
      </div>

      {msg && (
        <p className={`rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {msg.text}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button onClick={save} disabled={busy} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
          {busy ? "Saving…" : "Save & publish"}
        </button>
        <button onClick={resetDefaults} disabled={busy} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
          Reset to defaults
        </button>
      </div>
    </div>
  );
}
