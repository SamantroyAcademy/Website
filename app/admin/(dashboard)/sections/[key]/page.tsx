import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSection, sectionDefaults } from "@/lib/sections";
import SectionEditor from "@/components/admin/SectionEditor";

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

  return (
    <div>
      <Link href="/admin/sections" className="text-sm text-slate-500 hover:text-slate-800">← All sections</Link>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">{section.label}</h1>
      <p className="mt-1 text-sm text-slate-500">{section.description}</p>
      <SectionEditor section={section} initial={initial} canRollback={(count ?? 0) > 0} />
    </div>
  );
}
