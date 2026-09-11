import type { Metadata } from "next";
import { Suspense } from "react";
import { pageMetadata } from "@/lib/seo";
import { getPublished } from "@/lib/content";
import { GATEWAYS } from "@/lib/section-defaults";
import { asArray } from "@/lib/shape";
import { getExams, getStandards } from "@/lib/public-data";
import { lookupStandard } from "@/lib/standards";
import CmsHero from "@/components/ui/CmsHero";
import Icon from "@/components/Icon";
import ExamCard from "@/components/pages/ExamCard";
import ExamsBrowser from "@/components/pages/ExamsBrowser";
import CtaBanner from "@/components/site/CtaBanner";
import Reveals from "@/components/motion/Reveals";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("exams");
}

type Gateway = { icon: string; title: string; body: string; tags: string[] };

export default async function ExamsPage() {
  const [gw, exams, standards] = await Promise.all([
    getPublished<{ items: Gateway[] }>("gateways", { items: GATEWAYS }),
    getExams(),
    getStandards(),
  ]);
  const gateways = asArray<Gateway>(gw.items).filter((g) => g?.title);

  const items = exams.map((e) => {
    const std = lookupStandard(standards, e.slug, "male", "UR");
    return {
      slug: e.slug,
      name: e.name,
      short: e.short_name,
      force: e.force,
      vertical: e.vertical,
      card: <ExamCard exam={e} heightLine={std?.height_cm ? `${std.height_cm} cm` : undefined} />,
    };
  });

  return (
    <main>
      <CmsHero pageKey="exams" />

      {gateways.length > 0 && (
        <section className="section-y pb-0">
          <div className="container-x">
            <h2 data-split className="display-md text-ink">Where do you stand today?</h2>
            <ul className="mt-8 grid gap-4 md:grid-cols-3" data-reveal="stagger">
              {gateways.map((g) => (
                <li key={g.title} className="rounded-[var(--radius-card)] bg-brand-50 p-7">
                  <Icon name={g.icon} size={30} className="text-brand-700" />
                  <h3 className="mt-4 font-display text-2xl font-bold tracking-tight text-ink">{g.title}</h3>
                  <div className="rich-html mt-2 leading-relaxed text-ink-2" dangerouslySetInnerHTML={{ __html: g.body }} />
                  <ul className="mt-5 flex flex-wrap gap-1.5">
                    {asArray<string>(g.tags).map((t) => (
                      <li key={t} className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-brand-800">{t}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="section-y">
        <div className="container-x">
          <h2 data-split className="display-md mb-8 text-ink">All exams</h2>
          <Suspense>
            <ExamsBrowser items={items} />
          </Suspense>
          <p className="mt-8 max-w-2xl text-sm text-muted">
            Age bands and standards are indicative, from recent notifications. Always confirm with the official notification before applying.
          </p>
        </div>
      </section>

      <CtaBanner />
      <Reveals />
    </main>
  );
}
