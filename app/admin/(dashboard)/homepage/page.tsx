import { createClient } from "@/lib/supabase/server";
import { resolveHomeOrder } from "@/lib/homepage-order";
import HomeOrderManager from "@/components/admin/HomeOrderManager";

export const dynamic = "force-dynamic";

export default async function HomepageOrderAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_content").select("draft").eq("key", "homepage_order").maybeSingle();
  const initial = resolveHomeOrder((data?.draft as { items?: unknown })?.items);
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900">Homepage Sections</h1>
      <p className="mt-1 text-sm text-slate-500">Choose what appears on the homepage and in what order.</p>
      <HomeOrderManager initial={initial} />
    </div>
  );
}
