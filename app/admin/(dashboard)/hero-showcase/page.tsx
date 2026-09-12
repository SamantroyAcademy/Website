import { createClient } from "@/lib/supabase/server";
import { HERO_SLIDES, type HeroSlide } from "@/lib/hero-slides";
import { asArray } from "@/lib/shape";
import HeroSlidesManager from "@/components/admin/HeroSlidesManager";

export const dynamic = "force-dynamic";

export default async function HeroShowcaseAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_content").select("draft").eq("key", "hero_slides").maybeSingle();
  const saved = asArray<HeroSlide>((data?.draft as { items?: HeroSlide[] })?.items);
  const initial = saved.length ? saved : HERO_SLIDES;

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900">Hero Posters</h1>
      <p className="mt-1 text-sm text-slate-500">
        The rotating posters beside the homepage headline (shown whole, any shape), each with a short caption. Put the newest batch or result first.</p>
      <HeroSlidesManager initial={initial} />
    </div>
  );
}
