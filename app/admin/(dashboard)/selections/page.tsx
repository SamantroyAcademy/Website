import { createClient } from "@/lib/supabase/server";
import SelectionsManager from "@/components/admin/SelectionsManager";

export const dynamic = "force-dynamic";

export default async function SelectionsAdmin() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("selections")
    .select("id, year, exam, center, count, sort_order, published")
    .order("year", { ascending: false })
    .order("sort_order", { ascending: true });

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900">Selection Tracker</h1>
      <p className="mt-1 text-sm text-slate-500">
        Year-wise recommendations by entry and SSB centre — powers the “Proven Results” section on the homepage.
        The three cards on that section (total, years tracked, SSB centres cleared) are counted from these rows.
      </p>
      {(data ?? []).length === 0 && (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          No rows yet, so the <b>Proven Results</b> section is hidden on the homepage. Add your real
          year-wise recommendations below and it appears automatically — nothing is ever shown from placeholder data.
        </p>
      )}
      <SelectionsManager initial={(data ?? []) as never} />
    </div>
  );
}
