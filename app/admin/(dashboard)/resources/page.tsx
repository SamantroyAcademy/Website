import { createClient } from "@/lib/supabase/server";
import ResourcesManager, { type Folder, type Resource } from "@/components/admin/ResourcesManager";

export const dynamic = "force-dynamic";

export default async function ResourcesAdmin() {
  const supabase = await createClient();
  const [{ data: folders }, { data: resources }] = await Promise.all([
    supabase.from("resource_folders").select("*").order("sort_order").order("name"),
    supabase.from("resources").select("*").order("sort_order").order("created_at"),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Resources</h1>
      <p className="mt-1 text-sm text-slate-500">
        Organise downloadable files in folders and add YouTube videos. Visitors browse and download these at <code>/resources</code>.
      </p>
      <ResourcesManager initialFolders={(folders ?? []) as Folder[]} initialResources={(resources ?? []) as Resource[]} />
    </div>
  );
}
