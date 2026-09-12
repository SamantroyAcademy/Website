"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { gsap } from "gsap";
import { ArrowLeftIcon, ArrowRightIcon, TimerIcon, CheckCircleIcon, XCircleIcon, MinusCircleIcon, ArrowCounterClockwiseIcon } from "@phosphor-icons/react";
import type { PublicQuestion } from "@/lib/mock-defaults";
import { prefersReducedMotion } from "@/components/motion/MotionProvider";

type Detail = { id: string; chosen: number | null; answer: number | null; correct: boolean; explanation: string | null };
type Result = { correct: number; wrong: number; skipped: number; total: number; score: number; max: number; details: Detail[] };

const SECONDS_PER_Q = 45;
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/** Timed MCQ runner. Answers are never on the page: the server scores the
 *  attempt (/api/mock/score) and returns explanations only after submit. */
export default function MockQuiz({ questions }: { questions: PublicQuestion[] }) {
  const subjects = useMemo(() => [...new Set(questions.map((q) => q.subject))], [questions]);
  const [subject, setSubject] = useState<string>("all");
  const [started, setStarted] = useState(false);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [left, setLeft] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const card = useRef<HTMLDivElement>(null);

  const set = useMemo(() => (subject === "all" ? questions : questions.filter((q) => q.subject === subject)).slice(0, 25), [questions, subject]);
  const q = set[i];

  // Countdown; auto-submit at zero.
  useEffect(() => {
    if (!started || result) return;
    if (left <= 0) { void submit(); return; }
    const t = window.setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, left, result]);

  const move = (next: number) => {
    if (next < 0 || next >= set.length) return;
    if (!card.current || prefersReducedMotion()) return setI(next);
    gsap.fromTo(card.current, { opacity: 0.3, x: next > i ? 18 : -18 }, { opacity: 1, x: 0, duration: 0.35, ease: "expo.out" });
    setI(next);
  };

  function start() {
    setAnswers({}); setI(0); setResult(null); setErr("");
    setLeft(set.length * SECONDS_PER_Q);
    setStarted(true);
  }

  async function submit() {
    if (busy) return;
    setBusy(true); setErr("");
    // Send every question id; unanswered ones are sent as -1 (skipped).
    const payload = Object.fromEntries(set.map((x) => [x.id, answers[x.id] ?? -1]));
    try {
      const res = await fetch("/api/mock/score", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers: payload }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not score right now.");
      setResult(json as Result);
      window.scrollTo({ top: 0 });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not score right now.");
    } finally {
      setBusy(false);
    }
  }

  if (!questions.length) {
    return <p className="card p-8 text-center text-ink-2">Questions are being added. Check back soon.</p>;
  }

  // ── Results ─────────────────────────────────────────────
  if (result) {
    const byId = new Map(result.details.map((d) => [d.id, d]));
    const pct = result.max ? Math.max(0, Math.round((result.score / result.max) * 100)) : 0;
    return (
      <div className="space-y-8">
        <div className="card grid gap-6 p-7 sm:grid-cols-4 sm:p-9">
          <div className="sm:col-span-2">
            <p className="text-sm font-semibold text-brand-600">Your score</p>
            <p className="numeral mt-2 text-6xl text-ink">{result.score}<span className="ml-2 font-sans text-xl font-semibold text-muted">/ {result.max}</span></p>
            <p className="mt-2 text-ink-2">{pct}% after negative marking</p>
          </div>
          <dl className="grid grid-cols-3 gap-4 sm:col-span-2">
            {[
              { k: "Correct", v: result.correct, Icon: CheckCircleIcon, c: "text-brand-600" },
              { k: "Wrong", v: result.wrong, Icon: XCircleIcon, c: "text-accent-ink" },
              { k: "Skipped", v: result.skipped, Icon: MinusCircleIcon, c: "text-muted" },
            ].map(({ k, v, Icon, c }) => (
              <div key={k} className="flex flex-col-reverse">
                <dt className="mt-1 text-sm text-muted">{k}</dt>
                <dd className={`numeral flex items-center gap-2 text-4xl ${c}`}><Icon size={24} weight="fill" />{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <ol className="space-y-3">
          {set.map((x, n) => {
            const d = byId.get(x.id);
            return (
              <li key={x.id} className="card p-6">
                <p className="text-sm font-semibold text-muted">{x.subject}</p>
                <p className="mt-1 font-semibold text-ink">{n + 1}. {x.question}</p>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {x.options.map((o, k) => {
                    const isAnswer = d?.answer === k;
                    const isChosen = d?.chosen === k;
                    return (
                      <li key={k} className={`rounded-[12px] px-4 py-2.5 text-sm ${isAnswer ? "bg-brand-100 font-semibold text-brand-900" : isChosen ? "bg-accent-50 text-accent-ink line-through" : "bg-paper text-ink-2"}`}>
                        {o}
                      </li>
                    );
                  })}
                </ul>
                {d?.explanation && <p className="mt-3 text-sm leading-relaxed text-ink-2"><span className="font-semibold text-ink">Why: </span>{d.explanation}</p>}
              </li>
            );
          })}
        </ol>

        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={start} className="btn btn-dark"><ArrowCounterClockwiseIcon size={18} weight="bold" /> Try again</button>
          <button type="button" onClick={() => { setStarted(false); setResult(null); }} className="btn btn-ghost">Choose another subject</button>
        </div>
        <ScoreLead result={result} subject={subject} />
      </div>
    );
  }

  // ── Setup ──────────────────────────────────────────────
  if (!started) {
    return (
      <div className="card p-7 sm:p-9">
        <p className="font-display text-2xl font-bold tracking-tight text-ink">Pick a subject</p>
        <div className="mt-5 flex flex-wrap gap-2" role="radiogroup" aria-label="Subject">
          {["all", ...subjects].map((s) => {
            const n = s === "all" ? questions.length : questions.filter((x) => x.subject === s).length;
            const on = subject === s;
            return (
              <button key={s} type="button" role="radio" aria-checked={on} onClick={() => setSubject(s)}
                className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${on ? "bg-ink text-surface" : "bg-surface text-ink-2 shadow-[inset_0_0_0_1.5px_var(--color-line)] hover:text-ink"}`}>
                {s === "all" ? "All subjects" : s} <span className={on ? "text-brand-200" : "text-muted"}>{n}</span>
              </button>
            );
          })}
        </div>
        <dl className="mt-8 grid max-w-lg grid-cols-3 gap-4 border-t border-line pt-6">
          <div><dt className="text-xs text-muted">Questions</dt><dd className="numeral mt-1 text-3xl text-ink">{set.length}</dd></div>
          <div><dt className="text-xs text-muted">Time</dt><dd className="numeral mt-1 text-3xl text-ink">{fmt(set.length * SECONDS_PER_Q)}</dd></div>
          <div><dt className="text-xs text-muted">Wrong answer</dt><dd className="numeral mt-1 text-3xl text-ink">-{set[0]?.negative_marks ?? 0.25}</dd></div>
        </dl>
        <button type="button" onClick={start} disabled={!set.length} className="btn btn-primary group mt-8">
          Start the test <ArrowRightIcon size={18} weight="bold" className="arrow" />
        </button>
      </div>
    );
  }

  // ── Running ────────────────────────────────────────────
  const answered = Object.keys(answers).length;
  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <div ref={card} className="card p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-muted">{q.subject}</p>
            <p className={`flex items-center gap-1.5 font-stencil text-xl ${left <= 30 ? "text-accent-ink" : "text-ink"}`} aria-live="off">
              <TimerIcon size={20} weight="bold" /> {fmt(left)}
            </p>
          </div>
          <p className="mt-4 font-display text-[clamp(1.3rem,2.4vw,1.75rem)] font-bold leading-snug tracking-tight text-ink">
            <span className="text-muted">{i + 1}.</span> {q.question}
          </p>
          <div className="mt-6 grid gap-2.5" role="radiogroup" aria-label="Options">
            {q.options.map((o, k) => {
              const on = answers[q.id] === k;
              return (
                <button key={k} type="button" role="radio" aria-checked={on} onClick={() => setAnswers((a) => ({ ...a, [q.id]: k }))}
                  className={`flex items-center gap-4 rounded-[14px] px-4 py-3.5 text-left transition-colors ${on ? "bg-brand-800 text-surface" : "bg-paper text-ink hover:bg-tint"}`}>
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-semibold ${on ? "bg-accent text-white" : "bg-surface text-ink-2 shadow-[inset_0_0_0_1px_var(--color-line)]"}`}>{String.fromCharCode(65 + k)}</span>
                  {o}
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-5">
            <button type="button" onClick={() => move(i - 1)} disabled={i === 0} className="btn btn-ghost btn-sm disabled:invisible"><ArrowLeftIcon size={16} weight="bold" /> Previous</button>
            {answers[q.id] !== undefined && (
              <button type="button" onClick={() => setAnswers((a) => { const n = { ...a }; delete n[q.id]; return n; })} className="text-sm font-semibold text-muted underline-offset-4 hover:underline">Clear answer</button>
            )}
            {i < set.length - 1 ? (
              <button type="button" onClick={() => move(i + 1)} className="btn btn-dark btn-sm">Next <ArrowRightIcon size={16} weight="bold" /></button>
            ) : (
              <button type="button" onClick={submit} disabled={busy} className="btn btn-primary btn-sm">{busy ? "Scoring" : "Submit"}</button>
            )}
          </div>
        </div>
        {err && <p className="mt-3 text-sm font-medium text-accent-ink" aria-live="polite">{err}</p>}
      </div>

      <aside className="lg:col-span-4">
        <div className="card p-6 lg:sticky lg:top-28">
          <p className="text-sm font-semibold text-ink">{answered} of {set.length} answered</p>
          <ol className="mt-4 grid grid-cols-6 gap-2" aria-label="Jump to question">
            {set.map((x, n) => (
              <li key={x.id}>
                <button type="button" onClick={() => move(n)} aria-label={`Question ${n + 1}${answers[x.id] !== undefined ? ", answered" : ""}`}
                  className={`flex h-10 w-full items-center justify-center rounded-[10px] text-sm font-semibold ${n === i ? "bg-ink text-surface" : answers[x.id] !== undefined ? "bg-brand-100 text-brand-900" : "bg-paper text-ink-2"}`}>
                  {n + 1}
                </button>
              </li>
            ))}
          </ol>
          <button type="button" onClick={submit} disabled={busy} className="btn btn-primary mt-6 w-full">{busy ? "Scoring" : "Submit test"}</button>
          <p className="mt-3 text-xs text-muted">Each wrong answer costs marks. Skipping costs nothing.</p>
        </div>
      </aside>
    </div>
  );
}

function ScoreLead({ result, subject }: { result: Result; subject: string }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [err, setErr] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    setState("sending");
    try {
      const res = await fetch("/api/lead", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: d.name, phone: d.phone, email: d.email, company: d.company, source: "mock_test", entry: subject === "all" ? "All subjects" : subject,
          meta: { score: `${result.score} / ${result.max}`, correct: result.correct, wrong: result.wrong, skipped: result.skipped, subject } }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Could not send.");
      setState("done");
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Could not send."); setState("error");
    }
  }
  if (state === "done") return <p className="rounded-[var(--radius-card)] bg-brand-50 p-6 font-semibold text-ink">Sent. A trainer will call to go through your weak areas.</p>;
  return (
    <form onSubmit={submit} className="rounded-[var(--radius-card)] bg-brand-950 p-7 text-surface sm:p-9">
      <p className="font-display text-2xl font-bold tracking-tight">Want a trainer to review this attempt?</p>
      <p className="mt-1 text-brand-100">Free. We call back with the topics to fix first.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <input name="name" required minLength={2} placeholder="Your name" aria-label="Name" autoComplete="name" className="field border-transparent" />
        <input name="phone" inputMode="tel" placeholder="Mobile number" aria-label="Mobile number" autoComplete="tel-national" className="field border-transparent" />
        <input name="email" type="email" placeholder="Email (optional)" aria-label="Email" autoComplete="email" className="field border-transparent" />
      </div>
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <button type="submit" disabled={state === "sending"} className="btn btn-primary mt-4">{state === "sending" ? "Sending" : "Request a review"}</button>
      {state === "error" && <p className="mt-3 text-sm text-accent">{err}</p>}
    </form>
  );
}
