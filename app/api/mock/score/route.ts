import { NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { createAdminClient, hasServiceRole } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { SAMPLE_QUESTIONS } from "@/lib/mock-defaults";

export const runtime = "nodejs";

type KeyRow = { id: string; answer: number | null; explanation: string | null; marks: number | null; negative_marks: number | null };

/** Scores a mock test server-side so correct answers are never exposed to the
 *  client before submission. Applies real CBT marking: +marks for a correct
 *  answer, -negative_marks for a wrong one, 0 for a skipped one.
 *  Body: { answers: { [questionId]: optionIndex } } */
export async function POST(req: Request) {
  const rl = rateLimit(`mock:${clientIp(req)}`, { limit: 20, windowMs: 60_000 });
  if (!rl.ok) return NextResponse.json({ error: "Too many attempts. Please wait." }, { status: 429 });

  let body: { answers?: Record<string, number> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const answers = body.answers && typeof body.answers === "object" ? body.answers : {};
  const ids = Object.keys(answers).slice(0, 100);
  if (ids.length === 0) return NextResponse.json({ error: "No answers submitted." }, { status: 400 });

  // Built-in sample questions (ids "s1"...) are answered from server code.
  const sampleIds = ids.filter((id) => /^s\d+$/.test(id));
  const dbIds = ids.filter((id) => !/^s\d+$/.test(id));

  const keys: KeyRow[] = SAMPLE_QUESTIONS.filter((q) => sampleIds.includes(q.id)).map((q) => ({
    id: q.id, answer: q.answer, explanation: q.explanation, marks: q.marks, negative_marks: q.negative_marks,
  }));

  if (dbIds.length) {
    // Answers live only in the base table, readable with the service role.
    if (!isSupabaseConfigured() || !hasServiceRole()) {
      return NextResponse.json({ error: "Scoring is not configured on the server." }, { status: 503 });
    }
    const { data, error } = await createAdminClient()
      .from("mock_questions")
      .select("id, answer, explanation, marks, negative_marks")
      .in("id", dbIds);
    if (error || !data) return NextResponse.json({ error: "Could not score right now." }, { status: 502 });
    keys.push(...(data as KeyRow[]));
  }

  let correct = 0;
  let wrong = 0;
  let score = 0;
  let max = 0;
  const details = keys.map((q) => {
    const chosen = answers[q.id];
    const marks = Number(q.marks ?? 1);
    const negative = Number(q.negative_marks ?? 0);
    max += marks;
    const attempted = typeof chosen === "number" && chosen >= 0;
    const isRight = attempted && typeof q.answer === "number" && chosen === q.answer;
    if (isRight) { correct += 1; score += marks; }
    else if (attempted) { wrong += 1; score -= negative; }
    return { id: q.id, chosen: attempted ? chosen : null, answer: q.answer, correct: isRight, explanation: q.explanation ?? null };
  });

  return NextResponse.json({
    correct,
    wrong,
    skipped: details.length - correct - wrong,
    total: details.length,
    score: Math.round(score * 100) / 100,
    max,
    details,
  });
}
