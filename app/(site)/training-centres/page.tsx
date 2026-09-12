import type { Metadata } from "next";
import Image from "next/image";
import { pageMetadata } from "@/lib/seo";
import { getPublished } from "@/lib/content";
import { CENTRES_DOC, type CentresDoc, type Centre } from "@/lib/centres";
import { coerceShape, asArray } from "@/lib/shape";
import { mediaUrl } from "@/lib/supabase/media";
import CmsHero from "@/components/ui/CmsHero";
import SectionHeading from "@/components/ui/SectionHeading";
import CtaBanner from "@/components/site/CtaBanner";
import Reveals from "@/components/motion/Reveals";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("training-centres");
}

export default async function TrainingCentresPage() {
  const doc = coerceShape(await getPublished<CentresDoc>("centres", CENTRES_DOC), CENTRES_DOC);
  const centres = asArray<Centre>(doc.items).filter((c) => c?.name);

  return (
    <main>
      <CmsHero pageKey="training-centres" />
      <section className="section-y">
        <div className="container-x">
          <SectionHeading kicker={doc.kicker} kickerSize={doc.kickerSize} title={doc.title} subtitle={doc.subtitle} />
          <div className="mt-14 space-y-20 sm:space-y-28">
            {centres.map((c, i) => (
              <article key={c.name + i} className="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-14">
                <div className={`lg:col-span-6 ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                  <div data-reveal="clip" className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-tint">
                    {c.image && (
                      <div data-parallax="7" className="absolute -inset-y-[9%] inset-x-0">
                        <Image src={mediaUrl(c.image)} alt={c.name} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="lg:col-span-6" data-reveal>
                  <p className="numeral text-3xl text-accent-ink">{c.short}</p>
                  <h2 className="mt-3 font-display text-[clamp(1.9rem,3.4vw,2.8rem)] font-extrabold leading-tight tracking-tight text-ink">{c.name}</h2>
                  {c.motto && <p className="mt-1 text-lg font-medium text-brand-600">{c.motto}</p>}
                  <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-sm">
                    {c.location && <div><dt className="text-muted">Location</dt><dd className="font-semibold text-ink">{c.location}</dd></div>}
                    {c.service && <div><dt className="text-muted">Force</dt><dd className="font-semibold text-ink">{c.service}</dd></div>}
                    {c.established && <div><dt className="text-muted">Established</dt><dd className="font-semibold text-ink">{c.established}</dd></div>}
                  </dl>
                  <div className="rich-html mt-5 leading-relaxed text-ink-2" dangerouslySetInnerHTML={{ __html: c.intro }} />
                  {asArray(c.courses).length > 0 && (
                    <ul className="mt-6 space-y-2">
                      {asArray<Centre["courses"][number]>(c.courses).map((k) => (
                        <li key={k.name} className="rounded-[14px] bg-surface px-4 py-3 shadow-[inset_0_0_0_1px_var(--color-line)]">
                          <p className="font-semibold text-ink">{k.name}</p>
                          <p className="text-sm text-muted">{[k.duration, k.who].filter(Boolean).join(". ")}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                  {asArray(c.highlights).length > 0 && (
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {asArray<string>(c.highlights).map((h) => (
                        <li key={h} className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-800">{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <CtaBanner />
      <Reveals />
    </main>
  );
}
