import { createClient } from "@/lib/supabase/server";
import { CAMPUS_IMAGES } from "@/lib/homepage-defaults";
import { asArray } from "@/lib/shape";
import ImageListManager from "@/components/admin/ImageListManager";
import { FRAMES } from "@/components/admin/useImageCropper";

export const dynamic = "force-dynamic";

export default async function CampusAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_content").select("draft").eq("key", "campus_images").maybeSingle();
  const saved = asArray<string>((data?.draft as { images?: string[] })?.images);
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900">Campus Gallery</h1>
      <p className="mt-1 text-sm text-slate-500">Ground, classroom and campus photos shown on the homepage and Gallery.</p>
      <ImageListManager
        initial={saved.length ? saved : CAMPUS_IMAGES}
        docKey="campus_images"
        label="Campus Gallery"
        folder="campus-gallery"
        cropAspect={FRAMES.campus}
        cropLabel="the campus gallery"
        note="Shown as an image grid on the homepage."
      />
    </div>
  );
}
