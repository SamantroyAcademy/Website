import Image from "next/image";
import { StarIcon, ArrowUpRightIcon } from "@phosphor-icons/react/ssr";
import { getPublished } from "@/lib/content";
import { GOOGLE_PLACE_URL, type GoogleReview } from "@/lib/homepage-defaults";
import { asArray } from "@/lib/shape";
import { showable } from "@/lib/reviews";
import { mediaUrl } from "@/lib/supabase/media";
import CmsSectionHeading from "@/components/ui/CmsSectionHeading";
import Portrait from "@/components/ui/Portrait";

function Stars({ n }: { n: number }) {
  return (
    <span className="flex gap-0.5 text-accent" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon key={i} size={16} weight={i < Math.round(n) ? "fill" : "regular"} aria-hidden />
      ))}
    </span>
  );
}

/** Google reviews (CMS: google_reviews, imported via Places API or typed in).
 *  Never invented: hidden until the admin adds real ones. */
export default async function GoogleReviews() {
  const doc = await getPublished<{ items: GoogleReview[]; placeUrl?: string }>("google_reviews", { items: [] });
  const reviews = asArray<GoogleReview>(doc.items).filter((r) => r && showable(r));
  if (!reviews.length) return null;
  const placeUrl = doc.placeUrl || GOOGLE_PLACE_URL;

  return (
    <section className="section-y" aria-label="Google reviews">
      <div className="container-x">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <CmsSectionHeading sectionKey="google_reviews" />
          <a href={placeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost shrink-0 self-start md:self-auto" data-reveal>
            All reviews on Google <ArrowUpRightIcon size={16} weight="bold" />
          </a>
        </div>
        <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3" data-reveal="stagger">
          {reviews.slice(0, 6).map((r, i) => (
            <li key={r.name + i} className="card flex flex-col p-6">
              <Stars n={r.rating || 5} />
              {r.text && <p translate="no" className="mt-4 line-clamp-5 leading-relaxed text-ink-2">{r.text}</p>}
              {!!r.photos?.length && (
                <div className={`mt-4 grid gap-2 ${r.photos.length === 1 ? "grid-cols-1" : r.photos.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                  {r.photos.slice(0, 3).map((p) => (
                    <span key={p} className={`relative overflow-hidden rounded-xl bg-tint ${r.photos!.length === 1 ? "aspect-[16/10]" : "aspect-square"}`}>
                      <Image src={mediaUrl(p)} alt={`Photo from ${r.name}'s review`} fill sizes="(min-width: 1024px) 12rem, 30vw" className="object-cover" />
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-auto flex items-center gap-3 pt-6">
                {r.avatar ? (
                  <span className="relative h-10 w-10 overflow-hidden rounded-full bg-tint">
                    <Image src={mediaUrl(r.avatar)} alt="" fill sizes="40px" className="object-cover" />
                  </span>
                ) : (
                  <Portrait name={r.name} className="h-10 w-10" rounded="rounded-full" monoClass="text-sm" />
                )}
                <div>
                  <p translate="no" className="text-sm font-semibold text-ink">{r.name}</p>
                  {r.date && <p className="text-xs text-muted">{r.date}</p>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
