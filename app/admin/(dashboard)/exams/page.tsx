import { createClient } from "@/lib/supabase/server";
import ExamsManager, { type ExamRow } from "@/components/admin/ExamsManager";

export const dynamic = "force-dynamic";

export default async function ExamsAdmin() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("exams")
    .select("id, slug, name, short_name, vertical, force, stage, qualification, age_min, age_max, gender, marital_status, domicile, intro, pattern, syllabus, salary, stages, notification_month, exam_month, official_url, banner_path, sort_order, published")
    .order("sort_order", { ascending: true });

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-slate-900">Exams Catalogue</h1>
      <p className="mt-1 text-sm text-slate-500">
        Every exam on /exams. Each published exam gets its own page at /exams/&lt;slug&gt;, is offered in the enquiry form
        and powers the Eligibility Finder. Age bands and qualifications change between notifications, so re-check them every cycle.
      </p>
      <ExamsManager initial={(data ?? []) as ExamRow[]} />
    </div>
  );
}
