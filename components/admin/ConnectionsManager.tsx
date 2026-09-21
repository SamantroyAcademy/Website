"use client";

import { useState } from "react";

export type ConnectionsStatus = {
  google: { key: string; placeId: string };
  instagram: { token: string; savedAt: string };
  facebook: { pageId: string; token: string };
};

type Service = "google" | "instagram" | "facebook";
type Note = { ok: boolean; text: string } | null;

const input = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

/** Paste keys for Google reviews, Instagram and Facebook. Saved keys are never
 *  sent back to the browser: the screen only shows their last four characters.
 *  Leaving a secret box empty keeps the saved one; "Remove" clears it. */
export default function ConnectionsManager({ initial }: { initial: ConnectionsStatus }) {
  const [status, setStatus] = useState(initial);
  const [values, setValues] = useState({ googleKey: "", googlePlaceId: initial.google.placeId, instagramToken: "", facebookPageId: initial.facebook.pageId, facebookToken: "" });
  const [busy, setBusy] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<Service, Note>>({ google: null, instagram: null, facebook: null });
  const set = (k: keyof typeof values, v: string) => setValues((s) => ({ ...s, [k]: v }));
  const note = (s: Service, n: Note) => setNotes((x) => ({ ...x, [s]: n }));

  async function post(body: unknown) {
    const res = await fetch("/api/admin/integrations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Something went wrong.");
    return data;
  }

  async function save(service: Service, fields: Partial<typeof values>) {
    setBusy(service); note(service, null);
    try {
      // Only send what was typed, so a blank secret box keeps the saved key.
      const sent = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined)) as Record<string, string>;
      const data = await post({ action: "save", values: sent });
      setStatus(data.status);
      setValues((s) => ({ ...s, googleKey: "", instagramToken: "", facebookToken: "" }));
      const t = await post({ action: "test", service });
      note(service, { ok: t.ok, text: t.ok ? `Saved. ${t.text}` : `Saved, but the test failed: ${t.text}` });
    } catch (e) {
      note(service, { ok: false, text: e instanceof Error ? e.message : "Could not save." });
    } finally { setBusy(null); }
  }

  async function test(service: Service) {
    setBusy(service); note(service, null);
    try { note(service, await post({ action: "test", service })); }
    catch (e) { note(service, { ok: false, text: e instanceof Error ? e.message : "Test failed." }); }
    finally { setBusy(null); }
  }

  const typed = (v: string) => (v.trim() ? v : undefined);
  const Saved = ({ v }: { v: string }) => (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${v ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-500"}`}>{v ? `Saved ${v}` : "Not set"}</span>
  );
  const Actions = ({ service, onSave, onRemove, canTest }: { service: Service; onSave: () => void; onRemove: () => void; canTest: boolean }) => (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <button type="button" onClick={onSave} disabled={busy !== null} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
        {busy === service ? "Working…" : "Save and test"}
      </button>
      <button type="button" onClick={() => test(service)} disabled={busy !== null || !canTest} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Test</button>
      <button type="button" onClick={onRemove} disabled={busy !== null || !canTest} className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">Remove</button>
      {notes[service] && <p role="status" className={`w-full text-sm ${notes[service]!.ok ? "text-green-700" : "text-red-600"}`}>{notes[service]!.text}</p>}
    </div>
  );
  const Steps = ({ children }: { children: React.ReactNode }) => (
    <details className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
      <summary className="cursor-pointer font-semibold text-slate-700">How to get this</summary>
      <ol className="mt-2 list-decimal space-y-1 pl-5">{children}</ol>
    </details>
  );
  const ext = (href: string, text: string) => <a href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700 underline">{text}</a>;

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-slate-900">Google reviews</h2>
          <Saved v={status.google.key} />
        </div>
        <p className="mt-1 text-sm text-slate-500">Imports new Google reviews every night and on the Google Reviews screen. Google gives the 5 most relevant at a time, so the list grows day by day.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">API key
            <input value={values.googleKey} onChange={(e) => set("googleKey", e.target.value)} className={`${input} mt-1`} placeholder={status.google.key ? "Leave empty to keep the saved key" : "AIza…"} autoComplete="off" spellCheck={false} />
          </label>
          <label className="text-sm font-medium text-slate-700">Place ID (optional)
            <input value={values.googlePlaceId} onChange={(e) => set("googlePlaceId", e.target.value)} className={`${input} mt-1`} placeholder="Found automatically if empty" autoComplete="off" spellCheck={false} />
          </label>
        </div>
        <Steps>
          <li>Open {ext("https://console.cloud.google.com/", "Google Cloud Console")} and create a project (any name).</li>
          <li>Under Billing, link a billing account. Google requires one, but this use stays inside the free monthly allowance.</li>
          <li>Go to APIs and Services, Library, search for <b>Places API (New)</b> and click Enable.</li>
          <li>Go to APIs and Services, Credentials, Create credentials, API key. Copy it.</li>
          <li>Optional but safer: edit the key, and under API restrictions choose Places API (New) only.</li>
          <li>Paste the key above and press Save and test. The Place ID can stay empty; the academy is found by name.</li>
        </Steps>
        <Actions service="google" canTest={Boolean(status.google.key)}
          onSave={() => save("google", { googleKey: typed(values.googleKey), googlePlaceId: values.googlePlaceId })}
          onRemove={() => save("google", { googleKey: "" })} />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-slate-900">Instagram</h2>
          <Saved v={status.instagram.token} />
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Shows the newest reels and posts on the homepage. The token lasts 60 days; the website renews it by itself every month.
          {status.instagram.savedAt && <> Last saved or renewed {status.instagram.savedAt.slice(0, 10)}.</>}
        </p>
        <label className="mt-4 block text-sm font-medium text-slate-700">Access token
          <input value={values.instagramToken} onChange={(e) => set("instagramToken", e.target.value)} className={`${input} mt-1`} placeholder={status.instagram.token ? "Leave empty to keep the saved token" : "IGAA…"} autoComplete="off" spellCheck={false} />
        </label>
        <Steps>
          <li>The Instagram account must be a Professional (Business or Creator) account: Instagram app, Settings, Account type and tools.</li>
          <li>Open {ext("https://developers.facebook.com/apps/", "Meta for Developers")}, Create app, choose <b>Other</b>, then type <b>Business</b>.</li>
          <li>In the app, add the product <b>Instagram</b> and pick <b>API setup with Instagram login</b>.</li>
          <li>Under Generate access tokens, Add account, log in as the academy&apos;s Instagram, then Generate token. Copy it.</li>
          <li>Paste it above and press Save and test.</li>
        </Steps>
        <Actions service="instagram" canTest={Boolean(status.instagram.token)}
          onSave={() => save("instagram", { instagramToken: typed(values.instagramToken) })}
          onRemove={() => save("instagram", { instagramToken: "" })} />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-slate-900">Facebook Page</h2>
          <Saved v={status.facebook.token} />
        </div>
        <p className="mt-1 text-sm text-slate-500">Shows the Page&apos;s newest videos (or posts, if there are no videos) on the homepage.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">Page ID
            <input value={values.facebookPageId} onChange={(e) => set("facebookPageId", e.target.value)} className={`${input} mt-1`} placeholder="e.g. 1234567890" autoComplete="off" spellCheck={false} />
          </label>
          <label className="text-sm font-medium text-slate-700">Page access token
            <input value={values.facebookToken} onChange={(e) => set("facebookToken", e.target.value)} className={`${input} mt-1`} placeholder={status.facebook.token ? "Leave empty to keep the saved token" : "EAA…"} autoComplete="off" spellCheck={false} />
          </label>
        </div>
        <Steps>
          <li>Use the same Meta app as Instagram (or create one: type Business).</li>
          <li>Open the {ext("https://developers.facebook.com/tools/explorer/", "Graph API Explorer")}, pick the app, and under User or Page choose the academy&apos;s Page. Grant <b>pages_read_engagement</b> and <b>pages_show_list</b>.</li>
          <li>Click Generate access token, then open it in the {ext("https://developers.facebook.com/tools/debug/accesstoken/", "Access Token Debugger")} and press Extend access token. A Page token made from a long-lived login does not expire.</li>
          <li>The Page ID is on the Page: About, Page transparency (or in the Explorer, as the id of the Page).</li>
          <li>Paste both above and press Save and test.</li>
        </Steps>
        <Actions service="facebook" canTest={Boolean(status.facebook.token && status.facebook.pageId)}
          onSave={() => save("facebook", { facebookPageId: values.facebookPageId, facebookToken: typed(values.facebookToken) })}
          onRemove={() => save("facebook", { facebookToken: "" })} />
      </section>
    </div>
  );
}
