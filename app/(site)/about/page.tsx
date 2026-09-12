import type { Metadata } from "next";
import Image from "next/image";
import { pageMetadata } from "@/lib/seo";
import { getPublished } from "@/lib/content";
import { ABOUT_MISSION, ABOUT_VALUES, STORY, STORY_GAPS } from "@/lib/section-defaults";
import { asArray } from "@/lib/shape";
import { mediaUrl } from "@/lib/supabase/media";
import CmsHero from "@/components/ui/CmsHero";
import SectionHeading from "@/components/ui/SectionHeading";
import Icon from "@/components/Icon";
import Mentors from "@/components/home/Mentors";
import StatsStrip from "@/components/home/StatsStrip";
import CtaBanner from "@/components/site/CtaBanner";
import Reveals from "@/components/motion/Reveals";

// Cached for everyone; a CMS publish refreshes it at once (revalidateTag).
export const revalidate = 300;
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("about");
}

type Card = { icon: string; title: string; body: string };

export default async function AboutPage() {
  const [mission, story, gaps, values] = await Promise.all([
    getPublished("about_mission", ABOUT_MISSION),
    getPublished("story", STORY),
    getPublished<{ items: Card[] }>("story_gaps", { items: STORY_GAPS }),
    getPublished<{ items: Card[] }>("about_values", { items: ABOUT_VALUES }),
  ]);
  const gapItems = asArray<Card>(gaps.items).filter((g) => g?.title);
  const valueItems = asArray<Card>(values.items).filter((v) => v?.title);

  return (
    <main>
      <CmsHero pageKey="about" />

      {/* Mission: text and a portrait photo, offset. */}
      <section className="section-y">
        <div className="container-x grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6">
            <SectionHeading kicker={mission.kicker} kickerSize={(mission as { kickerSize?: string }).kickerSize} title={mission.title} />
            <div className="rich-html lede mt-6 space-y-4" data-reveal data-i18n="html" dangerouslySetInnerHTML={{ __html: mission.body }} />
          </div>
          {mission.image && (
            <div className="lg:col-span-5 lg:col-start-8">
              <div data-reveal="clip" className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-tint">
                <div data-parallax="8" className="absolute -inset-y-[10%] inset-x-0">
                  <Image src={mediaUrl(mission.image)} alt="Training at the academy" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Why aspirants fail: the problem the academy was built to solve. */}
      <section className="section-y bg-surface">
        <div className="container-x">
          <SectionHeading kicker={story.kicker} title={story.title} />
          <div className="rich-html lede mt-6" data-reveal data-i18n="html" dangerouslySetInnerHTML={{ __html: story.paragraph }} />
          {gapItems.length > 0 && (
            <ol className="mt-12 grid gap-px overflow-hidden rounded-[var(--radius-card)] bg-line md:grid-cols-3" data-reveal="stagger">
              {gapItems.map((g, i) => (
                <li key={g.title + i} className="bg-surface p-7 sm:p-8">
                  <Icon name={g.icon} size={30} className="text-accent-ink" />
                  <h3 className="mt-5 font-display text-2xl font-bold tracking-tight text-ink">{g.title}</h3>
                  <div className="rich-html mt-3 leading-relaxed text-ink-2" data-i18n="html" dangerouslySetInnerHTML={{ __html: g.body }} />
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      {/* Values */}
      {valueItems.length > 0 && (
        <section className="section-y">
          <div className="container-x grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 data-split className="display-lg text-ink">What we hold <span className="hl">every aspirant</span> to</h2>
            </div>
            <ul className="grid gap-8 sm:grid-cols-3 lg:col-span-8" data-reveal="stagger">
              {valueItems.map((v, i) => (
                <li key={v.title + i} className="border-t-2 border-ink pt-6">
                  <Icon name={v.icon} size={28} className="text-brand-600" />
                  <h3 className="mt-4 font-display text-xl font-bold tracking-tight text-ink">{v.title}</h3>
                  <p className="mt-2 leading-relaxed text-ink-2">{v.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <Mentors />
      <StatsStrip />
      <CtaBanner />
      <Reveals />
    </main>
  );
}
