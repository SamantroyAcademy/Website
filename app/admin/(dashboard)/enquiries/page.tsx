import { createClient } from "@/lib/supabase/server";
import EnquiryInbox, { type Enquiry } from "@/components/admin/EnquiryInbox";

export const dynamic = "force-dynamic";

export default async function EnquiriesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("enquiries")
    .select("id, name, email, phone, entry, message, source, status, notes, meta, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Enquiries</h1>
      <p className="mt-1 text-sm text-slate-500">
        Every website enquiry lands here. Move each lead through the pipeline and add notes.
      </p>
      <EnquiryInbox initial={(data ?? []) as Enquiry[]} />
    </div>
  );
}
