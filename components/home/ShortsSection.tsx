import { YoutubeLogoIcon } from "@phosphor-icons/react/ssr";
import { getPublished } from "@/lib/content";
import { SHORTS_DOC, clampCount, type ShortItem, type ShortsDoc } from "@/lib/shorts";
import { pickVideos } from "@/lib/youtube-feed";
import { latestVideos } from "@/lib/feeds/youtube";
import { asArray } from "@/lib/shape";
import CmsSectionHeading from "@/components/ui/CmsSectionHeading";
import ShortCard from "./ShortCard";
import Rail from "@/components/ui/Rail";

type Card = { id: string; title: string; wide: boolean; live?: boolean };

/** Success stories (CMS: shorts): the newest uploads from Prasanta Nayak's
 *  channel, which is mostly selection and result videos, in a swipeable
 *  rail. Automatic by default (hidden videos skipped); the hand-picked list
 *  is used when the admin chooses it, or if YouTube cannot be reached. */
export default async function ShortsSection() {
  const doc = await getPublished<ShortsDoc>("shorts", SHORTS_DOC);
  const limit = clampCount(doc.limit, 12);
  const picked: Card[] = asArray<ShortItem>(doc.items).filter((s) => s?.id).map((s) => ({ id: s.id, title: s.title, wide: false }));

  let cards: Card[] = [];
  if (doc.mode !== "manual" && doc.channelUrl) {
    const feed = await latestVideos(doc.channelUrl);
    cards = pickVideos(feed, asArray<string>(doc.hidden), limit).map((v) => ({ id: v.id, title: v.title, wide: !v.short, live: true }));
  }
  if (!cards.length) cards = picked.slice(0, limit);
  if (!cards.length) return null;

  return (
    <section className="section-y overflow-hidden" aria-label="Success stories">
      <div className="container-x flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <CmsSectionHeading sectionKey="shorts" />
        {doc.channelUrl && (
          <a href={doc.channelUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm shrink-0 self-start md:self-auto">
            <YoutubeLogoIcon size={18} weight="fill" className="text-accent" /> More on YouTube
          </a>
        )}
      </div>
      <div className="mt-10">
      <Rail label="Success stories" className="rail flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-3 sm:gap-4 sm:px-8 lg:px-[max(2rem,calc((100vw-1320px)/2+2rem))]">
        {cards.map((s) => (
          <li key={s.id} className="w-[46vw] max-w-[14rem] shrink-0 snap-start">
            <ShortCard id={s.id} title={s.title} wide={s.wide} original={s.live} />
          </li>
        ))}
      </Rail>
      </div>
    </section>
  );
}
