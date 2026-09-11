/**
 * SAMPLE CONTENT - FOR DESIGN REVIEW ONLY.
 *
 * These entries are NOT real people or real results. They exist so the
 * layout can be reviewed before the academy supplies its own content.
 *
 * Each list is used ONLY while the matching CMS table is empty. The moment
 * one real row is added in the admin (Selected Candidates, Faculty,
 * Testimonials), the public site switches to CMS data and these vanish.
 * The admin dashboard warns while any section is still showing samples.
 *
 * Before launch: add real entries in the admin, or empty these arrays.
 */

export const SAMPLE_NOTICE = "Sample content, replace in the admin";

export type SampleMentor = {
  name: string;
  role: string;
  specialty: string;
  bio: string;
  image_path: string | null;
};

export const SAMPLE_MENTORS: SampleMentor[] = [
  {
    name: "Physical Training Lead",
    role: "Ex-serviceman, ground instructor",
    specialty: "Running, beam, ditch and jumps",
    bio: "Runs the morning ground six days a week. Every run is timed against the aspirant's own exam cut-off.",
    image_path: null,
  },
  {
    name: "Maths and Reasoning Faculty",
    role: "Written exam faculty",
    specialty: "Arithmetic, reasoning, speed drills",
    bio: "Teaches the shortcuts that matter under a 60-minute clock and negative marking.",
    image_path: null,
  },
  {
    name: "GK and Odia Faculty",
    role: "Written exam faculty",
    specialty: "Static GK, Odisha GK, current affairs",
    bio: "Builds the GK section that separates the merit list, with a weekly current-affairs test.",
    image_path: null,
  },
];

export type SampleTestimonial = { name: string; rank: string; body: string; image_path: string | null };

export const SAMPLE_TESTIMONIALS: SampleTestimonial[] = [
  {
    name: "Sample aspirant",
    rank: "SSC GD Constable",
    body: "I was failing the 5 km run by almost two minutes. Timed runs every morning got me under the cut-off in seven weeks.",
    image_path: null,
  },
  {
    name: "Sample aspirant",
    rank: "Army Agniveer GD",
    body: "The beam was my weakest event. The trainers fixed my grip and I went from four pull-ups to ten before the rally.",
    image_path: null,
  },
  {
    name: "Sample aspirant",
    rank: "Odisha Police Constable",
    body: "The mock tests were harder than the real exam, which is exactly why the real one felt calm.",
    image_path: null,
  },
];

export type SampleCandidate = {
  name: string;
  exam: string;
  post: string | null;
  force: string | null;
  year: number | null;
  image_path: string | null;
};

/** Rendered as monogram tiles (no photos) so they can never be mistaken for
 *  a real person's picture. */
export const SAMPLE_CANDIDATES: SampleCandidate[] = [
  { name: "Sample A", exam: "SSC GD Constable", post: "Constable (GD)", force: "CRPF", year: 2026, image_path: null },
  { name: "Sample B", exam: "Army Agniveer GD", post: "Agniveer GD", force: "Army", year: 2026, image_path: null },
  { name: "Sample C", exam: "Navy Agniveer SSR", post: "Agniveer SSR", force: "Navy", year: 2026, image_path: null },
  { name: "Sample D", exam: "Odisha Police Constable", post: "Constable", force: "Odisha Police", year: 2026, image_path: null },
  { name: "Sample E", exam: "RRB Group D", post: "Track Maintainer", force: "Railways", year: 2025, image_path: null },
  { name: "Sample F", exam: "Air Force Agniveervayu", post: "Agniveervayu (Y)", force: "Air Force", year: 2025, image_path: null },
];
