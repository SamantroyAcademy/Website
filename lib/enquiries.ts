import "server-only";
import { createAdminClient, hasServiceRole } from "@/lib/supabase/admin";

export type EnquiryInput = {
  name: string;
  email: string;
  phone?: string;
  entry?: string;
  message?: string;
  source?: "contact_form" | "eligibility" | "mock_test";
  meta?: Record<string, unknown>;
};

/** Persist a lead to the CRM. Best-effort: never throws — the caller's primary
 *  job (e.g. sending the notification email) must not fail if the DB is down.
 *  Uses the service role so the enquiries table stays admin-only for reads. */
export async function saveEnquiry(input: EnquiryInput): Promise<void> {
  if (!hasServiceRole()) return;
  try {
    const admin = createAdminClient();
    await admin.from("enquiries").insert({
      name: input.name,
      email: input.email,
      phone: input.phone ?? null,
      entry: input.entry ?? null,
      message: input.message ?? null,
      source: input.source ?? "contact_form",
      meta: input.meta ?? {},
    });
  } catch {
    // swallow — lead capture is best-effort
  }
}
