import "server-only";
import { Resend } from "resend";

/** Where every lead notification is delivered. */
export const ADMIN_EMAIL = process.env.CONTACT_ADMIN_EMAIL || "info@samantroyacademy.com";
const FROM = process.env.CONTACT_FROM_EMAIL || "Samantroy Academy Website <onboarding@resend.dev>";

export const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Renders label/value pairs as the email's detail table. Empty values show "-". */
export function detailRows(rows: [string, string][]): string {
  return rows
    .map(
      ([k, v]) => `
        <tr>
          <td style="padding:10px 16px;font-weight:700;color:#141a17;background:#f3f4f0;border-bottom:1px solid #eee;white-space:nowrap;">${escapeHtml(k)}</td>
          <td style="padding:10px 16px;color:#333;border-bottom:1px solid #eee;">${escapeHtml(v || "-")}</td>
        </tr>`,
    )
    .join("");
}

export function emailShell(subtitle: string, inner: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e5e5;border-radius:12px;overflow:hidden;">
      <div style="background:#1a3625;padding:20px 24px;">
        <h1 style="margin:0;color:#ee7d1e;font-size:20px;letter-spacing:1px;">SAMANTROY ACADEMY</h1>
        <p style="margin:4px 0 0;color:#d9e4db;font-size:12px;">${escapeHtml(subtitle)}</p>
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
         <div style="padding:14px 24px;background:#f3f4f0;font-size:12px;color:#666;">
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
