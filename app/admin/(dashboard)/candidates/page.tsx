import { createClient } from "@/lib/supabase/server";
import CandidatesManager, { type Candidate } from "@/components/admin/CandidatesManager";

export const dynamic = "force-dynamic";

export default async function CandidatesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("selected_candidates")
    .select("id, name, exam, post, force, year, image_path, sort_order, published, selected_on, hometown")
    .order("sort_order", { ascending: true })
    .order("selected_on", { ascending: false, nullsFirst: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Selected Candidates</h1>
      <p className="mt-1 text-sm text-slate-500">
        Manage the Wall of Selection. Add a name, exam and (optionally) a photo. Drag a card, or use the arrows, to change the order; the public wall follows it.</p>
      <CandidatesManager initial={(data as Candidate[]) ?? []} />
    </div>
  );
}
