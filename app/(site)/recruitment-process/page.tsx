import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import { pageMetadata } from "@/lib/seo";
import { getPublished } from "@/lib/content";
import { DAYS, type JourneyStage } from "@/lib/data";
import { JOURNEY_INTRO } from "@/lib/section-defaults";
import { coerceShape, asArray } from "@/lib/shape";
import { getFaqs } from "@/lib/public-data";
import CmsHero from "@/components/ui/CmsHero";
import StageIndex from "@/components/pages/StageIndex";
import { TONE_BG, TONE_TEXT } from "@/components/ui/tones";
import { FaqList } from "@/components/home/FaqSection";
import CtaBanner from "@/components/site/CtaBanner";
import Reveals from "@/components/motion/Reveals";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("recruitment-process");
}

/** Links from a stage to the page that goes deeper on it. */
const DEEPER: Record<string, { href: string; label: string }> = {
  APPLY: { href: "/eligibility", label: "Check your eligibility" },
  CBT: { href: "/mock-tests", label: "Take a free mock test" },
  PST: { href: "/standards", label: "Height and chest standards" },
  PET: { href: "/standards", label: "Run timings by exam" },
  MED: { href: "/standards#medical", label: "Medical standards" },
};

export default async function RecruitmentProcessPage() {
  const [doc, intro, faqs] = await Promise.all([
    getPublished<{ items: JourneyStage[] }>("journey", { items: DAYS }),
    getPublished<{ text: string }>("journey_intro", JOURNEY_INTRO),
    getFaqs(),
  ]);
  const stages = coerceShape(asArray<JourneyStage>(doc.items), DAYS)
    .filter((s) => s?.title)
    .map((s, i) => ({ ...s, id: `stage-${(s.code || String(i)).toLowerCase().replace(/[^a-z0-9]+/g, "-")}` }));

  return (
    <main>
      <CmsHero pageKey="recruitment-process" />

      <section className="section-y">
        <div className="container-x">
          <div className="rich-html max-w-3xl font-display text-[clamp(1.4rem,2.6vw,2.1rem)] font-bold leading-[1.25] tracking-tight text-ink" data-reveal dangerouslySetInnerHTML={{ __html: intro.text }} />

          <div className="mt-14 grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <StageIndex stages={stages.map((s) => ({ id: s.id, code: s.code, title: s.day || s.title }))} />
            </div>
            <div className="space-y-6 lg:col-span-9">
              {stages.map((s) => {
                const deeper = DEEPER[s.code?.toUpperCase()];
                return (
                  <article key={s.id} id={s.id} className="card relative scroll-mt-28 overflow-hidden p-7 sm:p-10" data-reveal>
                    <span aria-hidden className={`absolute inset-y-0 left-0 w-1.5 ${TONE_BG[s.service] ?? "bg-accent"}`} />
                    <div className="grid gap-8 md:grid-cols-12">
                      <div className="md:col-span-7">
                        <p className={`numeral text-5xl ${TONE_TEXT[s.service] ?? "text-brand-700"}`}>{s.code}</p>
                        <h2 className="mt-5 font-display text-[clamp(1.7rem,3vw,2.4rem)] font-extrabold leading-tight tracking-tight text-ink">{s.title}</h2>
                        {s.subtitle && <p className="mt-2 text-lg font-medium text-brand-600">{s.subtitle}</p>}
                        <div className="rich-html mt-5 leading-relaxed text-ink-2" dangerouslySetInnerHTML={{ __html: s.brief }} />
                        {deeper && (
                          <Link href={deeper.href} className="group mt-6 inline-flex items-center gap-1.5 font-semibold text-accent-ink">
                            {deeper.label} <ArrowRightIcon size={16} weight="bold" className="arrow" />
                          </Link>
                        )}
                      </div>
                      <div className="md:col-span-5">
                        {s.tests?.length > 0 && (
                          <>
                            <p className="text-sm font-semibold text-ink">Checked at this stage</p>
                            <ul className="mt-3 space-y-3">
                              {s.tests.map((t) => (
                                <li key={t.name} className="rounded-[14px] bg-paper px-4 py-3">
                                  <p className="font-semibold text-ink">{t.name}</p>
                                  <p className="text-sm text-muted">{t.detail}</p>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                        {s.drill && (
                          <div className="mt-4 rounded-[14px] bg-brand-50 px-4 py-4">
                            <p className="text-sm font-semibold text-brand-700">How we prepare you</p>
                            <div className="rich-html mt-1 leading-relaxed text-brand-900" dangerouslySetInnerHTML={{ __html: s.drill }} />
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {faqs.length > 0 && (
        <section className="section-y bg-surface">
          <div className="container-x grid gap-10 lg:grid-cols-12">
            <h2 data-split className="display-lg text-ink lg:col-span-4">Common questions</h2>
            <div className="lg:col-span-8"><FaqList items={faqs} /></div>
          </div>
        </section>
      )}

      <CtaBanner />
      <Reveals />
    </main>
  );
}
