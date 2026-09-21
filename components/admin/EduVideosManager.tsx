"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { bustCmsCache } from "@/lib/revalidate-client";
import { clampCount, type EduVideosDoc } from "@/lib/shorts";
import ChannelFeedSettings, { type FeedSettingsValue } from "./ChannelFeedSettings";

/** Educational videos on the homepage: the Samantroy Academy channel's
 *  newest videos in a grid and its newest Shorts in a strip. Hand-picked mode
 *  (or no answer from YouTube) shows the videos listed under Resources. */
export default function EduVideosManager({ initial }: { initial: EduVideosDoc }) {
  const supabase = createClient();
  const [feed, setFeed] = useState<FeedSettingsValue>({
    channelUrl: initial.channelUrl,
    mode: initial.mode === "manual" ? "manual" : "auto",
    limit: clampCount(initial.limit, 6),
    shortsLimit: clampCount(initial.shortsLimit, 10),
    hidden: initial.hidden ?? [],
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function save() {
    setBusy(true); setMsg(null);
    const doc: EduVideosDoc = {
      channelUrl: feed.channelUrl.trim(),
      mode: feed.mode,
      limit: clampCount(feed.limit, 6),
      shortsLimit: clampCount(feed.shortsLimit, 10),
      hidden: feed.hidden,
    };
    const { error } = await supabase.from("site_content").upsert(
      { key: "edu_videos", label: "Educational Videos (YouTube)", draft: doc, published: doc },
      { onConflict: "key" },
    );
    setBusy(false);
    if (error) return setMsg({ ok: false, text: error.message });
    setMsg({ ok: true, text: "Saved and published. Live on the homepage." });
    void bustCmsCache();
  }

  return (
    <div className="mt-4 space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <ChannelFeedSettings value={feed} onChange={setFeed} manualLabel="Videos from Resources"
          limitLabel="Videos in the grid" shortsLabel="Shorts in the strip (0 hides it)" />
        {feed.mode === "auto" && (
          <p className="mt-4 text-xs text-slate-500">
            If the channel&apos;s latest uploads hold fewer full videos than this, the grid is topped up with the videos listed under{" "}
            <Link href="/admin/resources" className="font-semibold text-brand-700 underline">Resources</Link>.
          </p>
        )}
        {feed.mode === "manual" && (
          <p className="mt-4 text-sm text-slate-600">
            The grid shows the videos listed under <Link href="/admin/resources" className="font-semibold text-brand-700 underline">Resources</Link>.
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={save} disabled={busy}
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
          {busy ? "Saving…" : "Save and publish"}
        </button>
        {msg && <p className={`text-sm ${msg.ok ? "text-green-700" : "text-red-600"}`}>{msg.text}</p>}
      </div>
    </div>
  );
}
