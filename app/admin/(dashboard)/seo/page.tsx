import { createClient } from "@/lib/supabase/server";
import { SEO_PAGES } from "@/lib/seo-pages";
import SeoEditor from "@/components/admin/SeoEditor";

export const dynamic = "force-dynamic";

export default async function SeoAdmin() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_content")
    .select("key, published")
    .in("key", SEO_PAGES.map((p) => `seo.${p.key}`));

  const saved = new Map((data ?? []).map((r) => [r.key, r.published as { title: string; description: string }]));
  const initial: Record<string, { title: string; description: string }> = {};
  for (const p of SEO_PAGES) {
    const s = saved.get(`seo.${p.key}`);
    initial[p.key] = { title: s?.title ?? p.title, description: s?.description ?? p.description };
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">SEO Settings</h1>
      <p className="mt-1 text-sm text-slate-500">Page titles &amp; meta descriptions for Google and social sharing.</p>
      <SeoEditor initial={initial} />
    </div>
  );
}
