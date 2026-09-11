import { createClient } from "@/lib/supabase/server";
import { AIR1_IMAGES } from "@/lib/homepage-defaults";
import { asArray } from "@/lib/shape";
import ImageListManager from "@/components/admin/ImageListManager";
import { FRAMES } from "@/components/admin/useImageCropper";

export const dynamic = "force-dynamic";

export default async function ToppersAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_content").select("draft").eq("key", "air1_images").maybeSingle();
  const saved = asArray<string>((data?.draft as { images?: string[] })?.images);
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900">Top Rank Cards</h1>
      <p className="mt-1 text-sm text-slate-500">Result cards for rank holders and toppers. The homepage section stays hidden until you add at least one.</p>
      <ImageListManager
        initial={saved.length ? saved : AIR1_IMAGES}
        docKey="air1_images"
        label="Top Rank Cards"
        folder="toppers"
        shape="tall"
        cropAspect={FRAMES.air1}
        cropLabel="a top-rank card"
        note="Shown as a swipeable row of portrait cards."
      />
    </div>
  );
}
