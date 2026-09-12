import "server-only";
import { getCollection, getPublished } from "@/lib/content";
import { EXAMS, type Exam } from "@/lib/exams";
import { STANDARD_ROWS, STANDARDS_DOC, type StandardRow, type StandardsDoc } from "@/lib/standards";
import { FAQS } from "@/lib/data";
import { SAMPLE_CANDIDATES, SAMPLE_MENTORS, SAMPLE_TESTIMONIALS } from "@/lib/sample-content";
import { SAMPLE_QUESTIONS, toPublic, type PublicQuestion } from "@/lib/mock-defaults";
import { coerceShape } from "@/lib/shape";

/**
 * Server loaders for every public collection. Each one reads the published
 * CMS view and falls back to built-in data, so the site renders before the
 * CMS is populated. `sample: true` means the list is design-review sample
 * content (lib/sample-content.ts) and the UI labels it as such.
 */

type Listed<T> = { items: T[]; sample: boolean };

async function listed<T>(view: string, fallback: T[], opts?: Parameters<typeof getCollection>[2]): Promise<Listed<T>> {
  const items = await getCollection<T>(view, fallback, opts);
  return { items, sample: items === fallback && fallback.length > 0 };
}

// ── Exams & standards ───────────────────────────────────────────────────
export async function getExams(): Promise<Exam[]> {
  const rows = await getCollection<Exam>("published_exams", EXAMS, { order: [{ column: "sort_order" }] });
  return rows.map((r) => ({ ...r, stages: Array.isArray(r.stages) ? r.stages : [] }));
}

export async function getExamBySlug(slug: string): Promise<Exam | null> {
  const exams = await getExams();
  return exams.find((e) => e.slug === slug) ?? null;
}

/** Standards rows keyed by exam slug (DB rows are joined through exam_id). */
export async function getStandards(): Promise<StandardRow[]> {
  const rows = await getCollection<StandardRow>("published_physical_standards", STANDARD_ROWS, { order: [{ column: "sort_order" }] });
  if (rows === STANDARD_ROWS) return rows;
  const exams = await getExams();
  const slugById = new Map(exams.filter((e) => e.id).map((e) => [e.id as string, e.slug]));
  return rows.map((r) => ({ ...r, exam_slug: r.exam_slug ?? (r.exam_id ? slugById.get(r.exam_id) : undefined) }));
}

export async function getStandardsDoc(): Promise<StandardsDoc> {
  return getPublished<StandardsDoc>("standards", STANDARDS_DOC);
}

// ── People & results ────────────────────────────────────────────────────
export type Candidate = {
  id?: string;
  name: string;
  exam: string;
  post: string | null;
  force: string | null;
  year: number | null;
  image_path: string | null;
  selected_on?: string | null;
  hometown?: string | null;
};

export const getCandidates = (limit?: number) =>
  listed<Candidate>("published_selected_candidates", SAMPLE_CANDIDATES, {
    limit,
    order: [
      { column: "selected_on", ascending: false, nullsFirst: false },
      { column: "sort_order", ascending: true },
    ],
  });

export type Mentor = { id?: string; name: string; role: string | null; specialty: string | null; bio: string | null; image_path: string | null };
export const getMentors = () => listed<Mentor>("published_mentors", SAMPLE_MENTORS as Mentor[]);

export type Testimonial = { id?: string; name: string; rank: string | null; body: string; image_path: string | null };
export const getTestimonials = () => listed<Testimonial>("published_testimonials", SAMPLE_TESTIMONIALS as Testimonial[]);

export type Faq = { id?: string; question: string; answer: string };
export async function getFaqs(): Promise<Faq[]> {
  return getCollection<Faq>("published_faqs", FAQS.map((f) => ({ question: f.q, answer: f.a })));
}

export type Selection = { id?: string; year: number; exam: string; center: string | null; count: number };
export async function getSelections(): Promise<Selection[]> {
  return getCollection<Selection>("published_selections", [], {
    order: [{ column: "year", ascending: false }, { column: "sort_order" }],
  });
}

// ── Blog ────────────────────────────────────────────────────────────────
export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_path: string | null;
  body: string;
  tag: string | null;
  author: string | null;
  published_at: string | null;
};

export async function getPosts(limit?: number): Promise<Post[]> {
  return getCollection<Post>("published_posts", [], {
    limit,
    order: [{ column: "published_at", ascending: false, nullsFirst: false }],
    columns: "id, slug, title, excerpt, cover_path, tag, author, published_at",
  });
}

export async function getPost(slug: string): Promise<Post | null> {
  const all = await getCollection<Post>("published_posts", [], { order: [{ column: "published_at", ascending: false }] });
  return all.find((p) => p.slug === slug) ?? null;
}

// ── Mock tests ──────────────────────────────────────────────────────────
/** Public question shape: NEVER includes the answer or explanation. */
export async function getMockQuestions(): Promise<{ items: PublicQuestion[]; sample: boolean }> {
  const fallback = SAMPLE_QUESTIONS.map(toPublic);
  const items = await getCollection<PublicQuestion>("published_mock_questions", fallback);
  return { items, sample: items === fallback };
}

// ── Resources ───────────────────────────────────────────────────────────
export type ResourceFolder = { id: string; name: string; parent_id: string | null; sort_order: number };
export type Resource = {
  id: string;
  folder_id: string | null;
  kind: "file" | "youtube";
  title: string;
  path: string | null;
  url: string | null;
  mime: string | null;
  thumbnail: string | null;
  sort_order: number;
};

export async function getResources(): Promise<{ folders: ResourceFolder[]; resources: Resource[] }> {
  const [folders, resources] = await Promise.all([
    getCollection<ResourceFolder>("resource_folders", [], { order: [{ column: "sort_order" }, { column: "name" }] }),
    getCollection<Resource>("resources", [], { order: [{ column: "sort_order" }] }),
  ]);
  return { folders, resources };
}

// ── Singleton docs used by several pages ────────────────────────────────
export async function getDoc<T extends object>(key: string, fallback: T): Promise<T> {
  const doc = await getPublished<T>(key, fallback);
  return coerceShape(doc, fallback);
}
