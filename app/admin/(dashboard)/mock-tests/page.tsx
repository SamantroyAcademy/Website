import { createClient } from "@/lib/supabase/server";
import MockManager, { type MockQuestion, type ExamOption } from "@/components/admin/MockManager";

export const dynamic = "force-dynamic";

export default async function MockAdmin() {
  const supabase = await createClient();
  const [{ data }, { data: exams }] = await Promise.all([
    supabase
      .from("mock_questions")
      .select("id, type, subject, exam_id, question, options, answer, explanation, difficulty, marks, negative_marks, sort_order, published")
      .order("sort_order", { ascending: true }),
    supabase.from("exams").select("id, name").order("sort_order", { ascending: true }),
  ]);

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900">Mock Tests</h1>
      <p className="mt-1 text-sm text-slate-500">
        Subject-wise questions for the free test on /mock-tests. Marks and negative marks follow the real CBT pattern.
        Answers are scored on the server, so visitors can never read them before submitting.
      </p>
      {(data ?? []).length === 0 && (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          No questions yet, so the public page is showing a short built-in sample set. Add your own below to replace it.
        </p>
      )}
      <MockManager initial={(data ?? []) as MockQuestion[]} exams={(exams ?? []) as ExamOption[]} />
    </div>
  );
}
