import type { Metadata } from "next";
import Image from "next/image";
import { PlusIcon, InfoIcon } from "@phosphor-icons/react/ssr";
import { pageMetadata } from "@/lib/seo";
import { getExams, getStandards, getStandardsDoc } from "@/lib/public-data";
import { STANDARDS_DOC } from "@/lib/standards";
import { coerceShape, asArray } from "@/lib/shape";
import { mediaUrl } from "@/lib/supabase/media";
import CmsHero from "@/components/ui/CmsHero";
import SectionHeading from "@/components/ui/SectionHeading";
import Icon from "@/components/Icon";
import StandardsCalculator from "@/components/pages/StandardsCalculator";
import StandardsTable from "@/components/pages/StandardsTable";
import { FaqList } from "@/components/home/FaqSection";
import CtaBanner from "@/components/site/CtaBanner";
import Reveals from "@/components/motion/Reveals";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("standards");
}

export default async function StandardsPage() {
  const [docRaw, exams, rows] = await Promise.all([getStandardsDoc(), getExams(), getStandards()]);
  const doc = coerceShape(docRaw, STANDARDS_DOC);
  const examsWithRows = exams.filter((e) => rows.some((r) => r.exam_slug === e.slug));

  return (
    <main>
      <CmsHero pageKey="standards" />

      {/* The four checks */}
      <section className="section-y">
        <div className="container-x">
          <SectionHeading kicker={doc.kicker} kickerSize={doc.kickerSize} title={doc.processTitle} subtitle={doc.processIntro} />
          <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-reveal="stagger">
            {asArray<StandardsStage>(doc.stages).map((s, i) => (
              <li key={s.title + i} className="card p-6">
                <div className="flex items-center justify-between">
                  <Icon name={s.icon} size={30} className="text-brand-700" />
                  <span className="font-stencil text-lg text-accent-ink">{s.step}</span>
                </div>
                <h3 className="mt-5 font-display text-xl font-bold tracking-tight text-ink">{s.title}</h3>
                <div className="rich-html mt-2 text-[0.95rem] leading-relaxed text-ink-2" dangerouslySetInnerHTML={{ __html: s.detail }} />
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Calculator + tables */}
      <section className="section-y bg-tint" id="calculator">
        <div className="container-x">
          <SectionHeading title={doc.standardsTitle} subtitle={doc.standardsIntro} />
          {doc.verifiedOn && (
            <p className="mt-6 inline-flex items-start gap-2 rounded-[14px] bg-accent-50 px-4 py-3 text-sm font-medium text-accent-ink" data-reveal>
              <InfoIcon size={18} weight="bold" className="mt-0.5 shrink-0" /> {doc.verifiedOn}
            </p>
          )}
          <div className="mt-10" data-reveal>
            <StandardsCalculator exams={exams.map((e) => ({ slug: e.slug, name: e.name }))} rows={rows} />
          </div>

          <h3 className="mt-16 font-display text-2xl font-bold tracking-tight text-ink">All exams</h3>
          <div className="mt-5 space-y-3">
            {examsWithRows.map((e, i) => (
              <details key={e.slug} className="group card overflow-hidden" open={i === 0} data-reveal>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 [&::-webkit-details-marker]:hidden">
                  <span>
                    <span className="block font-display text-xl font-bold tracking-tight text-ink">{e.name}</span>
                    <span className="text-sm text-muted">{e.force}</span>
                  </span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-tint transition-transform duration-300 group-open:rotate-45">
                    <PlusIcon size={16} weight="bold" />
                  </span>
                </summary>
                <div className="border-t border-line bg-paper/50 p-5 sm:p-6">
                  <StandardsTable rows={rows.filter((r) => r.exam_slug === e.slug)} />
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Medical */}
      <section className="section-y" id="medical">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 data-split className="display-lg text-ink">Medical <span className="hl">standards</span></h2>
            {(doc.image1 || doc.image2) && (
              <div className="mt-10 grid grid-cols-2 gap-3">
                {[doc.image1, doc.image2].filter(Boolean).map((src, i) => (
                  <div key={src + i} data-reveal="clip" className={`relative overflow-hidden rounded-[var(--radius-card)] bg-tint ${i === 0 ? "aspect-[3/4]" : "mt-10 aspect-[3/4]"}`}>
                    <Image src={mediaUrl(src)} alt="" fill sizes="(min-width: 1024px) 20vw, 50vw" className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="lg:col-span-7">
            <ul className="grid gap-4 sm:grid-cols-2" data-reveal="stagger">
              {asArray<{ area: string; requirement: string; notes: string }>(doc.medical).map((m) => (
                <li key={m.area} className="card p-6">
                  <p className="font-display text-xl font-bold text-ink">{m.area}</p>
                  <p className="mt-2 leading-relaxed text-ink-2">{m.requirement}</p>
                  {m.notes && <p className="mt-3 text-sm text-muted">{m.notes}</p>}
                </li>
              ))}
            </ul>
            {asArray<string>(doc.common).length > 0 && (
              <div className="mt-12" data-reveal>
                <h3 className="font-display text-2xl font-bold tracking-tight text-ink">{doc.commonTitle}</h3>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {asArray<string>(doc.common).map((c) => (
                    <li key={c} className="rounded-full bg-accent-50 px-4 py-2 text-sm font-semibold text-accent-ink">{c}</li>
                  ))}
                </ul>
              </div>
            )}
            {doc.appealBody && (
              <div className="mt-12 rounded-[var(--radius-card)] bg-brand-50 p-7" data-reveal>
                <h3 className="font-display text-2xl font-bold tracking-tight text-ink">{doc.appealTitle}</h3>
                <div className="rich-html mt-3 space-y-3 leading-relaxed text-ink-2" dangerouslySetInnerHTML={{ __html: doc.appealBody }} />
              </div>
            )}
          </div>
        </div>
      </section>

      {asArray(doc.faqs).length > 0 && (
        <section className="section-y bg-surface">
          <div className="container-x grid gap-10 lg:grid-cols-12">
            <h2 data-split className="display-lg text-ink lg:col-span-4">Physical and medical questions</h2>
            <div className="lg:col-span-8">
              <FaqList items={asArray<{ q: string; a: string }>(doc.faqs).map((f) => ({ question: f.q, answer: f.a }))} />
            </div>
          </div>
        </section>
      )}

      <CtaBanner />
      <Reveals />
    </main>
  );
}

type StandardsStage = { icon: string; step: string; title: string; detail: string };
