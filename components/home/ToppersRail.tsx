import Image from "next/image";
import { ArrowsOutSimpleIcon } from "@phosphor-icons/react/ssr";
import { getPublished } from "@/lib/content";
import { AIR1_IMAGES } from "@/lib/homepage-defaults";
import { posterAlt } from "@/lib/hero-slides";
import { asArray } from "@/lib/shape";
import { mediaUrl } from "@/lib/supabase/media";
import CmsSectionHeading from "@/components/ui/CmsSectionHeading";

/** Result posters (CMS: air1_images). A swipeable snap rail, not a marquee
 *  (the page keeps a single marquee). Posters come in every shape, so each
 *  card shows the whole poster and opens it full size. Hidden when empty. */
export default async function ToppersRail() {
  const doc = await getPublished<{ images: string[] }>("air1_images", { images: AIR1_IMAGES });
  const images = asArray<string>(doc.images).filter(Boolean);
  if (!images.length) return null;

  return (
    <section className="section-y overflow-hidden" aria-label="Result posters">
      <div className="container-x">
        <CmsSectionHeading sectionKey="toppers" />
      </div>
      <ul className="rail mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 sm:px-8 lg:px-[max(2rem,calc((100vw-1320px)/2+2rem))]" data-lenis-prevent data-reveal="stagger">
        {images.map((src, i) => (
          <li key={src + i} className="w-[84vw] max-w-[30rem] shrink-0 snap-start">
            <a href={mediaUrl(src)} target="_blank" rel="noopener noreferrer"
              className="group relative block aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-brand-950">
              <Image aria-hidden src={mediaUrl(src)} alt="" fill sizes="30rem" className="scale-125 object-cover opacity-40 blur-2xl" />
              <Image src={mediaUrl(src)} alt={posterAlt(src, i)} fill sizes="(min-width: 640px) 30rem, 84vw"
                className="object-contain p-2 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.02]" />
              <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink opacity-0 shadow transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <ArrowsOutSimpleIcon size={16} weight="bold" />
                <span className="sr-only">Open full size</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
