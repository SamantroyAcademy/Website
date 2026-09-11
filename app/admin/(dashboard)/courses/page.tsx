import { createClient } from "@/lib/supabase/server";
import { COURSES, type CourseItem } from "@/lib/data";
import CoursesManager, { type CourseEdit } from "@/components/admin/CoursesManager";
import { coerceShape } from "@/lib/shape";

export const dynamic = "force-dynamic";

const BLANK: CourseItem = {
  tag: "", highlight: false, title: "", where: "", price: "", service: "army",
  desc: "", features: [], cta: "Enquire about this batch", enrollUrl: "",
};

export default async function CoursesAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_content").select("draft").eq("key", "courses_cards").maybeSingle();
  const draft = (data?.draft as { items?: CourseEdit[] })?.items;
  // Merge each saved card over a complete blank so older docs gain new fields.
  const initial = Array.isArray(draft) && draft.length
    ? coerceShape(draft, COURSES).map((c) => Object.assign({}, BLANK, c))
    : COURSES;
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900">Courses and Batches</h1>
      <p className="mt-1 text-sm text-slate-500">Every course card on the homepage and the Courses page: text, price, button and link.</p>
      <CoursesManager initial={initial} />
    </div>
  );
}
