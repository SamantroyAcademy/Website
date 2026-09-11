import { createClient } from "@/lib/supabase/server";
import { VERTICALS_DOC, type VerticalsDoc } from "@/lib/verticals";
import { coerceShape } from "@/lib/shape";
import VerticalsManager from "@/components/admin/VerticalsManager";

export const dynamic = "force-dynamic";

export default async function VerticalsAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_content").select("draft").eq("key", "verticals").maybeSingle();
  const raw = (data?.draft && Object.keys(data.draft).length ? data.draft : VERTICALS_DOC) as VerticalsDoc;
  // Never hand the editor a malformed list (e.g. cards/entries saved as "").
  const initial = coerceShape(raw, VERTICALS_DOC);
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900">Six Verticals</h1>
      <p className="mt-1 text-sm text-slate-500">
        The recruitment verticals on the homepage: name, line, description, exam chips, link and photo for each card.
      </p>
      <VerticalsManager initial={initial} />
    </div>
  );
}
