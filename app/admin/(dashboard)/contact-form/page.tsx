import { createClient } from "@/lib/supabase/server";
import { resolveContactForm } from "@/lib/form-defaults";
import ContactFormManager from "@/components/admin/ContactFormManager";

export const dynamic = "force-dynamic";

export default async function ContactFormAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_content").select("draft").eq("key", "contact_form").maybeSingle();

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-slate-900">Contact &amp; Enquiry Form</h1>
      <p className="mt-1 text-sm text-slate-500">
        One set of settings drives both the form on the <b>Contact</b> page and the <b>enquiry popup</b> that
        opens when the site loads. Every submission is saved under Enquiries and emailed to the academy.
      </p>
      <ContactFormManager initial={resolveContactForm(data?.draft)} />
    </div>
  );
}
