"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { bustCmsCache } from "@/lib/revalidate-client";
import { MOCK_SUBJECTS } from "@/lib/mock-defaults";

export type MockQuestion = {
  id: string;
  type: "MCQ" | "TF";
  subject: string;
  exam_id: string | null;
  question: string;
  options: string[];
  answer: number | null;
  explanation: string | null;
  difficulty: string | null;
  marks: number;
  negative_marks: number;
  sort_order: number;
  published: boolean;
};

export type ExamOption = { id: string; name: string };

type Form = {
  subject: string;
  exam_id: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  difficulty: string;
  marks: string;
  negative_marks: string;
};

const empty = (): Form => ({
  subject: MOCK_SUBJECTS[0], exam_id: "", question: "", options: ["", "", "", ""], answer: 0,
  explanation: "", difficulty: "medium", marks: "1", negative_marks: "0.25",
});

const input = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500";

export default function MockManager({ initial, exams }: { initial: MockQuestion[]; exams: ExamOption[] }) {
  const supabase = createClient();
  const [rows, setRows] = useState<MockQuestion[]>(initial);
  const [form, setForm] = useState<Form>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const set = (patch: Partial<Form>) => setForm((f) => ({ ...f, ...patch }));
  const examName = (id: string | null) => exams.find((e) => e.id === id)?.name;

  const shown = useMemo(() => (filter === "all" ? rows : rows.filter((r) => r.subject === filter)), [rows, filter]);

  function startEdit(r: MockQuestion) {
    const opts = [...r.options];
    while (opts.length < 4) opts.push("");
    setForm({
      subject: r.subject, exam_id: r.exam_id ?? "", question: r.question, options: opts,
      answer: r.answer ?? 0, explanation: r.explanation ?? "", difficulty: r.difficulty ?? "medium",
      marks: String(r.marks ?? 1), negative_marks: String(r.negative_marks ?? 0.25),
    });
    setEditingId(r.id);
    setMsg(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save() {
    setBusy(true); setMsg(null);
    try {
      const options = form.options.map((o) => o.trim());
      const filled = options.filter(Boolean);
      if (!form.question.trim()) throw new Error("Question text is required.");
      if (filled.length < 2) throw new Error("Add at least two options.");
      if (!options[form.answer]) throw new Error("The option marked correct is empty.");
      // Keep indexes stable: drop only trailing empty options.
      while (options.length && !options[options.length - 1]) options.pop();
      const marks = Number(form.marks);
      const negative = Number(form.negative_marks);
      if (!Number.isFinite(marks) || marks <= 0) throw new Error("Marks must be a positive number.");
      if (!Number.isFinite(negative) || negative < 0) throw new Error("Negative marks must be 0 or more.");

      const payload = {
        type: "MCQ" as const,
        subject: form.subject,
        exam_id: form.exam_id || null,
        question: form.question.trim(),
        options,
        answer: form.answer,
        explanation: form.explanation.trim() || null,
        difficulty: form.difficulty,
        marks,
        negative_marks: negative,
      };

      if (editingId) {
        const { data, error } = await supabase.from("mock_questions").update(payload).eq("id", editingId).select("*").single();
        if (error) throw new Error(error.message);
        setRows((r) => r.map((x) => (x.id === editingId ? (data as MockQuestion) : x)));
      } else {
        const sort_order = rows.length ? Math.max(...rows.map((r) => r.sort_order)) + 1 : 0;
        const { data, error } = await supabase.from("mock_questions").insert({ ...payload, sort_order, published: true }).select("*").single();
        if (error) throw new Error(error.message);
        setRows((r) => [...r, data as MockQuestion]);
      }
      void bustCmsCache();
      setForm(empty());
      setEditingId(null);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed.");
    } finally {
      setBusy(false);
    }
  }

  async function togglePublished(r: MockQuestion) {
    const next = !r.published;
    setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, published: next } : x)));
    await supabase.from("mock_questions").update({ published: next }).eq("id", r.id);
    void bustCmsCache();
  }

  async function remove(id: string) {
    if (!confirm("Delete this question?")) return;
    const prev = rows;
    setRows((rs) => rs.filter((r) => r.id !== id));
    const { error } = await supabase.from("mock_questions").delete().eq("id", id);
    if (error) { setRows(prev); alert(error.message); } else void bustCmsCache();
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-base font-semibold text-slate-900">{editingId ? "Edit question" : "Add a question"}</h2>
        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-xs font-medium text-slate-500">Subject
              <select value={form.subject} onChange={(e) => set({ subject: e.target.value })} className={`mt-1 ${input}`}>
                {MOCK_SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="text-xs font-medium text-slate-500">Exam (optional)
              <select value={form.exam_id} onChange={(e) => set({ exam_id: e.target.value })} className={`mt-1 ${input}`}>
                <option value="">All exams</option>
                {exams.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
              </select>
            </label>
            <label className="text-xs font-medium text-slate-500">Marks
              <input value={form.marks} onChange={(e) => set({ marks: e.target.value })} inputMode="decimal" className={`mt-1 ${input}`} />
            </label>
            <label className="text-xs font-medium text-slate-500">Negative marks
              <input value={form.negative_marks} onChange={(e) => set({ negative_marks: e.target.value })} inputMode="decimal" className={`mt-1 ${input}`} />
            </label>
          </div>
          <textarea value={form.question} onChange={(e) => set({ question: e.target.value })} rows={2}
            placeholder="Question" className={input} />
          <div className="grid gap-2 sm:grid-cols-2">
            {form.options.map((opt, i) => (
              <label key={i} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${form.answer === i ? "border-green-400 bg-green-50" : "border-slate-200"}`}>
                <input type="radio" name="correct" checked={form.answer === i} onChange={() => set({ answer: i })} aria-label={`Option ${String.fromCharCode(65 + i)} is correct`} />
                <input value={opt} onChange={(e) => set({ options: form.options.map((o, j) => (j === i ? e.target.value : o)) })}
                  placeholder={`Option ${String.fromCharCode(65 + i)}`} className="flex-1 bg-transparent outline-none" />
              </label>
            ))}
          </div>
          <p className="text-xs text-slate-400">Select the radio next to the correct option. The answer is never sent to visitors before they submit.</p>
          <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
            <input value={form.explanation} onChange={(e) => set({ explanation: e.target.value })}
              placeholder="Explanation (shown after submit)" className={input} />
            <select value={form.difficulty} onChange={(e) => set({ difficulty: e.target.value })} className={input} aria-label="Difficulty">
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {msg && <p className="mt-3 text-sm text-red-600">{msg}</p>}
        <div className="mt-4 flex gap-2">
          <button onClick={save} disabled={busy} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
            {busy ? "Saving…" : editingId ? "Save changes" : "Add question"}
          </button>
          {editingId && (
            <button onClick={() => { setEditingId(null); setForm(empty()); }} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-slate-900">Questions ({shown.length})</h2>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-lg border border-slate-300 px-2 py-1 text-sm" aria-label="Filter by subject">
            <option value="all">All subjects</option>
            {MOCK_SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <ul className="divide-y divide-slate-100">
          {shown.map((r) => (
            <li key={r.id} className={`flex items-start gap-3 py-3 ${r.published ? "" : "opacity-50"}`}>
              <span className="mt-0.5 shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">{r.subject}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-800">{r.question}</p>
                <p className="mt-0.5 truncate text-xs text-slate-400">
                  Answer: {typeof r.answer === "number" ? r.options[r.answer] : "not set"} · +{r.marks} / -{r.negative_marks}
                  {r.exam_id && examName(r.exam_id) ? ` · ${examName(r.exam_id)}` : ""}
                </p>
              </div>
              <button onClick={() => startEdit(r)} className="rounded border border-slate-200 px-1.5 text-xs hover:bg-slate-50">Edit</button>
              <button onClick={() => togglePublished(r)} className="rounded border border-slate-200 px-1.5 text-xs hover:bg-slate-50">{r.published ? "Hide" : "Show"}</button>
              <button onClick={() => remove(r.id)} className="rounded border border-red-200 px-1.5 text-xs text-red-600 hover:bg-red-50">✕</button>
            </li>
          ))}
          {shown.length === 0 && <li className="py-6 text-center text-sm text-slate-400">No questions yet.</li>}
        </ul>
      </div>
    </div>
  );
}
