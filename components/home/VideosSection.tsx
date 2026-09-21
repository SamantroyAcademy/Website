import { YoutubeLogoIcon } from "@phosphor-icons/react/ssr";
import { getPublished } from "@/lib/content";
import { getSiteVideos } from "@/lib/videos";
import { EDU_DOC, clampCount, type EduVideosDoc } from "@/lib/shorts";
import { pickVideos } from "@/lib/youtube-feed";
import { latestVideos } from "@/lib/feeds/youtube";
import { asArray } from "@/lib/shape";
import CmsSectionHeading from "@/components/ui/CmsSectionHeading";
import VideoFacade from "@/components/ui/VideoFacade";
import ShortCard from "./ShortCard";
import Rail from "@/components/ui/Rail";

/** Educational videos (CMS: edu_videos): the Samantroy Academy channel's
 *  newest classes, current affairs and information videos in a grid, with
 *  its newest Shorts in a strip below. Automatic by default; "manual" (or no
 *  answer from YouTube) shows the videos listed under Resources instead.
 *  `limit` lets another page show a different number of grid videos. */
export default async function VideosSection({ limit }: { limit?: number }) {
  const doc = await getPublished<EduVideosDoc>("edu_videos", EDU_DOC);
  const gridMax = limit ?? clampCount(doc.limit, 6);
  const shortsMax = clampCount(doc.shortsLimit, 10);
  const hidden = asArray<string>(doc.hidden);

  let grid: { id: string; title: string; live?: boolean }[] = [];
  let shorts: { id: string; title: string }[] = [];
  if (doc.mode !== "manual" && doc.channelUrl) {
    const feed = await latestVideos(doc.channelUrl);
    grid = pickVideos(feed, hidden, gridMax, "video").map((v) => ({ ...v, live: true }));
    shorts = shortsMax ? pickVideos(feed, hidden, shortsMax, "short") : [];
  }
  // The channel posts mostly Shorts, so its last 15 uploads may hold only a
  // video or two: top the grid up with the videos listed under Resources.
  if (grid.length < gridMax) {
    const have = new Set(grid.map((v) => v.id));
    const extra = (await getSiteVideos(gridMax)).filter((v) => !have.has(v.id) && !hidden.includes(v.id));
    grid = [...grid, ...extra].slice(0, gridMax);
  }
  if (!grid.length && !shorts.length) return null;

  return (
    <section className="section-y overflow-hidden" aria-label="Educational videos">
      <div className="container-x flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <CmsSectionHeading sectionKey="videos" />
        {doc.channelUrl && (
          <a href={doc.channelUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm shrink-0 self-start md:self-auto">
            <YoutubeLogoIcon size={18} weight="fill" className="text-accent" /> Samantroy Academy on YouTube
          </a>
        )}
      </div>
      {grid.length > 0 && (
        <div className="container-x">
          <ul className={`mt-10 grid gap-5 ${grid.length > 1 ? "md:grid-cols-2" : "max-w-3xl"} ${grid.length > 2 ? "lg:grid-cols-3" : ""}`} data-reveal="stagger">
            {grid.map((v) => (
              <li key={v.id}><VideoFacade id={v.id} title={v.title} original={v.live} /></li>
            ))}
          </ul>
        </div>
      )}
      {shorts.length > 0 && (
        <div className="mt-12">
          <p className="container-x text-sm font-semibold text-ink-2">Quick lessons</p>
          <div className="mt-4">
            <Rail label="Quick lessons" className="rail flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-3 sm:gap-4 sm:px-8 lg:px-[max(2rem,calc((100vw-1320px)/2+2rem))]">
              {shorts.map((s) => (
                <li key={s.id} className="w-[40vw] max-w-[12rem] shrink-0 snap-start">
                  <ShortCard id={s.id} title={s.title} original />
                </li>
              ))}
            </Rail>
          </div>
        </div>
      )}
    </section>
  );
}
