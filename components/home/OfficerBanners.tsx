import Image from "next/image";
import { getPublished } from "@/lib/content";
import { OFFICER_BANNERS } from "@/lib/homepage-defaults";
import { asArray } from "@/lib/shape";
import { mediaUrl } from "@/lib/supabase/media";
import CmsSectionHeading from "@/components/ui/CmsSectionHeading";

/** "Now serving" alumni banners (CMS: officer_banners). A calm two-column
 *  grid of wide banners. Hidden until the academy uploads some. */
export default async function OfficerBanners({ limit = 6 }: { limit?: number }) {
  const doc = await getPublished<{ images: string[] }>("officer_banners", { images: OFFICER_BANNERS });
  const images = asArray<string>(doc.images).filter(Boolean).slice(0, limit);
  if (!images.length) return null;

  return (
    <section className="section-y" aria-label="Alumni now serving">
      <div className="container-x">
        <CmsSectionHeading sectionKey="officer_banners" />
        <ul className={`mt-10 grid gap-4 ${images.length > 1 ? "md:grid-cols-2" : ""}`} data-reveal="stagger">
          {images.map((src, i) => (
            <li key={src + i} className="relative aspect-[3/1] overflow-hidden rounded-[var(--radius-card)] bg-tint">
              <Image src={mediaUrl(src)} alt={`Alumnus in uniform ${i + 1}`} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
