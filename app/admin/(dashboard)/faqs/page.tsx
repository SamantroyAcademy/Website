import { createClient } from "@/lib/supabase/server";
import RecordManager, { type Field } from "@/components/admin/RecordManager";

export const dynamic = "force-dynamic";

const FIELDS: Field[] = [
  { key: "question", label: "Question", type: "text" },
  { key: "answer", label: "Answer (fonts, colours & word-art supported)", type: "rich" },
];

export default async function FaqsAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("faqs").select("*").order("sort_order", { ascending: true });
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">FAQs</h1>
      <p className="mt-1 text-sm text-slate-500">Questions &amp; answers shown across the site.</p>
      <RecordManager table="faqs" fields={FIELDS} initial={data ?? []} titleKey="question" />
    </div>
  );
}
