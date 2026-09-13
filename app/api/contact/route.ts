import { NextResponse } from "next/server";
import { Resend } from "resend";
import { rateLimitShared, clientIp } from "@/lib/rate-limit";
import { readJson, verifyTurnstile, BOT_CHECK_FAILED } from "@/lib/security";
import { saveEnquiry } from "@/lib/enquiries";
import { getPublished } from "@/lib/content";
import { notifyAdmin, emailShell, escapeHtml } from "@/lib/mailer";
import {
  CONTACT_FORM,
  fullPhone,
  isBuiltin,
  isValidPhone,
  phoneDigits,
  resolveContactForm,
  type ContactField,
} from "@/lib/form-defaults";

export const runtime = "nodejs";

/** Field keys come from the admin's form, so the payload is open-ended; every
 *  value is read as a trimmed, length-capped string. */
type Payload = Record<string, unknown> & {
  company?: string; // honeypot
  _form?: string; // "popup" or "full"
  "cf-turnstile-response"?: string;
};

const MAX_LEN: Record<ContactField["type"], number> = { text: 200, textarea: 2000, select: 120, number: 20, phone: 20, email: 120 };

export async function POST(req: Request) {
  // Throttle: 5 a minute and 20 a day per IP, shared across all instances.
  if (!(await rateLimitShared("contact", req, { limit: 5, windowSeconds: 60 })) ||
      !(await rateLimitShared("contact-day", req, { limit: 20, windowSeconds: 86_400 }))) {
    return NextResponse.json(
      { error: "You're sending messages too quickly. Please try again later." },
      { status: 429 },
    );
  }

  const body = await readJson<Payload>(req);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  // Honeypot filled → silently accept (bot)
  if (body.company) {
    return NextResponse.json({ ok: true });
  }
  // Cloudflare Turnstile: stops scripted submissions that skip the page.
  if (!(await verifyTurnstile(body["cf-turnstile-response"], clientIp(req)))) {
    return NextResponse.json({ error: BOT_CHECK_FAILED }, { status: 400 });
  }

  // Validate against the admin's own form: its fields, visibility and
  // mandatory flags. The popup only shows fields marked "In popup", so only
  // those can be required there.
  const form = resolveContactForm(await getPublished<unknown>("contact_form", CONTACT_FORM));
  const fromPopup = body._form === "popup";
  const shown = form.fields.filter((f) => f.enabled && (!fromPopup || f.popup));
  const values = new Map<string, string>();
  for (const f of shown) {
    const v = body[f.key];
    values.set(f.key, typeof v === "string" ? v.trim().slice(0, MAX_LEN[f.type]) : "");
  }

  // Normalise whatever arrives to the 10 national digits, so a number is
  // validated and stored identically however it was typed or pasted.
  const phoneNational = phoneDigits(values.get("phone") ?? "");
  const phone = fullPhone(phoneNational);
  if (values.has("phone")) values.set("phone", phone);
  const name = values.get("name") ?? "";
  const email = values.get("email") ?? "";
  const entry = values.get("entry") ?? "";
  const batch = values.get("batch") ?? "";
  const currentStatus = values.get("status") ?? "";
  const message = values.get("message") ?? "";

  const missing = shown.find((f) => f.required && !values.get(f.key));
  if (missing) {
    return NextResponse.json({ error: `Please fill in ${missing.label}.` }, { status: 400 });
  }

  // Format checks apply to whatever was actually supplied, whether or not the
  // field was mandatory - a wrong email is still worth rejecting.
  if (name && (name.length < 2 || name.length > 80)) {
    return NextResponse.json({ error: "Please enter a valid name." }, { status: 400 });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }
  if (phoneNational && !isValidPhone(phoneNational)) {
    return NextResponse.json(
      { error: "Please enter a valid 10-digit mobile number." },
      { status: 400 },
    );
  }
  const badNumber = shown.find((f) => f.type === "number" && values.get(f.key) && !/^-?\d+(\.\d+)?$/.test(values.get(f.key)!));
  if (badNumber) {
    return NextResponse.json({ error: `Please enter a number for ${badNumber.label}.` }, { status: 400 });
  }
  // A lead nobody can reply to is worthless, so insist on one channel - but
  // only when the admin has actually left one of them on the form.
  if (!email && !phone && (values.has("email") || values.has("phone"))) {
    return NextResponse.json({ error: "Please leave a phone number or an email so we can reach you." }, { status: 400 });
  }

  // Answers to questions the admin added, with the label they had when asked
  // (so an enquiry still reads correctly after the question is renamed).
  const answers = shown
    .filter((f) => !isBuiltin(f.key) && values.get(f.key))
    .map((f) => ({ label: f.label, value: values.get(f.key)! }));

  // Capture the lead in the CRM first (best-effort, independent of email).
  await saveEnquiry({
    name,
    // enquiries.email is NOT NULL; a form with no email column stores blank.
    email: email || "",
    phone,
    entry,
    message,
    source: "contact_form",
    meta: { batch, status: currentStatus, answers },
  });

  // Notify the academy. Shared with the eligibility/mock-test route so both
  // behave identically and a missing RESEND_API_KEY is logged rather than
  // silently swallowed.
  const sent = await notifyAdmin({
    subject: `New enquiry: ${name} (${entry || "exam not specified"})`,
    subtitle: "New callback request from the website",
    ...(email ? { replyTo: email } : {}),
    // Every answered field, in the form's own order and with its own label.
    rows: shown.filter((f) => values.get(f.key)).map((f) => [f.label, values.get(f.key)!] as [string, string]),
    footer: email
      ? "Reply directly to this email to reach the aspirant."
      : "This aspirant left no email address - call or WhatsApp the number above.",
  });

  // Acknowledge the aspirant, when there is somewhere to send it.
  if (email && process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.CONTACT_FROM_EMAIL || "Samantroy Academy Website <onboarding@resend.dev>",
        to: email,
        subject: "We've received your enquiry - Samantroy Academy",
        html: emailShell(
          "Discipline. Fitness. Selection.",
          `<div style="padding:22px 24px;color:#333;font-size:14px;line-height:1.6;">
             <p>Dear ${escapeHtml(name)},</p>
             <p>Thank you for reaching out to <strong>Samantroy Academy</strong>. A trainer has received your enquiry${entry ? ` about <strong>${escapeHtml(entry)}</strong>` : ""} and will call you back shortly.</p>
             <p>Meanwhile, you can check the physical standards and eligibility for your exam on our website. Jai Hind.</p>
             <p style="margin-top:18px;color:#666;">- Team Samantroy Academy</p>
           </div>`,
        ),
      });
    } catch {
      /* auto-responder failure is non-fatal - the lead is already captured */
    }
  }

  // The lead is stored either way; `emailed` lets us tell them apart in logs.
  return NextResponse.json({ ok: true, emailed: sent });
}
