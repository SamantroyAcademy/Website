import type { Metadata } from "next";
import { QuotesIcon } from "@phosphor-icons/react/ssr";
import { pageMetadata } from "@/lib/seo";
import { getTestimonials } from "@/lib/public-data";
import CmsHero from "@/components/ui/CmsHero";
import Portrait from "@/components/ui/Portrait";
import SampleNote from "@/components/ui/SampleNote";
import VideosSection from "@/components/home/VideosSection";
import GoogleReviews from "@/components/home/GoogleReviews";
import SocialBand from "@/components/home/SocialBand";
import CtaBanner from "@/components/site/CtaBanner";
import Reveals from "@/components/motion/Reveals";

// Cached for everyone; a CMS publish refreshes it at once (revalidateTag).
export const revalidate = 300;
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("testimonials");
}

export default async function TestimonialsPage() {
  const { items, sample } = await getTestimonials();
  return (
    <main>
      <CmsHero pageKey="testimonials" compact />
      <section className="pb-20 pt-10 sm:pt-14">
        <div className="container-x">
          {sample && <SampleNote className="mb-8" />}
          <ul className="columns-1 gap-5 sm:columns-2 lg:columns-3">
            {items.map((t, i) => (
              <li key={(t.id ?? t.name) + i} className="card mb-5 break-inside-avoid p-7" data-reveal>
                <QuotesIcon size={30} weight="fill" className="text-accent" aria-hidden />
                <div className="rich-html mt-3 text-lg leading-relaxed text-ink" data-i18n="html" dangerouslySetInnerHTML={{ __html: t.body }} />
                <div className="mt-6 flex items-center gap-3">
                  <Portrait src={t.image_path} name={t.name} className="h-12 w-12 shrink-0" rounded="rounded-full" sizes="48px" monoClass="text-base" />
                  <div>
                    <p className="font-semibold text-ink">{t.name}</p>
                    {t.rank && <p className="text-sm text-muted">{t.rank}</p>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <VideosSection limit={6} />
      <GoogleReviews />
      <SocialBand />
      <CtaBanner />
      <Reveals />
    </main>
  );
}
