import { getPublished } from "@/lib/content";
import { TRACKER, type TrackerDoc } from "@/lib/selection-defaults";
import { getSelections } from "@/lib/public-data";
import CountUp from "@/components/ui/CountUp";
import SectionHeading from "@/components/ui/SectionHeading";
import TrackerBars from "./TrackerBars";

/** Selections by year and exam (CMS: selections + selection_tracker).
 *  Reports only real rows: with none, the section stays hidden. */
export default async function SelectionTracker() {
  const [rows, doc] = await Promise.all([getSelections(), getPublished<TrackerDoc>("selection_tracker", TRACKER)]);
  if (!rows.length) return null;

  const total = rows.reduce((s, r) => s + (r.count || 0), 0);
  const years = new Set(rows.map((r) => r.year)).size;
  const places = new Set(rows.map((r) => r.center).filter(Boolean)).size;

  const byExam = new Map<string, number>();
  for (const r of rows) byExam.set(r.exam, (byExam.get(r.exam) ?? 0) + (r.count || 0));
  const bars = [...byExam.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([exam, count]) => ({ exam, count }));

  // A blank override means "count it from the rows"; any text is shown verbatim.
  const cards = [
    { label: doc.totalLabel, value: total, suffix: "+", override: doc.totalOverride?.trim() },
    { label: doc.yearsLabel, value: years, suffix: "", override: doc.yearsOverride?.trim() },
    { label: doc.centresLabel, value: places, suffix: "", override: doc.centresOverride?.trim() },
  ].filter((c) => c.label);

  return (
    <section className="section-y" aria-label="Selection tracker">
      <div className="container-x grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading kicker={doc.kicker} title={doc.heading} subtitle={doc.subtitle} />
          <dl className="mt-10 grid grid-cols-3 gap-4" data-reveal="stagger">
            {cards.map((c) => (
              <div key={c.label} className="flex flex-col-reverse">
                <dt className="mt-2 text-sm text-muted">{c.label}</dt>
                <dd className="numeral text-[clamp(2rem,4vw,3rem)] text-ink">
                  {c.override ? c.override : <CountUp value={c.value} suffix={c.suffix} />}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="lg:col-span-7">
          {doc.barsHeading && <p className="text-sm font-semibold text-ink-2">{doc.barsHeading}</p>}
          <TrackerBars bars={bars} />
        </div>
      </div>
    </section>
  );
}
