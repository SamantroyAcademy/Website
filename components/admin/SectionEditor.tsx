"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { bustCmsCache } from "@/lib/revalidate-client";
import { mediaUrl } from "@/lib/supabase/media";
import { compressImage } from "@/lib/image-client";
import { useImageCropper, FRAMES } from "./useImageCropper";
import type { SectionDef, SectionField } from "@/lib/sections";
import RichText from "./RichText";
import { uploadMedia } from "@/lib/upload-client";

const supabase = createClient();

async function uploadImage(file: File): Promise<string> {
  const f = await compressImage(file);
  const path = `sections/${Date.now()}-${Math.random().toString(36).slice(2, 6)}.webp`;
  const { error } = await uploadMedia(path, f);
  if (error) throw new Error(error.message);
  return path;
}

async function logActivity(action: string, target: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("activity_log").insert({ actor: user.id, actor_email: user.email, action, target });
}

/** Draft preview on while an editor is open (Next draft mode via the API). */
function setPreview(on: boolean) {
  void fetch("/api/admin/preview", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ on }), keepalive: true }).catch(() => {});
}

/** Renders a single field (text/rich/image/tags/repeater). */
function FieldInput({ field, value, onChange }: { field: SectionField; value: unknown; onChange: (v: unknown) => void }) {
  const [uploading, setUploading] = useState(false);
  const { crop, cropperUi } = useImageCropper();

  if (field.type === "text") {
    return <input value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />;
  }
  if (field.type === "rich") {
    return <RichText value={(value as string) ?? ""} onChange={(html) => onChange(html)} />;
  }
  if (field.type === "select") {
    return (
      <select value={(value as string) ?? (field.options?.[0]?.value ?? "")} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500">
        {(field.options ?? []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    );
  }
  if (field.type === "tags") {
    const arr = Array.isArray(value) ? (value as string[]) : [];
    return <input value={arr.join(", ")} onChange={(e) => onChange(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
      placeholder="Comma-separated" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500" />;
  }
  if (field.type === "image") {
    const path = value as string;
    return (
      <div className="flex items-center gap-3">
        {cropperUi}
        {path && (
          <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-md bg-slate-100">
            <Image src={mediaUrl(path)} alt="" fill sizes="96px" className="object-cover" />
          </div>
        )}
        <input type="file" accept="image/*" disabled={uploading}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            // Section images are wide banners behind text.
            const picked = await crop(file, { aspect: FRAMES.pageHero, label: field.label });
            if (!picked) return;
            setUploading(true);
            try { onChange(await uploadImage(picked)); } catch (err) { alert(err instanceof Error ? err.message : "Upload failed"); }
            finally { setUploading(false); }
          }}
          className="text-sm file:mr-3 file:rounded file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-slate-700" />
        {uploading && <span className="text-xs text-slate-400">Uploading…</span>}
      </div>
    );
  }
  if (field.type === "repeater") {
    const items = Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
    const itemFields = field.itemFields ?? [];
    const setItem = (i: number, k: string, v: unknown) => onChange(items.map((it, j) => (j === i ? { ...it, [k]: v } : it)));
    // List-shaped fields (tags & nested repeaters) must start as arrays, not "".
    const blank = () =>
      Object.fromEntries(itemFields.map((f) => [f.key, f.type === "tags" || f.type === "repeater" ? [] : ""]));
    const add = () => onChange([...items, blank()]);
    const remove = (i: number) => onChange(items.filter((_, j) => j !== i));
    const move = (i: number, d: -1 | 1) => { const j = i + d; if (j < 0 || j >= items.length) return; const c = [...items]; [c[i], c[j]] = [c[j], c[i]]; onChange(c); };
    return (
      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{field.itemLabel ?? "Item"} {i + 1}</span>
              <div className="flex gap-1">
                <button type="button" onClick={() => move(i, -1)} className="rounded border border-slate-200 bg-white px-1.5 text-slate-600 hover:bg-slate-100">↑</button>
                <button type="button" onClick={() => move(i, 1)} className="rounded border border-slate-200 bg-white px-1.5 text-slate-600 hover:bg-slate-100">↓</button>
                <button type="button" onClick={() => remove(i)} className="rounded border border-red-200 bg-white px-1.5 text-xs text-red-600 hover:bg-red-50">✕</button>
              </div>
            </div>
            <div className="space-y-2">
              {itemFields.map((sf) => (
                <div key={sf.key}>
                  <label className="mb-1 block text-xs font-medium text-slate-600">{sf.label}</label>
                  <FieldInput field={sf} value={it[sf.key]} onChange={(v) => setItem(i, sf.key, v)} />
                </div>
              ))}
            </div>
          </div>
        ))}
        <button type="button" onClick={add} className="text-sm font-medium text-brand-600 hover:text-brand-800">+ Add {field.itemLabel ?? "item"}</button>
      </div>
    );
  }
  return null;
}

export default function SectionEditor({ section, initial, canRollback }: { section: SectionDef; initial: Record<string, unknown>; canRollback: boolean }) {
  const [form, setForm] = useState<Record<string, unknown>>(initial);
  const [busy, setBusy] = useState<"" | "save" | "publish" | "rollback">("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [hasHistory, setHasHistory] = useState(canRollback);
  const [autosave, setAutosave] = useState<"idle" | "saving" | "saved">("idle");
  const firstRun = useRef(true);

  useEffect(() => { setPreview(true); return () => setPreview(false); }, []);

  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    setAutosave("saving");
    const t = setTimeout(async () => {
      await supabase.from("site_content").upsert({ key: section.key, label: section.label, draft: form }, { onConflict: "key" });
      setAutosave("saved");
    }, 1600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const setField = (k: string, v: unknown) => setForm((s) => ({ ...s, [k]: v }));

  async function saveDraft() {
    setBusy("save"); setMsg(null);
    const { error } = await supabase.from("site_content").upsert({ key: section.key, label: section.label, draft: form }, { onConflict: "key", ignoreDuplicates: false });
    setBusy("");
    setMsg(error ? { ok: false, text: error.message } : { ok: true, text: "Draft saved." }); if (!error) void bustCmsCache();
  }

  async function publish() {
    setBusy("publish"); setMsg(null);
    const { data: cur } = await supabase.from("site_content").select("published").eq("key", section.key).maybeSingle();
    if (cur?.published && Object.keys(cur.published).length) {
      await supabase.from("content_versions").insert({ key: section.key, snapshot: cur.published });
      setHasHistory(true);
    }
    const { error } = await supabase.from("site_content").upsert({ key: section.key, label: section.label, published: form, draft: form }, { onConflict: "key" });
    setBusy("");
    if (error) return setMsg({ ok: false, text: error.message });
    await logActivity("publish", `section:${section.key}`);
    setMsg({ ok: true, text: "Published! This is now live on the website." }); void bustCmsCache();
  }

  async function rollback() {
    if (!confirm("Restore the previous published version?")) return;
    setBusy("rollback"); setMsg(null);
    const { data: ver } = await supabase.from("content_versions").select("id, snapshot").eq("key", section.key).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (!ver) { setBusy(""); return setMsg({ ok: false, text: "No previous version to restore." }); }
    await supabase.from("site_content").update({ published: ver.snapshot, draft: ver.snapshot }).eq("key", section.key);
    await supabase.from("content_versions").delete().eq("id", ver.id);
    await logActivity("rollback", `section:${section.key}`);
    firstRun.current = true;
    setForm(ver.snapshot as Record<string, unknown>);
    setBusy("");
    setMsg({ ok: true, text: "Rolled back to the previous version." }); void bustCmsCache();
  }

  return (
    <div className="mt-6 max-w-3xl">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="space-y-4">
          {section.fields.map((f) => (
            <div key={f.key}>
              <label className="mb-1 block text-sm font-medium text-slate-700">{f.label}</label>
              <FieldInput field={f} value={form[f.key]} onChange={(v) => setField(f.key, v)} />
            </div>
          ))}
        </div>

        {msg && <p className={`mt-4 rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{msg.text}</p>}
        <p className="mt-3 text-xs text-slate-400">
          {autosave === "saving" ? "● Autosaving draft…" : autosave === "saved" ? "✓ Draft auto-saved" : "Drafts save automatically as you type."}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={saveDraft} disabled={!!busy} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
            {busy === "save" ? "Saving…" : "Save draft"}
          </button>
          <button onClick={publish} disabled={!!busy} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60">
            {busy === "publish" ? "Publishing…" : "Publish live"}
          </button>
          {hasHistory && (
            <button onClick={rollback} disabled={!!busy} className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-60">
              {busy === "rollback" ? "Restoring…" : "↩ Rollback"}
            </button>
          )}
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Changes save as a <b>draft</b>. Open your live site while signed in to preview; nothing is public until you <b>Publish</b>.
        </p>
      </div>
    </div>
  );
}
