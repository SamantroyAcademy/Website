import Image from "next/image";
import { getPublished } from "@/lib/content";
import { AIR1_IMAGES } from "@/lib/homepage-defaults";
import { asArray } from "@/lib/shape";
import { mediaUrl } from "@/lib/supabase/media";
import CmsSectionHeading from "@/components/ui/CmsSectionHeading";

/** Top-rank result cards (CMS: air1_images). A swipeable snap rail, not a
 *  marquee (the page keeps a single marquee). Hidden until images exist. */
export default async function ToppersRail() {
  const doc = await getPublished<{ images: string[] }>("air1_images", { images: AIR1_IMAGES });
  const images = asArray<string>(doc.images).filter(Boolean);
  if (!images.length) return null;

  return (
    <section className="section-y overflow-hidden" aria-label="Top ranks">
      <div className="container-x">
        <CmsSectionHeading sectionKey="toppers" />
      </div>
      <ul className="rail mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 sm:px-8 lg:px-[max(2rem,calc((100vw-1320px)/2+2rem))]" data-lenis-prevent data-reveal="stagger">
        {images.map((src, i) => (
          <li key={src + i} className="relative aspect-[5/7] w-[62vw] max-w-[17rem] shrink-0 snap-start overflow-hidden rounded-[var(--radius-card)] bg-tint">
            <Image src={mediaUrl(src)} alt={`Top rank result ${i + 1}`} fill sizes="(min-width: 640px) 17rem, 62vw" className="object-cover" />
          </li>
        ))}
      </ul>
    </section>
  );
}
