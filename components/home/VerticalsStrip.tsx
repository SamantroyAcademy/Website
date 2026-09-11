import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon } from "@phosphor-icons/react/ssr";
import { getPublished } from "@/lib/content";
import { VERTICALS_DOC, type VerticalsDoc, type VerticalCard } from "@/lib/verticals";
import { coerceShape, asArray } from "@/lib/shape";
import { mediaUrl } from "@/lib/supabase/media";
import SectionHeading from "@/components/ui/SectionHeading";
import Icon from "@/components/Icon";
import { TONE_BG } from "@/components/ui/tones";

/** Six Verticals (CMS: verticals). Desktop: an expanding-panel accordion,
 *  pure CSS (first panel open, hover or keyboard focus opens another).
 *  Mobile: a swipeable snap rail. */
export default async function VerticalsStrip() {
  const doc = coerceShape(await getPublished<VerticalsDoc>("verticals", VERTICALS_DOC), VERTICALS_DOC);
  const cards = asArray<VerticalCard>(doc.cards).filter((c) => c?.name);
  if (!cards.length) return null;

  return (
    <section className="section-y" aria-labelledby="verticals-title">
      <div className="container-x">
        <SectionHeading kicker={doc.kicker} title={doc.title} subtitle={doc.subtitle} />
      </div>

      {/* Desktop accordion */}
      <div className="container-x mt-12 hidden lg:block">
        <ul className="group/acc flex h-[34rem] gap-3" data-reveal="stagger">
          {cards.map((c, i) => (
            <li
              key={c.name + i}
              className={`group/p relative min-w-0 overflow-hidden rounded-[var(--radius-card)] bg-brand-900 transition-[flex-grow] duration-700 ease-[var(--ease-out-expo)]
                ${i === 0 ? "grow-[3.4] group-has-[li:hover]/acc:grow group-has-[li:focus-within]/acc:grow" : "grow"}
                hover:!grow-[3.4] focus-within:!grow-[3.4]`}
              style={{ flexBasis: 0 }}
            >
              <Image src={mediaUrl(c.image)} alt={c.alt || c.name} fill sizes="(min-width: 1320px) 700px, 50vw"
                className="object-cover opacity-90 transition-transform duration-[1200ms] ease-out group-hover/p:scale-105" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-950/35 to-transparent" />
              <span aria-hidden className={`absolute inset-x-0 top-0 h-1 ${TONE_BG[c.tone] ?? "bg-accent"}`} />

              <Link href={c.link || "/exams"} className="absolute inset-0 flex flex-col justify-end p-5 text-surface outline-offset-[-4px] xl:p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/12 backdrop-blur">
                  <Icon name={c.icon} size={22} className="text-accent" />
                </span>
                <span className="mt-4 block font-display text-xl font-extrabold leading-tight tracking-tight xl:text-2xl">{c.name}</span>
                <span className="mt-1 block text-sm leading-snug text-brand-100">{c.motto}</span>

                {/* Only visible while this panel is open */}
                <span
                  className={`grid transition-[grid-template-rows,opacity] duration-700 ease-[var(--ease-out-expo)]
                    ${i === 0 ? "grid-rows-[1fr] opacity-100 group-has-[li:hover]/acc:grid-rows-[0fr] group-has-[li:hover]/acc:opacity-0 group-has-[li:focus-within]/acc:grid-rows-[0fr] group-has-[li:focus-within]/acc:opacity-0" : "grid-rows-[0fr] opacity-0"}
                    group-hover/p:!grid-rows-[1fr] group-hover/p:!opacity-100 group-focus-within/p:!grid-rows-[1fr] group-focus-within/p:!opacity-100`}
                >
                  <span className="overflow-hidden">
                    <span className="mt-4 block max-w-md text-[0.95rem] leading-relaxed text-brand-50">{c.desc}</span>
                    <span className="mt-4 flex flex-wrap gap-1.5">
                      {asArray<string>(c.entries).map((e) => (
                        <span key={e} className="rounded-full bg-white/12 px-2.5 py-1 text-xs font-medium backdrop-blur">{e}</span>
                      ))}
                    </span>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                      See the exams <ArrowUpRightIcon size={16} weight="bold" />
                    </span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Mobile / tablet rail */}
      <div className="mt-10 lg:hidden">
        <ul className="rail flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 sm:px-8" data-lenis-prevent>
          {cards.map((c, i) => (
            <li key={c.name + i} className="relative aspect-[4/5] w-[78vw] max-w-[22rem] shrink-0 snap-start overflow-hidden rounded-[var(--radius-card)] bg-brand-900">
              <Image src={mediaUrl(c.image)} alt={c.alt || c.name} fill sizes="80vw" className="object-cover opacity-90" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-brand-950/95 via-brand-950/45 to-transparent" />
              <span aria-hidden className={`absolute inset-x-0 top-0 h-1 ${TONE_BG[c.tone] ?? "bg-accent"}`} />
              <Link href={c.link || "/exams"} className="absolute inset-0 flex flex-col justify-end p-5 text-surface">
                <Icon name={c.icon} size={24} className="text-accent" />
                <span className="mt-3 font-display text-2xl font-extrabold tracking-tight">{c.name}</span>
                <span className="text-sm text-brand-100">{c.motto}</span>
                <span className="mt-3 text-[0.92rem] leading-relaxed text-brand-50">{c.desc}</span>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                  See the exams <ArrowUpRightIcon size={16} weight="bold" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
