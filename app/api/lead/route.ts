import { NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { saveEnquiry } from "@/lib/enquiries";
import { notifyAdmin } from "@/lib/mailer";
import { fullPhone, isValidPhone, phoneDigits } from "@/lib/form-defaults";

export const runtime = "nodejs";

type Body = {
  name?: string;
  email?: string;
  phone?: string;
  entry?: string;
  message?: string;
  source?: "eligibility" | "mock_test";
  meta?: Record<string, unknown>;
  company?: string; // honeypot
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Lightweight lead capture for the Eligibility Finder and Mock Tests.
 *  Needs a way to reach the aspirant: a valid Indian mobile OR an email
 *  (this audience is phone-first). Stores to the CRM, then emails the
 *  academy; both best-effort so a downstream outage never fails the visitor. */
export async function POST(req: Request) {
  const rl = rateLimit(`lead:${clientIp(req)}`, { limit: 8, windowMs: 60_000 });
  if (!rl.ok) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (body.company) return NextResponse.json({ ok: true }); // bot

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const digits = phoneDigits(body.phone ?? "");
  if (name.length < 2 || name.length > 80) return NextResponse.json({ error: "Enter a valid name." }, { status: 400 });
  if (email && !EMAIL.test(email)) return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  if (digits && !isValidPhone(digits)) return NextResponse.json({ error: "Enter a valid 10-digit mobile number." }, { status: 400 });
  if (!email && !digits) return NextResponse.json({ error: "Leave a phone number or an email so we can reach you." }, { status: 400 });
  const phone = fullPhone(digits);

  const source = body.source === "mock_test" ? "mock_test" : "eligibility";
  const entry = (body.entry ?? "").slice(0, 200);
  const message = (body.message ?? "").slice(0, 2000);
  const meta = body.meta && typeof body.meta === "object" ? body.meta : {};

  // enquiries.email is NOT NULL; a phone-only lead stores a blank email.
  await saveEnquiry({ name, email: email || "", phone, entry, message, source, meta });

  // Flatten what the tool captured (score, eligible exams, answers) so the
  // academy sees the full picture in the notification.
  const metaRows = Object.entries(meta)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .slice(0, 12)
    .map(([k, v]) => [
      k.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      Array.isArray(v) ? v.join(", ") : String(v),
    ] as [string, string]);

  const label = source === "mock_test" ? "Mock Test" : "Eligibility Finder";
  await notifyAdmin({
    subject: `${label} lead: ${name}`,
    subtitle: `New ${label.toLowerCase()} submission from the website`,
    ...(email ? { replyTo: email } : {}),
    rows: [
      ["Name", name],
      ["Email", email],
      ["Phone", phone],
      ["Source", label],
      ["Exam / interest", entry],
      ["Message", message],
      ...metaRows,
    ],
    footer: email ? "Reply directly to this email to reach the aspirant." : "No email given: call or WhatsApp the number above.",
  });

  return NextResponse.json({ ok: true });
}
