import { createClient } from "@/lib/supabase/server";
import RecordManager, { type Field } from "@/components/admin/RecordManager";
import { FRAMES } from "@/components/admin/useImageCropper";

export const dynamic = "force-dynamic";

const FIELDS: Field[] = [
  { key: "name", label: "Name", type: "text" },
  { key: "rank", label: "Exam / post", type: "text" },
  { key: "body", label: "Testimonial (fonts, colours & word-art supported)", type: "rich" },
  { key: "image_path", label: "Photo", type: "image" },
];

export default async function TestimonialsAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("testimonials").select("*").order("sort_order", { ascending: true });
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Testimonials</h1>
      <p className="mt-1 text-sm text-slate-500">Stories from selected aspirants. Keep each to two or three lines; photos are optional.</p>
      <RecordManager table="testimonials" fields={FIELDS} initial={data ?? []} titleKey="name" subtitleKey="rank"
        imageAspect={FRAMES.avatar} imageRound imageLabel="the testimonial photo" imageOptional />
    </div>
  );
}
