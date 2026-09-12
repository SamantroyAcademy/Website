import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRightIcon, CheckIcon } from "@phosphor-icons/react/ssr";
import { getExamBySlug, getExams, getStandards, getCandidates } from "@/lib/public-data";
import { STAGE_LABELS, verticalLabel } from "@/lib/exams";
import { lookupStandard } from "@/lib/standards";
import { mediaUrl } from "@/lib/supabase/media";
import PageHero from "@/components/ui/PageHero";
import OpenEnquiry from "@/components/site/OpenEnquiry";
import StandardsTable from "@/components/pages/StandardsTable";
import ExamCard, { ageBand, genderLabel } from "@/components/pages/ExamCard";
import { CandidateTile } from "@/components/home/SelectionWall";
import CtaBanner from "@/components/site/CtaBanner";
import Reveals from "@/components/motion/Reveals";

export const dynamic = "force-dynamic";

const strip = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const exam = await getExamBySlug(slug);
  // Called here (before streaming starts) so an unknown slug gets a real 404.
  if (!exam) notFound();
  const title = `${exam.name}: Eligibility, Pattern and Physical Standards`;
  const description = strip(exam.intro).slice(0, 155) || `Eligibility, exam pattern, syllabus and physical standards for ${exam.name}.`;
  return { title, description, openGraph: { title, description }, alternates: { canonical: `/exams/${exam.slug}` } };
}

export default async function ExamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [exam, all, standards, candidates] = await Promise.all([getExamBySlug(slug), getExams(), getStandards(), getCandidates(60)]);
  if (!exam) notFound();

  const rows = standards.filter((r) => r.exam_slug === exam.slug);
  const related = all.filter((e) => e.vertical === exam.vertical && e.slug !== exam.slug).slice(0, 3);
  const selected = candidates.sample
    ? []
    : candidates.items.filter((c) => c.exam.toLowerCase().includes((exam.short_name || exam.name).toLowerCase())).slice(0, 6);

  const facts = [
    { k: "When you can apply", v: exam.stage },
    { k: "Qualification", v: exam.qualification },
    { k: "Age", v: ageBand(exam) },
    { k: "Open to", v: genderLabel(exam.gender) },
    exam.marital_status && { k: "Marital status", v: exam.marital_status },
    exam.domicile && { k: "Domicile", v: exam.domicile },
    exam.notification_month && { k: "Usual notification", v: exam.notification_month },
    exam.exam_month && { k: "Usual exam", v: exam.exam_month },
  ].filter(Boolean) as { k: string; v: string }[];

  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `${exam.name} preparation`,
    description: strip(exam.intro).slice(0, 300),
    provider: { "@type": "Organization", name: "Samantroy Academy" },
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }} />
      <PageHero
        crumb={exam.short_name || exam.name}
        kicker={verticalLabel(exam.vertical) + (exam.force ? `, ${exam.force}` : "")}
        title={exam.name}
        subtitle={strip(exam.intro)}
        compact
        aside={<OpenEnquiry presetEntry={exam.name} label="Book free counselling" />}
      />

      <section className="section-y pt-12">
        <div className="container-x grid gap-10 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            <div className="card p-6 lg:sticky lg:top-28" data-reveal>
              <p className="font-display text-xl font-bold text-ink">At a glance</p>
              <dl className="mt-4 divide-y divide-line">
                {facts.map((f) => (
                  <div key={f.k} className="py-3">
                    <dt className="text-xs text-muted">{f.k}</dt>
                    <dd className="mt-0.5 font-semibold leading-snug text-ink">{f.v || "See notification"}</dd>
                  </div>
                ))}
              </dl>
              {exam.official_url && (
                <a href={exam.official_url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm mt-5 w-full">
                  Official website <ArrowUpRightIcon size={16} weight="bold" />
                </a>
              )}
              <p className="mt-4 text-xs leading-relaxed text-muted">Indicative, from recent notifications. Confirm every figure in the official notification.</p>
            </div>
          </aside>

          <div className="space-y-14 lg:col-span-8">
            {exam.banner_path && (
              <div data-reveal="clip" className="relative aspect-[16/8] overflow-hidden rounded-[var(--radius-card)] bg-tint">
                <Image src={mediaUrl(exam.banner_path)} alt="" fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" />
              </div>
            )}

            {exam.stages.length > 0 && (
              <div data-reveal>
                <h2 className="display-md text-ink">How selection works</h2>
                <ol className="mt-6 flex flex-wrap gap-2">
                  {exam.stages.map((code, i) => (
                    <li key={code} className="flex items-center gap-2 rounded-full bg-surface py-2 pl-2 pr-4 text-sm font-semibold text-ink shadow-[inset_0_0_0_1px_var(--color-line)]">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-800 font-stencil text-xs text-surface">{i + 1}</span>
                      {STAGE_LABELS[code] ?? code}
                    </li>
                  ))}
                </ol>
                <Link href="/recruitment-process" className="mt-4 inline-block text-sm font-semibold text-accent-ink underline underline-offset-4">What happens at each stage</Link>
              </div>
            )}

            {exam.pattern && (
              <div data-reveal>
                <h2 className="display-md text-ink">Exam pattern</h2>
                <div className="rich-html prose-article mt-4" dangerouslySetInnerHTML={{ __html: exam.pattern }} />
              </div>
            )}

            {exam.syllabus && (
              <div data-reveal>
                <h2 className="display-md text-ink">Syllabus</h2>
                <div className="rich-html prose-article mt-4" dangerouslySetInnerHTML={{ __html: exam.syllabus }} />
              </div>
            )}

            <div data-reveal>
              <h2 className="display-md text-ink">Physical standards</h2>
              <p className="mt-2 text-ink-2">Height, chest and physical test for this exam. <Link href="/standards" className="font-semibold text-accent-ink underline underline-offset-4">Check your own numbers</Link>.</p>
              <div className="mt-6"><StandardsTable rows={rows} /></div>
            </div>

            {exam.salary && (
              <div data-reveal>
                <h2 className="display-md text-ink">Salary and career</h2>
                <div className="rich-html prose-article mt-4" dangerouslySetInnerHTML={{ __html: exam.salary }} />
              </div>
            )}

            <div className="rounded-[var(--radius-card)] bg-brand-50 p-7 sm:p-9" data-reveal>
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">Prepare for {exam.short_name || exam.name} with us</h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {["Written exam on this pattern", "Ground training to these standards", "Mocks with negative marking", "Form and document checks"].map((t) => (
                  <li key={t} className="flex gap-2.5 text-ink-2"><CheckIcon size={18} weight="bold" className="mt-0.5 shrink-0 text-brand-600" />{t}</li>
                ))}
              </ul>
              <div className="mt-7 flex flex-wrap gap-3">
                <OpenEnquiry presetEntry={exam.name} />
                <Link href="/courses" className="btn btn-ghost">See the batches</Link>
              </div>
            </div>

            {selected.length > 0 && (
              <div>
                <h2 className="display-md text-ink">Selected in {exam.short_name || exam.name}</h2>
                <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3" data-reveal="stagger">
                  {selected.map((c, i) => <li key={(c.id ?? c.name) + i}><CandidateTile c={c} /></li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section-y bg-surface">
          <div className="container-x">
            <h2 data-split className="display-md text-ink">Related exams</h2>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" data-reveal="stagger">
              {related.map((e) => {
                const h = lookupStandard(standards, e.slug, "male", "UR")?.height_cm;
                return <li key={e.slug}><ExamCard exam={e} heightLine={h ? `${h} cm` : undefined} /></li>;
              })}
            </ul>
          </div>
        </section>
      )}

      <CtaBanner />
      <Reveals />
    </main>
  );
}
