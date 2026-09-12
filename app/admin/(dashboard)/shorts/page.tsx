import { createClient } from "@/lib/supabase/server";
import { SHORTS_DOC, type ShortsDoc } from "@/lib/shorts";
import { asArray } from "@/lib/shape";
import ShortsManager from "@/components/admin/ShortsManager";

export const dynamic = "force-dynamic";

export default async function ShortsAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_content").select("draft").eq("key", "shorts").maybeSingle();
  const saved = data?.draft as Partial<ShortsDoc> | undefined;
  const initial: ShortsDoc = saved
    ? { channelUrl: saved.channelUrl || SHORTS_DOC.channelUrl, items: asArray(saved.items) }
    : SHORTS_DOC;

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-slate-900">Student Stories (YouTube Shorts)</h1>
      <p className="mt-1 text-sm text-slate-500">
        Result announcements and class clips shown on the homepage. Add links, import from a channel, reorder or remove them.
      </p>
      <ShortsManager initial={initial} />
    </div>
  );
}
