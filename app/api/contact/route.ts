import { NextResponse } from "next/server";
import { Resend } from "resend";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { saveEnquiry } from "@/lib/enquiries";
import { getPublished } from "@/lib/content";
import { notifyAdmin, emailShell, escapeHtml } from "@/lib/mailer";
import {
  CONTACT_FORM,
  fullPhone,
  isValidPhone,
  phoneDigits,
  resolveContactForm,
  type ContactFieldKey,
} from "@/lib/form-defaults";

export const runtime = "nodejs";

type Payload = {
  name?: string;
  email?: string;
  phone?: string;
  entry?: string;
  batch?: string;
  status?: string;
  message?: string;
  company?: string; // honeypot
};

export async function POST(req: Request) {
  // Throttle abusive submitters (best-effort per instance; honeypot handles bots).
  const rl = rateLimit(`contact:${clientIp(req)}`, { limit: 5, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "You're sending messages too quickly. Please try again shortly." },
      { status: 429 },
    );
  }

  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot filled → silently accept (bot)
  if (body.company) {
    return NextResponse.json({ ok: true });
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  // Normalise whatever arrives to the 10 national digits, so a number is
  // validated and stored identically however it was typed or pasted.
  const phoneNational = phoneDigits(body.phone ?? "");
  const phone = fullPhone(phoneNational);
  const entry = body.entry?.trim() ?? "";
  const batch = body.batch?.trim().slice(0, 120) ?? "";
  const currentStatus = body.status?.trim().slice(0, 120) ?? "";
  const message = body.message?.trim() ?? "";

  // Validate against the admin's own field settings. The form is configurable
  // - a field can be hidden or made optional - so hardcoding "email is
  // required" here rejected submissions from a form that never asked for one.
  const form = resolveContactForm(await getPublished<unknown>("contact_form", CONTACT_FORM));
  const cfg = (key: ContactFieldKey) => form.fields.find((f) => f.key === key);
  const isOn = (key: ContactFieldKey) => cfg(key)?.enabled !== false;
  const isRequired = (key: ContactFieldKey) => isOn(key) && cfg(key)?.required === true;
  const labelOf = (key: ContactFieldKey) => cfg(key)?.label || key;

  const missing = (["name", "phone", "email", "entry", "batch", "status", "message"] as ContactFieldKey[])
    .filter((k) => isRequired(k))
    .find((k) => !({ name, phone, email, entry, batch, status: currentStatus, message }[k] ?? "").trim());
  if (missing) {
    return NextResponse.json({ error: `Please fill in ${labelOf(missing)}.` }, { status: 400 });
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
  if (message.length > 2000) {
    return NextResponse.json({ error: "Message is too long." }, { status: 400 });
  }
  // A lead nobody can reply to is worthless, so insist on one channel - but
  // only when the admin has actually left one of them on the form.
  if (!email && !phone && (isOn("email") || isOn("phone"))) {
    return NextResponse.json({ error: "Please leave a phone number or an email so we can reach you." }, { status: 400 });
  }

  // Capture the lead in the CRM first (best-effort, independent of email).
  await saveEnquiry({
    name,
    // enquiries.email is NOT NULL; a form with no email column stores blank.
    email: email || "",
    phone,
    entry,
    message,
    source: "contact_form",
    meta: { batch, status: currentStatus },
  });

  // Notify the academy. Shared with the eligibility/mock-test route so both
  // behave identically and a missing RESEND_API_KEY is logged rather than
  // silently swallowed.
  const sent = await notifyAdmin({
    subject: `New enquiry: ${name} (${entry || "exam not specified"})`,
    subtitle: "New callback request from the website",
    ...(email ? { replyTo: email } : {}),
    rows: [
      ["Name", name],
      ["Email", email],
      ["Phone", phone],
      ["Target exam", entry],
      ["Preferred batch", batch],
      ["Where they are now", currentStatus],
      ["Message", message],
    ],
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
