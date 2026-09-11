"use client";

import { useEffect, useRef } from "react";

const FONTS = ["Cabinet Grotesk", "Switzer", "Bespoke Stencil", "Georgia", "Arial"];
const SIZES: { label: string; cmd: string }[] = [
  { label: "S", cmd: "2" },
  { label: "M", cmd: "3" },
  { label: "L", cmd: "5" },
  { label: "XL", cmd: "6" },
];
const WORD_ART: { label: string; cls: string; sample: string }[] = [
  { label: "Accent", cls: "hl", sample: "#b0520a" },
  { label: "Green", cls: "wa-green", sample: "#22452f" },
  { label: "Tricolour", cls: "wa-tri", sample: "linear-gradient(100deg,#e1731a,#9aa39c 50%,#1f6b3a)" },
  { label: "Stencil", cls: "wa-stencil", sample: "#141a17" },
  { label: "Outline", cls: "wa-outline", sample: "#334155" },
];

function exec(cmd: string, value?: string) {
  // execCommand is deprecated but universally supported and ideal for a lightweight admin editor.
  document.execCommand(cmd, false, value);
}

export default function RichText({
  value,
  onChange,
  minHeight = 120,
}: {
  value: string;
  onChange: (html: string) => void;
  minHeight?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Sync the editor with the external value (e.g. when you click "Edit" and the
  // record's saved content loads), but never while the user is typing in it —
  // that would reset the caret. So we only overwrite when the editor isn't focused.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (document.activeElement !== el && el.innerHTML !== (value || "")) {
      el.innerHTML = value || "";
    }
  }, [value]);

  const emit = () => onChange(ref.current?.innerHTML ?? "");

  const makeLink = () => {
    const url = window.prompt("Link URL (https://…)");
    if (!url) return;
    const safe = /^(https?:|mailto:|tel:)/i.test(url) ? url : `https://${url}`;
    exec("createLink", safe);
    emit();
  };

  const applyWordArt = (cls: string) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    const text = sel.toString();
    exec("insertHTML", `<span class="${cls}">${text}</span>`);
    emit();
  };

  const Btn = ({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) => (
    <button type="button" title={title} onMouseDown={(e) => e.preventDefault()} onClick={onClick}
      className="rounded px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200">{children}</button>
  );

  return (
    <div className="rounded-lg border border-slate-300 bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
        <Btn title="Bold" onClick={() => { exec("bold"); emit(); }}><b>B</b></Btn>
        <Btn title="Italic" onClick={() => { exec("italic"); emit(); }}><i>I</i></Btn>
        <Btn title="Underline" onClick={() => { exec("underline"); emit(); }}><u>U</u></Btn>
        <Btn title="Insert link" onClick={makeLink}>🔗</Btn>
        <Btn title="Remove link" onClick={() => { exec("unlink"); emit(); }}>⛓</Btn>
        <span className="mx-1 h-4 w-px bg-slate-300" />
        <select title="Font" onMouseDown={(e) => e.stopPropagation()} onChange={(e) => { exec("fontName", e.target.value); emit(); }}
          className="rounded border border-slate-200 bg-white px-1 py-0.5 text-xs text-slate-700">
          {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
        {SIZES.map((s) => (
          <Btn key={s.cmd} title={`Size ${s.label}`} onClick={() => { exec("fontSize", s.cmd); emit(); }}>{s.label}</Btn>
        ))}
        <span className="mx-1 h-4 w-px bg-slate-300" />
        <label title="Text colour" className="flex items-center gap-1 text-xs text-slate-600">
          <span aria-hidden>🎨</span>
          <input type="color" onChange={(e) => { exec("foreColor", e.target.value); emit(); }} className="h-5 w-6 cursor-pointer border-0 bg-transparent p-0" />
        </label>
        <label title="Highlight" className="flex items-center gap-1 text-xs text-slate-600">
          <span aria-hidden>🖊</span>
          <input type="color" defaultValue="#fff3b0" onChange={(e) => { exec("hiliteColor", e.target.value); emit(); }} className="h-5 w-6 cursor-pointer border-0 bg-transparent p-0" />
        </label>
        <span className="mx-1 h-4 w-px bg-slate-300" />
        <Btn title="Align left" onClick={() => { exec("justifyLeft"); emit(); }}>⇤</Btn>
        <Btn title="Align centre" onClick={() => { exec("justifyCenter"); emit(); }}>≡</Btn>
        <Btn title="Align right" onClick={() => { exec("justifyRight"); emit(); }}>⇥</Btn>
        <span className="mx-1 h-4 w-px bg-slate-300" />
        <span className="text-[10px] font-bold uppercase text-slate-400">Word art:</span>
        {WORD_ART.map((w) => (
          <button key={w.cls} type="button" title={`Word art: ${w.label}`} onMouseDown={(e) => e.preventDefault()} onClick={() => applyWordArt(w.cls)}
            className="rounded border border-slate-200 px-2 py-0.5 text-[11px] font-bold hover:bg-slate-200"
            style={w.cls === "wa-outline" ? { color: "transparent", WebkitTextStroke: "0.8px #334155" } : { background: w.sample, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
            {w.label}
          </button>
        ))}
        <Btn title="Clear formatting" onClick={() => { exec("removeFormat"); emit(); }}>✕ clear</Btn>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        className="rich-html px-3 py-2.5 text-sm text-slate-900 outline-none"
        style={{ minHeight }}
      />
    </div>
  );
}
