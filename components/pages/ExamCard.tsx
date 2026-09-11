import Link from "next/link";
import { ArrowUpRightIcon } from "@phosphor-icons/react/ssr";
import type { Exam } from "@/lib/exams";
import { verticalLabel } from "@/lib/exams";
import { TONE_BG, VERTICAL_TONE } from "@/components/ui/tones";

const ageBand = (e: Exam) =>
  e.age_min != null && e.age_max != null ? `${e.age_min} to ${e.age_max} yrs`
    : e.age_min != null ? `${e.age_min}+ yrs` : e.age_max != null ? `Up to ${e.age_max} yrs` : "See notification";

const genderLabel = (g: Exam["gender"]) => (g === "both" ? "Men and women" : g === "male" ? "Men" : "Women");

/** One exam in the catalogue grid. Plain data in, no client code. */
export default function ExamCard({ exam, heightLine }: { exam: Exam; heightLine?: string }) {
  return (
    <Link href={`/exams/${exam.slug}`} className="group card relative flex h-full flex-col overflow-hidden p-6 transition-shadow hover:shadow-[var(--shadow-lift)]">
      <span aria-hidden className={`absolute inset-x-0 top-0 h-1 ${TONE_BG[VERTICAL_TONE[exam.vertical]] ?? "bg-accent"}`} />
      <div className="flex items-start justify-between gap-4">
        <p className="text-xs font-semibold text-muted">{verticalLabel(exam.vertical)}</p>
        <ArrowUpRightIcon size={20} weight="bold" className="shrink-0 text-brand-500 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </div>
      <h3 className="mt-3 font-display text-2xl font-extrabold leading-tight tracking-tight text-ink">{exam.name}</h3>
      {exam.force && <p className="mt-1 text-sm text-ink-2">{exam.force}</p>}
      <dl className="mt-auto grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-5 text-sm">
        <div><dt className="text-xs text-muted">Apply</dt><dd className="font-semibold text-ink">{exam.stage || "See notification"}</dd></div>
        <div><dt className="text-xs text-muted">Age</dt><dd className="font-semibold text-ink">{ageBand(exam)}</dd></div>
        <div><dt className="text-xs text-muted">Open to</dt><dd className="font-semibold text-ink">{genderLabel(exam.gender)}</dd></div>
        <div><dt className="text-xs text-muted">Height (men, UR)</dt><dd className="font-semibold text-ink">{heightLine || "See notification"}</dd></div>
      </dl>
    </Link>
  );
}

export { ageBand, genderLabel };
