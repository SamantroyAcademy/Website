"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircleIcon, WarningCircleIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { CATEGORIES, lookupStandard, margin, type Category, type StandardRow } from "@/lib/standards";

type ExamLite = { slug: string; name: string };

function Verdict({ label, have, need, unit = "cm" }: { label: string; have: number | null; need: number | null; unit?: string }) {
  if (need == null) return null;
  const m = margin(have, need);
  const ok = m != null && m >= 0;
  return (
    <div className={`rounded-[16px] p-5 ${m == null ? "bg-surface shadow-[inset_0_0_0_1px_var(--color-line)]" : ok ? "bg-brand-50" : "bg-accent-50"}`}>
      <p className="text-sm font-semibold text-ink-2">{label}</p>
      <p className="numeral mt-2 text-4xl text-ink">{need}<span className="ml-1 font-sans text-base font-semibold text-muted">{unit}</span></p>
      {m == null ? (
        <p className="mt-2 text-sm text-muted">Enter yours to compare</p>
      ) : ok ? (
        <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-brand-700"><CheckCircleIcon size={18} weight="fill" /> You clear it by {m} {unit}</p>
      ) : (
        <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-accent-ink"><WarningCircleIcon size={18} weight="fill" /> Short by {Math.abs(m)} {unit}</p>
      )}
    </div>
  );
}

/** PST / PET lookup. Reads the same rows as the tables below it (CMS:
 *  physical_standards), so there is one source of truth and no API call. */
export default function StandardsCalculator({ exams, rows }: { exams: ExamLite[]; rows: StandardRow[] }) {
  const withRows = exams.filter((e) => rows.some((r) => r.exam_slug === e.slug));
  const [exam, setExam] = useState(withRows[0]?.slug ?? "");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [category, setCategory] = useState<Category>("UR");
  const [height, setHeight] = useState("");
  const [chest, setChest] = useState("");

  const std = useMemo(() => lookupStandard(rows, exam, gender, category), [rows, exam, gender, category]);
  const h = height.trim() ? Number(height) : null;
  const c = chest.trim() ? Number(chest) : null;

  if (!withRows.length) return null;

  const pet = std
    ? ([
        std.run_distance_m ? [`${std.run_distance_m >= 1000 ? std.run_distance_m / 1000 + " km" : std.run_distance_m + " m"} run`, std.run_time || "See notification"] : null,
        std.long_jump ? ["Long jump", std.long_jump] : null,
        std.high_jump ? ["High jump", std.high_jump] : null,
        std.beam_pullups ? ["Other events", std.beam_pullups] : null,
        std.ditch ? ["Ditch", std.ditch] : null,
        std.zigzag ? ["Zig-zag balance", std.zigzag] : null,
      ].filter(Boolean) as [string, string][])
    : [];

  const pill = (on: boolean) =>
    `rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${on ? "bg-ink text-surface" : "bg-surface text-ink-2 shadow-[inset_0_0_0_1.5px_var(--color-line)] hover:text-ink"}`;

  return (
    <div className="card grid overflow-hidden lg:grid-cols-12">
      <form className="space-y-6 border-b border-line p-6 sm:p-8 lg:col-span-5 lg:border-b-0 lg:border-r" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label htmlFor="calc-exam" className="mb-1.5 block text-sm font-semibold text-ink">Exam</label>
          <select id="calc-exam" value={exam} onChange={(e) => setExam(e.target.value)} className="field">
            {withRows.map((e) => <option key={e.slug} value={e.slug}>{e.name}</option>)}
          </select>
        </div>
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-ink">Gender</legend>
          <div className="flex gap-2">
            {(["male", "female"] as const).map((g) => (
              <button key={g} type="button" aria-pressed={gender === g} onClick={() => setGender(g)} className={pill(gender === g)}>
                {g === "male" ? "Male" : "Female"}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-ink">Category</legend>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button key={cat} type="button" aria-pressed={category === cat} onClick={() => setCategory(cat)} className={pill(category === cat)}>{cat}</button>
            ))}
          </div>
        </fieldset>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="calc-h" className="mb-1.5 block text-sm font-semibold text-ink">Your height <span className="font-normal text-muted">cm</span></label>
            <input id="calc-h" inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value.replace(/[^\d.]/g, "").slice(0, 5))} placeholder="e.g. 168" className="field" />
          </div>
          {gender === "male" && (
            <div>
              <label htmlFor="calc-c" className="mb-1.5 block text-sm font-semibold text-ink">Your chest <span className="font-normal text-muted">cm</span></label>
              <input id="calc-c" inputMode="decimal" value={chest} onChange={(e) => setChest(e.target.value.replace(/[^\d.]/g, "").slice(0, 5))} placeholder="unexpanded" className="field" />
            </div>
          )}
        </div>
        <p className="text-xs leading-relaxed text-muted">Indicative, from recent notifications. Relaxations for some regions are not shown. Confirm in the official notification.</p>
      </form>

      <div className="bg-paper/60 p-6 sm:p-8 lg:col-span-7" aria-live="polite">
        {std ? (
          <>
            <p className="text-sm font-semibold text-muted">
              Standard for {gender === "male" ? "men" : "women"}{std.category !== "All" ? `, ${std.category}` : ""}{std.region ? `, ${std.region}` : ""}
              {std.category !== category && std.category !== "All" ? ` (no separate ${category} row, showing ${std.category})` : ""}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Verdict label="Minimum height" have={h} need={std.height_cm} />
              {gender === "male" && <Verdict label="Minimum chest (unexpanded)" have={c} need={std.chest_cm} />}
            </div>
            {std.chest_expanded_cm && gender === "male" && (
              <p className="mt-3 text-sm text-ink-2">Expanded chest must reach <b>{std.chest_expanded_cm} cm</b>.</p>
            )}
            {std.height_cm == null && std.chest_cm == null && (
              <p className="mt-2 text-ink-2">This exam has no height or chest standard.</p>
            )}
            {pet.length > 0 && (
              <>
                <p className="mt-7 text-sm font-semibold text-ink">Physical test</p>
                <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                  {pet.map(([k, v]) => (
                    <div key={k} className="rounded-[14px] bg-surface px-4 py-3 shadow-[inset_0_0_0_1px_var(--color-line)]">
                      <dt className="text-xs text-muted">{k}</dt>
                      <dd className="mt-0.5 font-semibold text-ink">{v}</dd>
                    </div>
                  ))}
                </dl>
              </>
            )}
            {std.notes && <p className="mt-5 text-sm leading-relaxed text-muted">{std.notes}</p>}
            <Link href={`/exams/${exam}`} className="group mt-6 inline-flex items-center gap-1.5 font-semibold text-accent-ink">
              Full exam details <ArrowRightIcon size={16} weight="bold" className="arrow" />
            </Link>
          </>
        ) : (
          <p className="text-ink-2">No {gender === "male" ? "male" : "female"} standard is listed for this exam. It may not be open to {gender === "male" ? "men" : "women"}, or the standard is set in each notification.</p>
        )}
      </div>
    </div>
  );
}
