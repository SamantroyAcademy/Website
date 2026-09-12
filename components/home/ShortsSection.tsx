import { YoutubeLogoIcon } from "@phosphor-icons/react/ssr";
import { getPublished } from "@/lib/content";
import { SHORTS_DOC, type ShortItem, type ShortsDoc } from "@/lib/shorts";
import { asArray } from "@/lib/shape";
import CmsSectionHeading from "@/components/ui/CmsSectionHeading";
import ShortCard from "./ShortCard";

/** Student stories (CMS: shorts): result announcements and class clips from
 *  the academy's YouTube channel, in a swipeable rail. Hidden when empty. */
export default async function ShortsSection() {
  const doc = await getPublished<ShortsDoc>("shorts", SHORTS_DOC);
  const items = asArray<ShortItem>(doc.items).filter((s) => s?.id);
  if (!items.length) return null;

  return (
    <section className="section-y overflow-hidden" aria-label="Student stories">
      <div className="container-x flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <CmsSectionHeading sectionKey="shorts" />
        {doc.channelUrl && (
          <a href={doc.channelUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm shrink-0 self-start md:self-auto">
            <YoutubeLogoIcon size={18} weight="fill" className="text-accent" /> More on YouTube
          </a>
        )}
      </div>
      <ul className="rail mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-3 sm:gap-4 sm:px-8 lg:px-[max(2rem,calc((100vw-1320px)/2+2rem))]" data-lenis-prevent data-reveal="stagger">
        {items.map((s) => (
          <li key={s.id} className="w-[46vw] max-w-[14rem] shrink-0 snap-start">
            <ShortCard id={s.id} title={s.title} />
          </li>
        ))}
      </ul>
    </section>
  );
}
