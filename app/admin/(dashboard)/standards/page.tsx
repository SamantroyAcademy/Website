import { createClient } from "@/lib/supabase/server";
import StandardsManager, { type DbStandard, type ExamLite } from "@/components/admin/StandardsManager";

export const dynamic = "force-dynamic";

export default async function StandardsAdmin({ searchParams }: { searchParams: Promise<{ exam?: string }> }) {
  const { exam } = await searchParams;
  const supabase = await createClient();
  const [{ data: rows }, { data: exams }] = await Promise.all([
    supabase
      .from("physical_standards")
      .select("id, exam_id, label, gender, category, region, height_cm, chest_cm, chest_expanded_cm, weight_kg, run_distance_m, run_time, long_jump, high_jump, beam_pullups, ditch, zigzag, vision, notes, sort_order, published")
      .order("sort_order", { ascending: true }),
    supabase.from("exams").select("id, name, slug").order("sort_order", { ascending: true }),
  ]);

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-slate-900">Physical Standards</h1>
      <p className="mt-1 text-sm text-slate-500">
        Height, chest and physical-test benchmarks per exam, gender and category. These drive the tables and the calculator on
        /standards, the summary on each exam page, and the height and chest checks in the Eligibility Finder.
      </p>
      <StandardsManager initial={(rows ?? []) as DbStandard[]} exams={(exams ?? []) as ExamLite[]} focusExam={exam} />
    </div>
  );
}
