import { createClient } from "@/lib/supabase/server";
import { OFFICER_BANNERS } from "@/lib/homepage-defaults";
import { asArray } from "@/lib/shape";
import ImageListManager from "@/components/admin/ImageListManager";
import { FRAMES } from "@/components/admin/useImageCropper";

export const dynamic = "force-dynamic";

export default async function OfficerBannersAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_content").select("draft").eq("key", "officer_banners").maybeSingle();
  const saved = asArray<string>((data?.draft as { images?: string[] })?.images);
  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-slate-900">Now Serving: Alumni in Uniform</h1>
      <p className="mt-1 text-sm text-slate-500">
        Wide banners of alumni now in service. One list feeds both the <b>homepage</b> and the <b>Gallery</b> page.
        The homepage section stays hidden until you add at least one.
      </p>
      <ImageListManager
        initial={saved.length ? saved : OFFICER_BANNERS}
        docKey="officer_banners"
        label="Now Serving banners"
        folder="officers"
        shape="wide"
        cropAspect={FRAMES.officerBanner}
        cropLabel="a Now Serving banner"
        note="Use the arrows to reorder and the cross to remove."
      />
    </div>
  );
}
