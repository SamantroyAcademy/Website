import { createClient } from "@/lib/supabase/server";
import { EDU_DOC, SHORTS_DOC, type EduVideosDoc, type ShortsDoc } from "@/lib/shorts";
import { asArray } from "@/lib/shape";
import ShortsManager from "@/components/admin/ShortsManager";
import EduVideosManager from "@/components/admin/EduVideosManager";

export const dynamic = "force-dynamic";

export default async function YouTubeChannelsAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_content").select("key, draft").in("key", ["shorts", "edu_videos"]);
  const draftOf = (key: string) => data?.find((r) => r.key === key)?.draft as Record<string, unknown> | undefined;

  const s = draftOf("shorts") as Partial<ShortsDoc> | undefined;
  const shorts: ShortsDoc = s
    ? {
        channelUrl: s.channelUrl || SHORTS_DOC.channelUrl,
        items: asArray(s.items),
        mode: s.mode ?? SHORTS_DOC.mode,
        limit: s.limit ?? SHORTS_DOC.limit,
        hidden: asArray<string>(s.hidden),
      }
    : SHORTS_DOC;
  const e = draftOf("edu_videos") as Partial<EduVideosDoc> | undefined;
  const edu: EduVideosDoc = { ...EDU_DOC, ...e, channelUrl: e?.channelUrl || EDU_DOC.channelUrl, hidden: asArray<string>(e?.hidden) };

  return (
    <div className="max-w-5xl space-y-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">YouTube Channels</h1>
        <p className="mt-1 text-sm text-slate-500">
          Two homepage sections, each fed by its own channel. New uploads appear by themselves; hide any you do not want shown.
        </p>
      </div>

      <section>
        <h2 className="text-lg font-bold text-slate-900">Success stories</h2>
        <p className="mt-1 text-sm text-slate-500">Prasanta Nayak&apos;s channel: selection and result videos.</p>
        <ShortsManager initial={shorts} />
      </section>

      <section>
        <h2 className="text-lg font-bold text-slate-900">Educational videos</h2>
        <p className="mt-1 text-sm text-slate-500">The Samantroy Academy channel: classes, current affairs and exam information.</p>
        <EduVideosManager initial={edu} />
      </section>
    </div>
  );
}
