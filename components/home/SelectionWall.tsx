import Link from "@/components/ui/Link";
import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import { getCandidates, type Candidate } from "@/lib/public-data";
import { HOMEPAGE_WALL_COUNT } from "@/lib/candidates";
import CmsSectionHeading from "@/components/ui/CmsSectionHeading";
import Portrait from "@/components/ui/Portrait";
import SampleNote from "@/components/ui/SampleNote";

export function CandidateTile({ c, priority = false }: { c: Candidate; priority?: boolean }) {
  return (
    <figure className="group">
      <Portrait src={c.image_path} name={c.name} className="aspect-[4/5]" sizes="(min-width: 1024px) 16vw, (min-width: 640px) 25vw, 50vw" priority={priority} />
      <figcaption className="mt-3">
        <p translate="no" className="font-display text-lg font-bold leading-tight tracking-tight text-ink">{c.name}</p>
        <p className="mt-0.5 text-sm font-medium text-ink-2">{c.post || c.exam}</p>
        {c.hometown && <p translate="no" className="mt-0.5 text-[0.8rem] text-muted">{c.hometown}</p>}
      </figcaption>
    </figure>
  );
}

/** Wall of Selection preview (CMS: selected_candidates). Latest first. */
export default async function SelectionWall({ limit = HOMEPAGE_WALL_COUNT, showCta = true }: { limit?: number; showCta?: boolean }) {
  const { items, sample } = await getCandidates(limit);
  if (!items.length) return null;

  return (
    <section className="section-y" aria-label="Wall of Selection">
      <div className="container-x">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <CmsSectionHeading sectionKey="wall" />
          {showCta && (
            <Link href="/selected" className="btn btn-ghost group shrink-0 self-start md:self-auto" data-reveal>
              See the full wall <ArrowRightIcon size={18} weight="bold" className="arrow" />
            </Link>
          )}
        </div>
        {sample && <SampleNote className="mt-6" />}
        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6" data-reveal="stagger">
          {items.slice(0, limit).map((c, i) => (
            <li key={(c.id ?? c.name) + i}>
              <CandidateTile c={c} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
