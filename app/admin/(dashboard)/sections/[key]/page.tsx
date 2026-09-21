import { notFound } from "next/navigation";
import Link from "@/components/ui/Link";
import { createClient } from "@/lib/supabase/server";
import { getSection, sectionDefaults } from "@/lib/sections";
import SectionEditor from "@/components/admin/SectionEditor";
import BatchesPopupSwitch from "@/components/admin/BatchesPopupSwitch";

export const dynamic = "force-dynamic";

export default async function SectionEditorPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const section = getSection(key);
  if (!section) notFound();

  const supabase = await createClient();
  const { data } = await supabase.from("site_content").select("draft").eq("key", key).maybeSingle();
  const { count } = await supabase
    .from("content_versions")
    .select("id", { count: "exact", head: true })
    .eq("key", key);

  const initial = { ...sectionDefaults(key), ...((data?.draft as Record<string, unknown>) ?? {}) };
  // The enquiry popup page also carries the batches popup switch (the popup
  // that comes before it), so both popups are controlled in one place.
  const batchesOn = key === "enquiry_popup"
    ? ((await supabase.from("site_content").select("published").eq("key", "countdown").maybeSingle()).data?.published as { popup?: string } | null)?.popup !== "off"
    : true;

  return (
    <div>
      <Link href="/admin/sections" className="text-sm text-slate-500 hover:text-slate-800">← All sections</Link>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">{section.label}</h1>
      <p className="mt-1 text-sm text-slate-500">{section.description}</p>
      {key === "enquiry_popup" && <div className="mt-6 max-w-3xl"><BatchesPopupSwitch initial={batchesOn} /></div>}
      <SectionEditor section={section} initial={initial} canRollback={(count ?? 0) > 0} />
    </div>
  );
}
