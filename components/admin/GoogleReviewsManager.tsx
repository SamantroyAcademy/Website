"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { bustCmsCache } from "@/lib/revalidate-client";
import { mediaUrl } from "@/lib/supabase/media";
import { compressImage } from "@/lib/image-client";
import { asArray } from "@/lib/shape";
import type { GoogleReview } from "@/lib/homepage-defaults";
import { incompleteReviews, mergeReviews, showable, upsertReview } from "@/lib/reviews";
import { useImageCropper, FRAMES } from "./useImageCropper";
import { uploadMedia } from "@/lib/upload-client";

export default function GoogleReviewsManager({
  initial,
  placeUrl: initialPlaceUrl,
  hasKey,
}: {
  initial: GoogleReview[];
  placeUrl: string;
  /** A Google API key is saved under Connections. */
  hasKey: boolean;
}) {
  const supabase = createClient();
  const [items, setItems] = useState<GoogleReview[]>(asArray<GoogleReview>(initial));
  const [placeUrl, setPlaceUrl] = useState(initialPlaceUrl);
  const [link, setLink] = useState("");
  const [reviewLink, setReviewLink] = useState("");
  const { crop, cropperUi } = useImageCropper();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [needsKey, setNeedsKey] = useState(!hasKey);

  const set = (i: number, patch: Partial<GoogleReview>) =>
    setItems((s) => s.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const remove = (i: number) => setItems((s) => s.filter((_, j) => j !== i));
  const move = (i: number, d: -1 | 1) => {
    const j = i + d; if (j < 0 || j >= items.length) return;
    const c = [...items]; [c[i], c[j]] = [c[j], c[i]]; setItems(c);
  };

  /** Pull the latest reviews straight from Google (needs a Places API key)
   *  and publish them at once, so they show on the homepage without a second
   *  step. New ones go on top; anyone already listed is skipped. */
  async function importFromGoogle() {
    setBusy(true); setMsg(null);
    try {
      const res = await fetch("/api/admin/google-review", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!data.ok) {
        if (data.needsKey) setNeedsKey(true);
        setMsg({ ok: false, text: data.error || "Could not import from Google." });
        return;
      }
      setNeedsKey(false);
      const { items: merged, added } = mergeReviews(items, (data.items ?? []) as GoogleReview[]);
      const url = placeUrl || data.placeUrl || "";
      if (!placeUrl && data.placeUrl) setPlaceUrl(data.placeUrl);
      setItems(merged);
      if (!added) {
        setMsg({ ok: true, text: `Google returned ${data.count ?? 0} review(s); all are already listed. Google shares 5 at a time, and new ones are also imported every night.` });
        return;
      }
      const error = await publish(merged, url);
      setMsg(error
        ? { ok: false, text: `Imported ${added} review(s), but saving failed: ${error}` }
        : { ok: true, text: `Imported ${added} new review(s) from Google and published them on the homepage.` });
    } catch {
      setMsg({ ok: false, text: "Could not reach Google. Try again, or add the review by hand below." });
    } finally { setBusy(false); }
  }

  /** Paste one review's share link: fetch the reviewer, photo, stars, words,
   *  date and attached photos, put it on top and publish. */
  async function fetchFromLink() {
    const url = reviewLink.trim();
    if (!url) return;
    setBusy(true); setMsg(null);
    try {
      const res = await fetch("/api/admin/google-review", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!data.ok || !data.review) {
        setMsg({ ok: false, text: data.error || "Could not read that review." });
        return;
      }
      const r = data.review as GoogleReview;
      const replaced = items.some((x) => x.url?.trim() === url);
      const next = upsertReview(items, r);
      setItems(next);
      setReviewLink("");
      const error = await publish(next, placeUrl);
      setMsg(error
        ? { ok: false, text: `Fetched ${r.name}'s review, but saving failed: ${error}` }
        : { ok: true, text: `${replaced ? "Updated" : "Added"} ${r.name}'s review (${r.rating}★${r.photos?.length ? `, ${r.photos.length} photo(s)` : ""}) and published it on the homepage.` });
    } catch {
      setMsg({ ok: false, text: "Could not reach Google. Try again in a minute." });
    } finally { setBusy(false); }
  }

  async function publish(list: GoogleReview[], url: string): Promise<string | null> {
    const doc = { items: list.filter(showable), placeUrl: url };
    const { error } = await supabase.from("site_content").upsert(
      { key: "google_reviews", label: "Google Reviews", draft: doc, published: doc },
      { onConflict: "key" },
    );
    if (error) return error.message;
    void bustCmsCache();
    return null;
  }

  /** Add an empty card to type a review into (always works). */
  function addManual() {
    setItems((s) => [...s, { url: link.trim(), name: "", rating: 5, text: "", avatar: "", date: "" }]);
    setLink("");
    setMsg({ ok: true, text: "Blank review added — fill in the reviewer, rating and text below." });
  }

  async function uploadAvatar(i: number, file: File) {
    const picked = await crop(file, { aspect: FRAMES.avatar, round: true, label: "a reviewer photo" });
    if (!picked) return;
    setBusy(true);
    try {
      const f = await compressImage(picked);
      const path = `reviews/${Date.now()}-${Math.random().toString(36).slice(2, 6)}.webp`;
      const { error } = await uploadMedia(path, f);
      if (error) throw new Error(error.message);
      set(i, { avatar: path });
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Upload failed." });
    } finally { setBusy(false); }
  }

  async function save() {
    const bad = incompleteReviews(items);
    if (bad.length) {
      return setMsg({ ok: false, text: `Review ${bad.join(", ")} needs the reviewer's name, and the review text or a photo, before it can show on the website. Paste its link in the box at the top to fill it in, type them in, or remove the card.` });
    }
    setBusy(true); setMsg(null);
    const error = await publish(items, placeUrl);
    setBusy(false);
    if (error) return setMsg({ ok: false, text: error });
    const n = items.filter(showable).length;
    setMsg({ ok: true, text: n ? `Saved and published: ${n} review(s) live on the homepage.` : "Saved. The homepage section stays hidden until a review is added." });
  }

  return (
    <div className="mt-6 space-y-5">
      {cropperUi}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <label htmlFor="review-link" className="mb-1 block text-sm font-semibold text-slate-800">Add a review from its Google link</label>
        <form className="flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); void fetchFromLink(); }}>
          <input id="review-link" value={reviewLink} onChange={(e) => setReviewLink(e.target.value)} placeholder="https://maps.app.goo.gl/…"
            inputMode="url" autoComplete="off" spellCheck={false}
            className="min-w-[240px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <button type="submit" disabled={busy || !reviewLink.trim()}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
            {busy ? "Fetching…" : "Fetch and publish"}
          </button>
        </form>
        <p className="mt-2 text-xs text-slate-500">
          On Google Maps, open the review, tap <b>Share</b> and copy the link. The reviewer&apos;s name and photo, the stars, the words, the date and any photos they added are filled in and published. Paste the same link again to refresh it.
        </p>

        <div className="mt-4 border-t border-slate-200 pt-4">
          <button onClick={importFromGoogle} disabled={busy}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
            Import the latest 5 from Google
          </button>
          <p className="mt-2 text-xs text-slate-500">
            Needs a Google API key. Once one is saved, new reviews are also imported every night.
          </p>
        </div>
        {needsKey && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
            No Google API key yet, so this button is off.{" "}
            <Link href="/admin/connections" className="font-semibold underline">Add one under Connections</Link>{" "}
            if you want it. Pasting review links above works without one.
          </p>
        )}

        <div className="mt-4 border-t border-slate-200 pt-4">
          <label className="mb-1 block text-sm font-medium text-slate-700">Or type one in by hand</label>
          <div className="flex flex-wrap gap-2">
            <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Review link (optional)"
              className="min-w-[240px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <button onClick={addManual} disabled={busy}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
              + Add blank review
            </button>
          </div>

        </div>
        <label className="mt-4 block text-sm font-medium text-slate-700">Google profile link (for the “See all reviews” button)</label>
        <input value={placeUrl} onChange={(e) => setPlaceUrl(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </div>

      {items.map((r, i) => (
        <div key={i} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-start gap-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-slate-100">
              {r.avatar && <Image src={mediaUrl(r.avatar)} alt="" fill sizes="56px" className="object-cover" />}
            </div>
            <div className="grid min-w-[260px] flex-1 gap-2 sm:grid-cols-3">
              <label className="text-xs text-slate-500">Reviewer
                <input value={r.name} onChange={(e) => set(i, { name: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
              </label>
              <label className="text-xs text-slate-500">Rating (1–5)
                <input type="number" min={1} max={5} value={r.rating}
                  onChange={(e) => set(i, { rating: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
              </label>
              <label className="text-xs text-slate-500">Date shown
                <input value={r.date ?? ""} onChange={(e) => set(i, { date: e.target.value })} placeholder="e.g. 2 months ago"
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
              </label>
            </div>
            <div className="flex shrink-0 gap-1">
              <button onClick={() => move(i, -1)} className="rounded border border-slate-200 px-1.5 text-slate-600 hover:bg-slate-50">↑</button>
              <button onClick={() => move(i, 1)} className="rounded border border-slate-200 px-1.5 text-slate-600 hover:bg-slate-50">↓</button>
              <button onClick={() => remove(i)} className="rounded border border-red-200 px-1.5 text-xs text-red-600 hover:bg-red-50">✕</button>
            </div>
          </div>
          <textarea value={r.text} onChange={(e) => set(i, { text: e.target.value })} rows={3} placeholder="Review text…"
            className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          {!!r.photos?.length && (
            <div className="mt-2 flex flex-wrap gap-2">
              {r.photos.map((p, k) => (
                <div key={p} className="relative h-16 w-16 overflow-hidden rounded-lg bg-slate-100">
                  <Image src={mediaUrl(p)} alt="" fill sizes="64px" className="object-cover" />
                  <button type="button" onClick={() => set(i, { photos: r.photos!.filter((_, m) => m !== k) })} aria-label="Remove this photo"
                    className="absolute right-0.5 top-0.5 rounded bg-white/90 px-1 text-xs text-red-600">✕</button>
                </div>
              ))}
            </div>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <input value={r.url} onChange={(e) => set(i, { url: e.target.value })} placeholder="Review link"
              className="min-w-[220px] flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs" />
            <label className="text-xs text-slate-500">
              Photo
              <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAvatar(i, f); }}
                className="ml-2 text-xs file:mr-2 file:rounded file:border-0 file:bg-slate-100 file:px-2 file:py-1 file:text-slate-700" />
            </label>
          </div>
        </div>
      ))}

      {items.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
          No reviews yet. Paste a review link above. The homepage section stays hidden until there is one.
        </p>
      )}

      {msg && <p className={`rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-800"}`}>{msg.text}</p>}
      <button onClick={save} disabled={busy} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
        {busy ? "Saving…" : "Save and publish"}
      </button>
    </div>
  );
}
