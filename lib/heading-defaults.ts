/** Default heading for each homepage section (CMS key: heading.<key>).
 *  Shared by the public components (as fallback) AND the admin editor (as the
 *  starting values), so what the admin sees is exactly what the site shows.
 *
 *  Kickers are rationed: at most one section in three carries one. */

export type HeadingDoc = { kicker: string; title: string; subtitle?: string; kickerSize?: string };

const em = (s: string) => `<span class="hl">${s}</span>`;

export const HEADING_DEFAULTS: Record<string, HeadingDoc> = {
  wall: {
    kicker: "Wall of Selection",
    title: `They trained here. ${em("Now they serve.")}`,
    subtitle: "Aspirants who cleared the written exam, the ground and the medical.",
  },
  toppers: { kicker: "", title: "Top ranks", subtitle: "" },
  courses: {
    kicker: "",
    title: `Pick the batch that fits ${em("your exam")}`,
    subtitle: "Written, physical or both. Every batch is measured against the real cut-off.",
  },
  campus: { kicker: "", title: `A ground, ${em("not just a classroom")}`, subtitle: "Where the running, jumping and drill happen every morning." },
  books: { kicker: "", title: "Study material", subtitle: "" },
  mentors: {
    kicker: "Faculty",
    title: `The people who ${em("time your runs")}`,
    subtitle: "Ground instructors and subject faculty who train every batch themselves.",
  },
  stats: { kicker: "", title: `The numbers so far`, subtitle: "" },
  testimonials: { kicker: "", title: `In their ${em("own words")}`, subtitle: "" },
  videos: { kicker: "", title: "Watch and learn", subtitle: "Lessons, strategy and results on our channel." },
  google_reviews: { kicker: "", title: "What students say on Google", subtitle: "" },
  instagram: { kicker: "", title: `Follow the ${em("daily ground")}`, subtitle: "Training clips, notifications and results, every week." },
  officer_banners: { kicker: "Now serving", title: "Alumni in uniform", subtitle: "" },
  faq: { kicker: "", title: "Questions we hear every day", subtitle: "" },
};

export const headingDefault = (key: string): HeadingDoc =>
  HEADING_DEFAULTS[key] ?? { kicker: "", title: "", subtitle: "" };
