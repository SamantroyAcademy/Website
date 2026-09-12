/** Homepage section registry + default order.
 *  Plain data (no components) so it is safe to import from client code too —
 *  the admin reorder screen uses the same list the page renders from. */

export type HomeSectionKey =
  | "entries_marquee"
  | "air1_marquee"
  | "wall"
  | "shorts"
  | "courses"
  | "campus"
  | "books"
  | "mentors"
  | "four_forces"
  | "whyus"
  | "countdown"
  | "stats"
  | "selection_tracker"
  | "journey"
  | "officer_banners"
  | "videos"
  | "google_reviews"
  | "testimonials"
  | "instagram"
  | "faq"
  | "cta";

export type HomeSectionMeta = { key: HomeSectionKey; label: string; hint?: string; editHref?: string };

/** Every movable homepage section, in the order they ship by default.
 *  (The hero is always first and is not part of this list.) */
export const HOME_SECTIONS: HomeSectionMeta[] = [
  { key: "entries_marquee", label: "Exams Marquee", hint: "Exam names scrolling band", editHref: "/admin/sections/exam_counts" },
  { key: "four_forces", label: "Six Verticals", hint: "Armed forces, CAPF, Odisha, Bank and SSC, Railways, Officer", editHref: "/admin/verticals" },
  { key: "journey", label: "Recruitment Journey", hint: "The seven stages", editHref: "/admin/sections/journey" },
  { key: "courses", label: "Courses", hint: "Batch cards + facilities note", editHref: "/admin/courses" },
  { key: "stats", label: "Scoreboard + Recent Wins", editHref: "/admin/stats" },
  { key: "whyus", label: "Why Samantroy", hint: "Heading + reasons", editHref: "/admin/sections/whyus_items" },
  { key: "wall", label: "Wall of Selection", hint: "Selected candidate tiles", editHref: "/admin/candidates" },
  { key: "shorts", label: "Student Stories", hint: "YouTube Shorts and result clips", editHref: "/admin/shorts" },
  { key: "air1_marquee", label: "Result Posters", hint: "Swipeable result posters", editHref: "/admin/toppers" },
  { key: "countdown", label: "Countdown", hint: "Batch and exam dates", editHref: "/admin/countdown" },
  { key: "campus", label: "Campus Gallery", hint: "Ground and classroom photos", editHref: "/admin/campus" },
  { key: "mentors", label: "Faculty", hint: "Trainers and subject faculty", editHref: "/admin/mentors" },
  { key: "selection_tracker", label: "Selection Tracker", hint: "Hidden until rows are added", editHref: "/admin/selections" },
  { key: "testimonials", label: "Testimonials", editHref: "/admin/testimonials" },
  { key: "officer_banners", label: "Now Serving", hint: "Hidden until images are added", editHref: "/admin/officer-banners" },
  { key: "books", label: "Study Material", hint: "Hidden until books are added", editHref: "/admin/sections/books" },
  { key: "videos", label: "YouTube Videos", hint: "Shares the Resources videos", editHref: "/admin/resources" },
  { key: "google_reviews", label: "Google Reviews", hint: "Hidden until reviews are added", editHref: "/admin/google-reviews" },
  { key: "instagram", label: "Social", hint: "Instagram and YouTube links" },
  { key: "faq", label: "FAQs", editHref: "/admin/faqs" },
  { key: "cta", label: "CTA Banner", editHref: "/admin/sections/cta" },
];

export type HomeOrderItem = { key: HomeSectionKey; enabled: boolean };

export const HOME_ORDER_DEFAULT: HomeOrderItem[] = HOME_SECTIONS.map((s) => ({ key: s.key, enabled: true }));

/** Merge a saved order with the registry: keeps the admin's order, drops keys
 *  that no longer exist, and appends any newly-added sections at the end. */
export function resolveHomeOrder(saved: unknown): HomeOrderItem[] {
  const list = Array.isArray(saved) ? (saved as HomeOrderItem[]) : [];
  const known = new Set(HOME_SECTIONS.map((s) => s.key));
  const seen = new Set<string>();
  const out: HomeOrderItem[] = [];
  for (const it of list) {
    if (!it || typeof it.key !== "string" || !known.has(it.key as HomeSectionKey) || seen.has(it.key)) continue;
    seen.add(it.key);
    out.push({ key: it.key as HomeSectionKey, enabled: it.enabled !== false });
  }
  for (const s of HOME_SECTIONS) if (!seen.has(s.key)) out.push({ key: s.key, enabled: true });
  return out;
}
