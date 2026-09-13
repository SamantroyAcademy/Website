"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { bustCmsCache } from "@/lib/revalidate-client";
import {
  BUILTIN_FIELDS,
  BUILTIN_KEYS,
  CONTACT_FORM,
  CUSTOM_TYPES,
  MAX_FIELDS,
  MAX_OPTIONS,
  PERMANENT_KEYS,
  cleanOptions,
  isBuiltin,
  newFieldKey,
  type ContactField,
  type ContactFormDoc,
  type FieldType,
} from "@/lib/form-defaults";

const TYPE_LABEL: Record<FieldType, string> = {
  text: "Short answer",
  textarea: "Paragraph",
  select: "Dropdown",
  number: "Number",
  phone: "Phone (+91)",
  email: "Email",
};

const HINTS: Record<string, string> = {
  name: "The aspirant's name. Always kept (you can rename or hide it).",
  phone: "Callback number, checked as a 10-digit Indian mobile. Always kept.",
  email: "Used to reply and to send the automatic acknowledgement.",
  entry: "Exam pages pre-select their own exam here.",
  batch: "Which batch they are interested in.",
  status: "Where they are in the recruitment process.",
  message: "A free-text box across the full width.",
};

const btn = "rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40";

/* ── Options of one dropdown ─────────────────────────────────────────────
   Declared at module level (not inside the editor) so typing never remounts
   the inputs and focus stays where it is. */
function OptionsEditor({ options, onChange }: { options: string[]; onChange: (next: string[]) => void }) {
  const [paste, setPaste] = useState<string | null>(null);
  // Long lists start folded; a new dropdown (no options yet) starts open.
  const [open, setOpen] = useState(options.filter((o) => o.trim()).length <= 1);
  const list = useRef<HTMLDivElement>(null);
  const focusLast = useRef(false);

  useEffect(() => {
    if (!focusLast.current) return;
    focusLast.current = false;
    const inputs = list.current?.querySelectorAll<HTMLInputElement>("input");
    inputs?.[inputs.length - 1]?.focus();
  }, [options.length]);

  const set = (i: number, v: string) => onChange(options.map((o, j) => (j === i ? v : o)));
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= options.length) return;
    const next = [...options];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const add = () => { focusLast.current = true; onChange([...options, ""]); };
  const dupes = new Set(options.filter((o, i) => o.trim() && options.findIndex((x) => x.trim().toLowerCase() === o.trim().toLowerCase()) !== i).map((o) => o.trim().toLowerCase()));

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex items-center gap-2 text-left">
          <span className={`text-[10px] text-slate-400 transition-transform ${open ? "rotate-90" : ""}`} aria-hidden>▶</span>
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Dropdown options ({options.filter((o) => o.trim()).length})</span>
        </button>
        {open && (
          <button type="button" onClick={() => setPaste(paste === null ? options.join("\n") : null)} className={btn}>
            {paste === null ? "Paste a list" : "Cancel paste"}
          </button>
        )}
      </div>

      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className="mt-1.5 block w-full truncate text-left text-xs text-slate-500 hover:text-slate-700">
          {options.filter((o) => o.trim()).slice(0, 6).join(" · ") || "No options yet"}
          {options.length > 6 ? ` · +${options.length - 6} more` : ""} <span className="font-semibold text-brand-600">Edit</span>
        </button>
      ) : paste !== null ? (
        <div className="mt-2">
          <textarea value={paste} onChange={(e) => setPaste(e.target.value)} rows={Math.min(Math.max(options.length + 2, 5), 14)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500" placeholder="One option per line" />
          <button type="button" onClick={() => { onChange(cleanOptions(paste.split("\n"))); setPaste(null); }}
            className="mt-2 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-900">
            Use this list
          </button>
          <span className="ml-2 text-xs text-slate-500">Replaces the options above: one per line, blank lines and repeats are dropped.</span>
        </div>
      ) : (
        <>
          <div ref={list} className="mt-2 space-y-1.5">
            {options.map((o, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-6 shrink-0 text-right text-xs text-slate-400">{i + 1}.</span>
                <input value={o} onChange={(e) => set(i, e.target.value)} maxLength={120}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (i === options.length - 1) add(); } }}
                  placeholder="Option text"
                  className={`min-w-0 flex-1 rounded-md border px-2.5 py-1.5 text-sm outline-none focus:border-brand-500 ${dupes.has(o.trim().toLowerCase()) ? "border-amber-400 bg-amber-50" : "border-slate-300 bg-white"}`} />
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move option up" className={btn}>↑</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === options.length - 1} aria-label="Move option down" className={btn}>↓</button>
                <button type="button" onClick={() => onChange(options.filter((_, j) => j !== i))} aria-label="Delete option"
                  className="rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">✕</button>
              </div>
            ))}
            {options.length === 0 && <p className="text-xs text-amber-700">No options yet. Add at least one.</p>}
          </div>
          <button type="button" onClick={add} disabled={options.length >= MAX_OPTIONS} className="mt-2 text-sm font-semibold text-brand-600 hover:text-brand-800 disabled:opacity-40">
            + Add option
          </button>
          {dupes.size > 0 && <span className="ml-3 text-xs text-amber-700">Repeated options are highlighted; repeats are dropped on save.</span>}
        </>
      )}
    </div>
  );
}

/** Editor for the contact page form AND the enquiry popup: both render the
 *  same document, so one save updates both. */
export default function ContactFormManager({ initial }: { initial: ContactFormDoc }) {
  const supabase = createClient();
  const [doc, setDoc] = useState<ContactFormDoc>(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  // The drop check runs before React re-renders, so it reads a ref.
  const dragRef = useRef<number | null>(null);

  const fields = doc.fields;
  const setFields = (next: ContactField[]) => setDoc((d) => ({ ...d, fields: next }));
  const patch = (key: string, p: Partial<ContactField>) => setFields(fields.map((f) => (f.key === key ? { ...f, ...p } : f)));
  const moveTo = (from: number, to: number) => {
    if (from === to || to < 0 || to >= fields.length) return;
    const next = [...fields];
    const [f] = next.splice(from, 1);
    next.splice(to, 0, f);
    setFields(next);
  };
  const remove = (f: ContactField) => {
    if (PERMANENT_KEYS.includes(f.key)) return;
    if (!confirm(`Delete the field "${f.label}"? Past enquiries keep their answers.`)) return;
    setFields(fields.filter((x) => x.key !== f.key));
  };
  const addCustom = (type: FieldType) => {
    if (fields.length >= MAX_FIELDS) return;
    const f: ContactField = { key: newFieldKey(), type, label: "", placeholder: type === "select" ? "Select one" : "", required: false, enabled: true, popup: false, ...(type === "select" ? { options: [""] } : {}) };
    setFields([...fields, f]);
    setMsg(null);
    // Take the admin straight to the new question's label.
    requestAnimationFrame(() => document.getElementById(`label-${f.key}`)?.focus());
  };
  const addBack = (key: (typeof BUILTIN_KEYS)[number]) => setFields([...fields, { ...BUILTIN_FIELDS[key] }]);
  const missingBuiltins = BUILTIN_KEYS.filter((k) => !fields.some((f) => f.key === k));
  const inPopup = fields.filter((f) => f.enabled && f.popup).length;

  function problems(): string[] {
    const out: string[] = [];
    for (const f of fields) {
      if (!f.label.trim()) out.push("Every field needs a label.");
      if (f.type === "select" && cleanOptions(f.options).length === 0) out.push(`"${f.label || "A dropdown"}" has no options.`);
    }
    return [...new Set(out)];
  }

  async function save() {
    const errs = problems();
    if (errs.length) return setMsg({ ok: false, text: errs.join(" ") });
    if (inPopup > 6 && !confirm(`The popup will show ${inPopup} fields, which may not fit one phone screen. Save anyway?`)) return;
    setBusy(true);
    setMsg(null);
    const clean: ContactFormDoc = {
      ...doc,
      version: 2,
      fields: fields.map((f) => ({ ...f, label: f.label.trim(), ...(f.type === "select" ? { options: cleanOptions(f.options) } : {}) })),
    };
    const { error } = await supabase.from("site_content").upsert(
      { key: "contact_form", label: "Contact & Enquiry Form", draft: clean, published: clean },
      { onConflict: "key" },
    );
    setBusy(false);
    if (error) return setMsg({ ok: false, text: error.message });
    setDoc(clean);
    setMsg({ ok: true, text: "Saved & published: live on the contact page and the enquiry popup." });
    void bustCmsCache();
  }

  function resetDefaults() {
    if (!confirm("Replace every field and option with the built-in defaults? Nothing changes on the site until you press Save & publish.")) return;
    setDoc(CONTACT_FORM);
    setMsg({ ok: true, text: "Reset to the built-in defaults. Press Save & publish to apply." });
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-bold text-slate-900">Fields, in the order visitors see them</h2>
            <p className={`text-xs ${inPopup > 6 ? "font-semibold text-amber-700" : "text-slate-500"}`}>{fields.length} fields · {inPopup} in the popup</p>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Drag a field by its handle (or use ↑ ↓) to reorder. <b>Show</b> puts it on the forms; <b>In popup</b> also puts
            it in the enquiry popup (keep that to 4 or 5 so it fits a phone screen); <b>Mandatory</b> makes it required.
            Name and phone are always kept; any other field can be deleted and added back.
          </p>
        </div>

        <ol className="divide-y divide-slate-100">
          {fields.map((f, i) => (
            <li
              key={f.key}
              onDragOver={(e) => { if (dragRef.current !== null) { e.preventDefault(); if (dragOver !== i) setDragOver(i); } }}
              onDrop={(e) => { e.preventDefault(); if (dragRef.current !== null) moveTo(dragRef.current, i); dragRef.current = null; setDragFrom(null); setDragOver(null); }}
              className={`p-4 transition-colors ${dragOver === i && dragFrom !== null && dragFrom !== i ? "bg-brand-50" : ""} ${dragFrom === i ? "opacity-50" : ""}`}
            >
              <div className="flex flex-wrap items-start gap-3">
                <div className="flex items-center gap-1 pt-6">
                  <span
                    draggable
                    onDragStart={(e) => { dragRef.current = i; setDragFrom(i); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", f.key); }}
                    onDragEnd={() => { dragRef.current = null; setDragFrom(null); setDragOver(null); }}
                    title="Drag to reorder"
                    className="cursor-grab select-none px-1 text-lg leading-none text-slate-400 active:cursor-grabbing"
                    aria-hidden
                  >⋮⋮</span>
                  <span className="w-5 text-right text-xs font-semibold text-slate-400">{i + 1}</span>
                </div>

                <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor={`label-${f.key}`} className="text-xs text-slate-500">Label</label>
                    <input id={`label-${f.key}`} value={f.label} onChange={(e) => patch(f.key, { label: e.target.value })} maxLength={80}
                      placeholder="e.g. Your district"
                      className={`mt-1 block w-full rounded-lg border px-3 py-1.5 text-sm ${f.label.trim() ? "border-slate-300" : "border-amber-400 bg-amber-50"}`} />
                    <p className="mt-1 text-[11px] text-slate-400">{isBuiltin(f.key) ? HINTS[f.key] : "A question you added."}</p>
                  </div>
                  <div>
                    <label htmlFor={`ph-${f.key}`} className="text-xs text-slate-500">{f.type === "select" ? "Dropdown prompt" : "Placeholder"}</label>
                    <input id={`ph-${f.key}`} value={f.placeholder} onChange={(e) => patch(f.key, { placeholder: e.target.value })} maxLength={120}
                      className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1">
                    {isBuiltin(f.key) ? (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">{TYPE_LABEL[f.type]}</span>
                    ) : (
                      <select value={f.type} aria-label="Answer type"
                        onChange={(e) => { const type = e.target.value as FieldType; patch(f.key, { type, ...(type === "select" ? { options: f.options?.length ? f.options : [""] } : {}) }); }}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs">
                        {CUSTOM_TYPES.map((t) => <option key={t.type} value={t.type}>{t.label}</option>)}
                      </select>
                    )}
                    <button type="button" onClick={() => moveTo(i, i - 1)} disabled={i === 0} aria-label="Move field up" className={btn}>↑</button>
                    <button type="button" onClick={() => moveTo(i, i + 1)} disabled={i === fields.length - 1} aria-label="Move field down" className={btn}>↓</button>
                    <button type="button" onClick={() => remove(f)} disabled={PERMANENT_KEYS.includes(f.key)}
                      title={PERMANENT_KEYS.includes(f.key) ? "Name and phone are needed to call back. Untick Show to hide it." : "Delete this field"}
                      className="rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30">
                      Delete
                    </button>
                  </div>
                  <div className="flex flex-wrap justify-end gap-3 text-sm text-slate-700">
                    <label className="flex items-center gap-1.5">
                      <input type="checkbox" checked={f.enabled} onChange={(e) => patch(f.key, { enabled: e.target.checked })} className="h-4 w-4" /> Show
                    </label>
                    <label className="flex items-center gap-1.5" title="The popup must fit one phone screen: keep it to 4 or 5 fields.">
                      <input type="checkbox" checked={f.popup} disabled={!f.enabled} onChange={(e) => patch(f.key, { popup: e.target.checked })} className="h-4 w-4" /> In popup
                    </label>
                    <label className="flex items-center gap-1.5">
                      <input type="checkbox" checked={f.required} disabled={!f.enabled} onChange={(e) => patch(f.key, { required: e.target.checked })} className="h-4 w-4" /> Mandatory <span className="text-red-600">*</span>
                    </label>
                  </div>
                </div>
              </div>

              {f.type === "select" && (
                <div className="mt-3 sm:ml-12">
                  <OptionsEditor options={f.options ?? []} onChange={(options) => patch(f.key, { options })} />
                </div>
              )}
            </li>
          ))}
        </ol>

        <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 px-4 py-3">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Add a question:</span>
          {CUSTOM_TYPES.map((t) => (
            <button key={t.type} type="button" onClick={() => addCustom(t.type)} disabled={fields.length >= MAX_FIELDS}
              className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 disabled:opacity-40">
              + {t.label}
            </button>
          ))}
          {missingBuiltins.length > 0 && (
            <>
              <span className="ml-2 text-xs font-bold uppercase tracking-wide text-slate-500">Add back:</span>
              {missingBuiltins.map((k) => (
                <button key={k} type="button" onClick={() => addBack(k)} className={btn}>+ {BUILTIN_FIELDS[k].label}</button>
              ))}
            </>
          )}
          {fields.length >= MAX_FIELDS && <span className="text-xs text-amber-700">Up to {MAX_FIELDS} fields.</span>}
        </div>
      </div>

      <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <label className="text-xs text-slate-500">
          Submit button text
          <input value={doc.submitLabel} onChange={(e) => setDoc((d) => ({ ...d, submitLabel: e.target.value }))}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
        </label>
        <label className="text-xs text-slate-500">
          Privacy note under the button
          <input value={doc.privacyNote} onChange={(e) => setDoc((d) => ({ ...d, privacyNote: e.target.value }))}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
        </label>
        <label className="text-xs text-slate-500 sm:col-span-2">
          Thank-you message after a successful submit
          <input value={doc.successMessage} onChange={(e) => setDoc((d) => ({ ...d, successMessage: e.target.value }))}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
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
