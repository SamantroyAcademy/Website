"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import Link from "@/components/ui/Link";
import { gsap } from "gsap";
import { ArrowLeftIcon, ArrowRightIcon, CheckCircleIcon, WarningCircleIcon, ArrowCounterClockwiseIcon } from "@phosphor-icons/react";
import type { Exam, Education } from "@/lib/exams";
import type { StandardRow, Category } from "@/lib/standards";
import { assess, type EligibilityInput } from "@/lib/eligibility";
import { prefersReducedMotion } from "@/components/motion/MotionProvider";
import Turnstile, { waitForTurnstile } from "@/components/ui/Turnstile";

const EDUCATION: { value: Education; label: string }[] = [
  { value: "8th", label: "Class 8" },
  { value: "10th", label: "Class 10" },
  { value: "iti-diploma", label: "ITI or diploma" },
  { value: "12th-other", label: "Class 12 (arts or commerce)" },
  { value: "12th-science", label: "Class 12 (science)" },
  { value: "graduate", label: "Graduate" },
];

const STEPS = ["About you", "Education", "Measurements", "Category and state"];

type Form = {
  age: string; gender: "male" | "female"; marital: "unmarried" | "married";
  education: Education; pcm: boolean; height: string; chest: string;
  category: Category; domicile: "odisha" | "other";
};

const pill = (on: boolean) =>
  `rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${on ? "bg-ink text-surface" : "bg-surface text-ink-2 shadow-[inset_0_0_0_1.5px_var(--color-line)] hover:text-ink"}`;

export default function EligibilityFinder({ exams, standards }: { exams: Exam[]; standards: StandardRow[] }) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [f, setF] = useState<Form>({
    age: "", gender: "male", marital: "unmarried", education: "10th", pcm: false,
    height: "", chest: "", category: "UR", domicile: "odisha",
  });
  const panel = useRef<HTMLDivElement>(null);
  const set = (p: Partial<Form>) => setF((s) => ({ ...s, ...p }));

  const age = Number(f.age);
  const ageOk = f.age !== "" && age >= 14 && age <= 45;
  const canNext = step === 0 ? ageOk : true;

  const input: EligibilityInput = {
    age, gender: f.gender, marital: f.marital, education: f.education,
    pcm: f.education === "12th-science" ? f.pcm : false,
    heightCm: f.height ? Number(f.height) : null,
    chestCm: f.chest ? Number(f.chest) : null,
    category: f.category, domicile: f.domicile,
  };
  const verdicts = useMemo(() => (done ? assess(input, exams, standards) : []), [done, exams, standards]); // eslint-disable-line react-hooks/exhaustive-deps
  const eligible = verdicts.filter((v) => v.eligible);
  const near = verdicts.filter((v) => !v.eligible && v.reasons.length === 1);

  const go = (next: number) => {
    const apply = () => { setStep(next); panel.current?.querySelector<HTMLElement>("input, button")?.focus({ preventScroll: true }); };
    if (!panel.current || prefersReducedMotion()) return apply();
    gsap.to(panel.current, { opacity: 0, x: next > step ? -16 : 16, duration: 0.18, onComplete: () => {
      apply();
      gsap.fromTo(panel.current, { opacity: 0, x: next > step ? 16 : -16 }, { opacity: 1, x: 0, duration: 0.35, ease: "expo.out" });
    } });
  };

  if (done) {
    return (
      <div className="space-y-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-brand-600">Your result</p>
            <h2 className="display-md mt-1 text-ink">
              {eligible.length ? <>You can apply for <span className="hl">{eligible.length} {eligible.length === 1 ? "exam" : "exams"}</span></> : "No exact match yet"}
            </h2>
          </div>
          <button type="button" onClick={() => { setDone(false); setStep(0); }} className="btn btn-ghost btn-sm">
            <ArrowCounterClockwiseIcon size={16} weight="bold" /> Start again
          </button>
        </div>

        {eligible.length > 0 && (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {eligible.map(({ exam, notes }) => (
              <li key={exam.slug}>
                <Link href={`/exams/${exam.slug}`} className="group card flex h-full flex-col p-5 transition-shadow hover:shadow-[var(--shadow-lift)]">
                  <span className="flex items-start justify-between gap-3">
                    <span className="font-display text-lg font-bold leading-tight text-ink">{exam.name}</span>
                    <CheckCircleIcon size={22} weight="fill" className="shrink-0 text-brand-600" />
                  </span>
                  <span className="mt-1 text-sm text-muted">{exam.force}</span>
                  {notes[0] && <span className="mt-3 text-xs text-muted">{notes[0]}</span>}
                  <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-accent-ink">Exam details <ArrowRightIcon size={14} weight="bold" className="arrow" /></span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {near.length > 0 && (
          <div>
            <h3 className="font-display text-2xl font-bold tracking-tight text-ink">Close, but one thing stands in the way</h3>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {near.map(({ exam, reasons }) => (
                <li key={exam.slug} className="flex gap-3 rounded-[16px] bg-accent-50 p-4">
                  <WarningCircleIcon size={22} weight="fill" className="mt-0.5 shrink-0 text-accent-ink" />
                  <span>
                    <Link href={`/exams/${exam.slug}`} className="font-semibold text-ink underline-offset-4 hover:underline">{exam.name}</Link>
                    <span className="block text-sm text-ink-2">{reasons[0]}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <LeadCapture input={input} eligible={eligible.map((v) => v.exam.name)} />
        <p className="text-xs text-muted">Indicative, based on recent notifications. Relaxations for some regions and categories may widen your options. Confirm in the official notification.</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-line px-6 pt-6 sm:px-8">
        <ol className="flex gap-2 pb-5" aria-label="Progress">
          {STEPS.map((s, i) => (
            <li key={s} className="flex-1">
              <span className={`block h-1 rounded-full ${i <= step ? "bg-accent" : "bg-tint-2"}`} />
              <span className={`mt-2 hidden text-xs font-semibold sm:block ${i === step ? "text-ink" : "text-muted"}`}>{s}</span>
            </li>
          ))}
        </ol>
      </div>

      <form
        className="p-6 sm:p-8"
        onSubmit={(e: FormEvent) => { e.preventDefault(); if (!canNext) return; if (step < STEPS.length - 1) go(step + 1); else setDone(true); }}
      >
        <div ref={panel} className="min-h-[15rem]">
          <p className="text-sm font-semibold text-muted sm:hidden">{STEPS[step]}</p>
          {step === 0 && (
            <div className="space-y-6">
              <div className="max-w-xs">
                <label htmlFor="el-age" className="mb-1.5 block text-sm font-semibold text-ink">Your age in years</label>
                <input id="el-age" inputMode="numeric" value={f.age} onChange={(e) => set({ age: e.target.value.replace(/\D/g, "").slice(0, 2) })} placeholder="e.g. 19" className="field text-lg" aria-describedby="el-age-help" />
                <p id="el-age-help" className="mt-1.5 text-xs text-muted">Use your age on the notification&apos;s cut-off date if you know it.</p>
              </div>
              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-ink">Gender</legend>
                <div className="flex gap-2">
                  {(["male", "female"] as const).map((g) => <button key={g} type="button" aria-pressed={f.gender === g} onClick={() => set({ gender: g })} className={pill(f.gender === g)}>{g === "male" ? "Male" : "Female"}</button>)}
                </div>
              </fieldset>
              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-ink">Marital status</legend>
                <div className="flex gap-2">
                  {(["unmarried", "married"] as const).map((m) => <button key={m} type="button" aria-pressed={f.marital === m} onClick={() => set({ marital: m })} className={pill(f.marital === m)}>{m === "unmarried" ? "Unmarried" : "Married"}</button>)}
                </div>
              </fieldset>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-6">
              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-ink">Highest education you have completed</legend>
                <div className="flex flex-wrap gap-2">
                  {EDUCATION.map((e) => <button key={e.value} type="button" aria-pressed={f.education === e.value} onClick={() => set({ education: e.value })} className={pill(f.education === e.value)}>{e.label}</button>)}
                </div>
              </fieldset>
              {f.education === "12th-science" && (
                <label className="flex items-center gap-3 text-ink">
                  <input type="checkbox" checked={f.pcm} onChange={(e) => set({ pcm: e.target.checked })} className="h-5 w-5 accent-[var(--color-brand-700)]" />
                  I studied Physics and Maths in Class 12
                </label>
              )}
            </div>
          )}
          {step === 2 && (
            <div className="grid max-w-md grid-cols-2 gap-4">
              <div>
                <label htmlFor="el-h" className="mb-1.5 block text-sm font-semibold text-ink">Height <span className="font-normal text-muted">cm</span></label>
                <input id="el-h" inputMode="decimal" value={f.height} onChange={(e) => set({ height: e.target.value.replace(/[^\d.]/g, "").slice(0, 5) })} placeholder="e.g. 168" className="field text-lg" />
              </div>
              {f.gender === "male" && (
                <div>
                  <label htmlFor="el-c" className="mb-1.5 block text-sm font-semibold text-ink">Chest <span className="font-normal text-muted">cm</span></label>
                  <input id="el-c" inputMode="decimal" value={f.chest} onChange={(e) => set({ chest: e.target.value.replace(/[^\d.]/g, "").slice(0, 5) })} placeholder="unexpanded" className="field text-lg" />
                </div>
              )}
              <p className="col-span-2 text-sm text-muted">Optional. Leave blank to skip the physical checks.</p>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-6">
              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-ink">Category</legend>
                <div className="flex flex-wrap gap-2">
                  {(["UR", "OBC", "SC", "ST"] as Category[]).map((c) => <button key={c} type="button" aria-pressed={f.category === c} onClick={() => set({ category: c })} className={pill(f.category === c)}>{c}</button>)}
                </div>
              </fieldset>
              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-ink">Where do you live?</legend>
                <div className="flex gap-2">
                  <button type="button" aria-pressed={f.domicile === "odisha"} onClick={() => set({ domicile: "odisha" })} className={pill(f.domicile === "odisha")}>Odisha</button>
                  <button type="button" aria-pressed={f.domicile === "other"} onClick={() => set({ domicile: "other" })} className={pill(f.domicile === "other")}>Another state</button>
                </div>
              </fieldset>
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
          <button type="button" onClick={() => go(step - 1)} disabled={step === 0} className="btn btn-ghost btn-sm disabled:invisible">
            <ArrowLeftIcon size={16} weight="bold" /> Back
          </button>
          <button type="submit" disabled={!canNext} className="btn btn-primary group">
            {step < STEPS.length - 1 ? "Continue" : "See my exams"} <ArrowRightIcon size={18} weight="bold" className="arrow" />
          </button>
        </div>
      </form>
    </div>
  );
}

function LeadCapture({ input, eligible }: { input: EligibilityInput; eligible: string[] }) {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [err, setErr] = useState("");
  const [tries, setTries] = useState(0);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    setStatus("sending");
    await waitForTurnstile(formEl);
    const data = Object.fromEntries(new FormData(formEl).entries()) as Record<string, string>;
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name, email: data.email, phone: data.phone, company: data.company,
          turnstile: data["cf-turnstile-response"],
          source: "eligibility",
          entry: eligible.slice(0, 6).join(", "),
          meta: {
            age: input.age, gender: input.gender, marital: input.marital, education: input.education,
            height_cm: input.heightCm ?? "", chest_cm: input.chestCm ?? "", category: input.category,
            domicile: input.domicile, eligible,
          },
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Could not send. Please try again.");
      setStatus("done");
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Could not send.");
      setStatus("error");
      setTries((t) => t + 1);
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-[var(--radius-card)] bg-brand-50 p-7" aria-live="polite">
        <p className="font-display text-2xl font-bold text-ink">We have your result</p>
        <p className="mt-1 text-ink-2">A trainer will call with a plan for the exams above.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-[var(--radius-card)] bg-brand-950 p-7 text-surface sm:p-9">
      <p className="font-display text-2xl font-bold tracking-tight">Get a preparation plan for these exams</p>
      <p className="mt-1 text-brand-100">Free. A trainer calls back with the batch and timeline that fits.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <label className="sr-only" htmlFor="ld-name">Name</label>
        <input id="ld-name" name="name" required minLength={2} placeholder="Your name" autoComplete="name" className="field border-transparent" />
        <label className="sr-only" htmlFor="ld-phone">Phone</label>
        <input id="ld-phone" name="phone" inputMode="tel" placeholder="Mobile number" autoComplete="tel-national" className="field border-transparent" />
        <label className="sr-only" htmlFor="ld-email">Email</label>
        <input id="ld-email" name="email" type="email" placeholder="Email (optional)" autoComplete="email" className="field border-transparent" />
      </div>
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <Turnstile resetKey={tries} />
      <button type="submit" disabled={status === "sending"} className="btn btn-primary mt-4">
        {status === "sending" ? "Sending" : "Send me the plan"}
      </button>
      {status === "error" && <p className="mt-3 text-sm font-medium text-accent" aria-live="polite">{err}</p>}
    </form>
  );
}
