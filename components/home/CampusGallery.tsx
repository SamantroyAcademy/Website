import Image from "next/image";
import { getPublished } from "@/lib/content";
import { CAMPUS_IMAGES } from "@/lib/homepage-defaults";
import { asArray } from "@/lib/shape";
import { mediaUrl } from "@/lib/supabase/media";
import CmsSectionHeading from "@/components/ui/CmsSectionHeading";

/** Bento spans per photo count, on a 2-column (mobile) and 4-column
 *  (desktop) grid. Every layout fills its rows exactly, so there is never an
 *  empty tile, whatever number of photos the admin uploads. */
const BIG = "col-span-2 row-span-2";
const LAYOUTS: Record<number, string[]> = {
  1: ["col-span-2 row-span-2 sm:col-span-4"],
  2: ["col-span-2 sm:row-span-2", "col-span-2 sm:row-span-2"],
  3: [BIG, "sm:col-span-2", "sm:col-span-2"],
  4: [BIG, "", "", "col-span-2"],
  5: [BIG, "", "", "", ""],
  6: [BIG, "", "", "col-span-2", "sm:col-span-2", "sm:col-span-2"],
};
function layoutFor(total: number): { count: number; spans: string[] } {
  if (total >= 8) return { count: 8, spans: Array(8).fill("") };
  const count = Math.min(total, 6);
  return { count, spans: LAYOUTS[count] };
}

/** Campus and ground gallery (CMS: campus_images). Bento grid; each photo
 *  drifts slightly inside its frame for depth. */
export default async function CampusGallery({ limit = 6 }: { limit?: number }) {
  const doc = await getPublished<{ images: string[] }>("campus_images", { images: CAMPUS_IMAGES });
  const all = asArray<string>(doc.images).filter(Boolean).slice(0, Math.max(limit, 8));
  if (!all.length) return null;
  const { count, spans } = layoutFor(all.length);
  const images = all.slice(0, count);

  return (
    <section className="section-y" aria-label="Campus gallery">
      <div className="container-x">
        <CmsSectionHeading sectionKey="campus" />
        <ul className="mt-10 grid auto-rows-[11rem] grid-cols-2 gap-3 sm:auto-rows-[13rem] sm:grid-cols-4 sm:gap-4">
          {images.map((src, i) => (
            <li
              key={src + i}
              data-reveal="clip"
              className={`relative overflow-hidden rounded-[var(--radius-card)] bg-tint ${spans[i] ?? ""}`}
            >
              <div data-parallax="6" className="absolute -inset-y-[8%] inset-x-0">
                <Image src={mediaUrl(src)} alt="" fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
