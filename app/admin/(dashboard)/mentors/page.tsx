import { createClient } from "@/lib/supabase/server";
import RecordManager, { type Field } from "@/components/admin/RecordManager";
import { FRAMES } from "@/components/admin/useImageCropper";

export const dynamic = "force-dynamic";

const FIELDS: Field[] = [
  { key: "name", label: "Name", type: "text" },
  { key: "role", label: "Role", type: "text" },
  { key: "specialty", label: "Specialty", type: "text" },
  { key: "bio", label: "Bio (fonts, colours & word-art supported)", type: "rich" },
  { key: "image_path", label: "Photo", type: "image" },
];

export default async function MentorsAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("mentors").select("*").order("sort_order", { ascending: true });
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Faculty and Trainers</h1>
      <p className="mt-1 text-sm text-slate-500">Ground instructors and subject faculty shown on the homepage and About page. Photos are optional.</p>
      <RecordManager table="mentors" fields={FIELDS} initial={data ?? []} titleKey="name" subtitleKey="role"
        imageAspect={FRAMES.mentor} imageLabel="the faculty card" imageOptional />
    </div>
  );
}
