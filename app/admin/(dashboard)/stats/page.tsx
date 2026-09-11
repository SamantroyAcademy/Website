import { createClient } from "@/lib/supabase/server";
import { STATS } from "@/lib/data";
import StatsEditor from "@/components/admin/StatsEditor";

export const dynamic = "force-dynamic";

export default async function StatsAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_content").select("draft").eq("key", "stats").maybeSingle();
  const initial = (data?.draft as { items?: { value: number; label: string }[] })?.items ?? STATS;
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900">Scoreboard Stats</h1>
      <p className="mt-1 text-sm text-slate-500">The numbers shown on the homepage (recommendations, alumni, etc.).</p>
      <StatsEditor initial={initial} />
    </div>
  );
}
