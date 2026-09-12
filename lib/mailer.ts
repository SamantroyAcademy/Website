import "server-only";
import { Resend } from "resend";
import { R2_PUBLIC_URL } from "@/lib/supabase/media";

/** Where every lead notification is delivered. */
export const ADMIN_EMAIL = process.env.CONTACT_ADMIN_EMAIL || "samantroyacademy.dev@gmail.com";
// samantroyacademy.com is verified in Resend, so mail can come from the domain.
const FROM = process.env.CONTACT_FROM_EMAIL || "Samantroy Academy <noreply@samantroyacademy.com>";

export const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Renders label/value pairs as the email's detail table. Empty values show "-". */
export function detailRows(rows: [string, string][]): string {
  return rows
    .map(
      ([k, v]) => `
        <tr>
          <td style="padding:10px 16px;font-weight:700;color:#12151f;background:#f4f4f1;border-bottom:1px solid #eee;white-space:nowrap;">${escapeHtml(k)}</td>
          <td style="padding:10px 16px;color:#333;border-bottom:1px solid #eee;">${escapeHtml(v || "-")}</td>
        </tr>`,
    )
    .join("");
}

export function emailShell(subtitle: string, inner: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e5e5;border-radius:12px;overflow:hidden;">
      <div style="background:#ce0608;padding:20px 24px;">
        <img src="${R2_PUBLIC_URL}/images/brand/logo-1200.png" alt="Samantroy Academy: Shaping Nation's Warriors" width="220" style="display:block;width:220px;max-width:100%;height:auto;border:0;" />
        <p style="margin:10px 0 0;color:#ffe3e2;font-size:12px;">${escapeHtml(subtitle)}</p>
      </div>
      ${inner}
    </div>`;
}

/**
 * Send a lead notification to the academy inbox.
 *
 * Best-effort by design: the caller has already persisted the lead, so a
 * missing API key or a Resend outage must never fail the visitor's submission.
 * Returns whether the mail actually went out, for logging.
 */
export async function notifyAdmin(opts: {
  subject: string;
  subtitle: string;
  rows: [string, string][];
  replyTo?: string;
  footer?: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Loud on purpose: without this the lead is saved but nobody is told, and
    // the only symptom is an inbox that never fills up.
    console.error("RESEND_API_KEY is not set: lead saved but no email sent:", opts.subject);
    return false;
  }
  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      ...(opts.replyTo ? { replyTo: opts.replyTo } : {}),
      subject: opts.subject,
      html: emailShell(
        opts.subtitle,
        `<table style="width:100%;border-collapse:collapse;font-size:14px;">${detailRows(opts.rows)}</table>
         <div style="padding:14px 24px;background:#f4f4f1;font-size:12px;color:#666;">
           ${escapeHtml(opts.footer ?? "Reply directly to this email to reach the aspirant.")}
         </div>`,
      ),
    });
    if (error) {
      console.error("Resend error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Mailer error:", err);
    return false;
  }
}
