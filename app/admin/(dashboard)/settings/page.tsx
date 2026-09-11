import { createClient } from "@/lib/supabase/server";
import { SITE } from "@/lib/data";
import SettingsEditor from "@/components/admin/SettingsEditor";

export const dynamic = "force-dynamic";

export default async function SettingsAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_content").select("draft").eq("key", "settings").maybeSingle();
  const initial = { ...SITE, ...(data?.draft ?? {}) } as unknown as Record<string, string>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900">Footer &amp; Contact Details</h1>
      <p className="mt-1 text-sm text-slate-500">
        These power the footer, contact page and contact blocks across the site.
      </p>
      <SettingsEditor initial={initial} />
    </div>
  );
}
