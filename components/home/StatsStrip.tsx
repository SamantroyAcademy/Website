import { getPublished } from "@/lib/content";
import { STATS, type Stat } from "@/lib/data";
import { RECENT_WINS } from "@/lib/section-defaults";
import { asArray } from "@/lib/shape";
import CmsSectionHeading from "@/components/ui/CmsSectionHeading";
import CountUp from "@/components/ui/CountUp";
import WinsRotator from "./WinsRotator";

/** Scoreboard (CMS: stats) plus the recent-wins line (CMS: recent_wins).
 *  Numbers are set in the stencil face: the one place it earns its keep. */
export default async function StatsStrip() {
  const [{ items }, winsDoc] = await Promise.all([
    getPublished<{ items: Stat[] }>("stats", { items: STATS }),
    getPublished<{ items: (string | { text: string })[] }>("recent_wins", { items: RECENT_WINS.map((text) => ({ text })) }),
  ]);
  const stats = asArray<Stat>(items).filter((s) => s?.label);
  const wins = asArray<string | { text: string }>(winsDoc.items)
    .map((w) => (typeof w === "string" ? w : w?.text ?? ""))
    .filter(Boolean);
  if (!stats.length) return null;

  return (
    <section className="section-y" aria-label="Results in numbers">
      <div className="container-x">
        <CmsSectionHeading sectionKey="stats" />
        <dl className="mt-12 grid grid-cols-2 border-t border-line lg:grid-cols-4" data-reveal="stagger">
          {stats.map((s, i) => (
            <div
              key={s.label + i}
              className={`flex flex-col-reverse py-8 pr-4 sm:py-10 ${i % 2 === 1 ? "pl-5 sm:pl-8" : ""} ${i > 1 ? "border-t border-line lg:border-t-0" : ""} ${i > 0 ? "lg:border-l lg:border-line lg:pl-8" : ""} ${i % 2 === 1 ? "border-l border-line" : ""}`}
            >
              <dt className="mt-3 text-sm font-medium text-muted sm:text-base">{s.label}</dt>
              <dd className="numeral text-[clamp(2.8rem,6vw,4.75rem)] text-ink">
                <CountUp value={Number(s.value) || 0} suffix={s.suffix ?? "+"} />
              </dd>
            </div>
          ))}
        </dl>
        {wins.length > 0 && <WinsRotator items={wins} />}
      </div>
    </section>
  );
}
