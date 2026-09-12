import { getSettings } from "@/lib/content";
import { COURSES, FAQS } from "@/lib/data";
import { verticalLabel } from "@/lib/exams";
import { getExams } from "@/lib/public-data";

export const revalidate = 3600;

/** /llms.txt: a plain summary of the academy for AI assistants and answer
 *  engines (https://llmstxt.org). Built from the same CMS data as the site. */
export async function GET() {
  const [s, exams] = await Promise.all([getSettings(), getExams()]);
  const url = s.url;
  const phones = [s.phone1, s.phone2].filter(Boolean).join(", ");
  const byVertical = new Map<string, string[]>();
  for (const e of exams) byVertical.set(e.vertical, [...(byVertical.get(e.vertical) ?? []), `- [${e.name}](${url}/exams/${e.slug}): ${e.stage}${e.qualification ? `. ${e.qualification}` : ""}`]);

  const body = `# ${s.name}

> ${s.legalName || s.name} is a coaching institute in Brahmapur (Berhampur), Ganjam district, Odisha, India, preparing aspirants for defence, police and government job exams since ${s.foundedYear || "2001"}. It reports 4000+ recruitments. Tagline: "${s.tagline}".

## Key facts
- Address: ${s.address}
- Phone: ${phones}${s.contactName ? ` (${s.contactName})` : ""}${s.helplines ? `\n- More helplines: ${s.helplines}` : ""}${s.email ? `\n- Email: ${s.email}` : ""}
- WhatsApp: ${s.whatsapp}
- Founded: ${s.foundedYear || "2001"} (25th anniversary in 2026)
- Recruitments: 4000+ across the Army, Navy, Air Force, CAPF (BSF, CRPF, CISF, ITBP, SSB), Odisha Police, OSSC, OSSSC, OPSC, Bank, Railway and SSC
- Who can join: students after +2 (Science, Commerce or Arts) or after graduation. Arts and Commerce students are eligible for Air Force Y group, Navy MR, Army GD and SSC GD.
- Next batches: NDA and other competitive exams from 21 September; CDS from 14 October (2026)
- Officer results: AFCAT All India Rank 183 (E Suman Reddy), Army ACC All India Rank 26 (Bal Ganesh)
- Social: ${[s.instagram, s.youtube, s.facebook].filter(Boolean).join(", ")}

## Courses
${COURSES.map((c) => `- ${c.title}: ${c.desc}`).join("\n")}

## Exams covered
${[...byVertical].map(([v, lines]) => `### ${verticalLabel(v)}\n${lines.join("\n")}`).join("\n\n")}

## Frequently asked questions
${FAQS.map((f) => `- Q: ${f.q}\n  A: ${f.a}`).join("\n")}

## Pages
- [Home](${url}/)
- [About](${url}/about)
- [Courses](${url}/courses)
- [All exams](${url}/exams)
- [Eligibility finder](${url}/eligibility)
- [Physical standards](${url}/standards)
- [Wall of Selection](${url}/selected)
- [Results gallery](${url}/gallery)
- [Free mock tests](${url}/mock-tests)
- [Contact](${url}/contact)
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
