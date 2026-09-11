/** Default content for every CMS-editable section (single source of truth).
 *  Public components use these as fallback; the admin editor seeds from them.
 *  Plain data only: safe to import from server and client code.
 *
 *  Copy rules (design system): no em dashes, short headlines, and a section
 *  kicker on at most one section in three. Most kickers ship empty on purpose;
 *  the admin can add one and it renders only when non-empty. */

import { PAGE_HEROES } from "@/lib/pagehero-defaults";
import { DAYS, STATS, COURSES, BOOKS, FAQS } from "@/lib/data";
import { CENTRES_DOC } from "@/lib/centres";
import { STANDARDS_DOC } from "@/lib/standards";
import { VERTICALS_DOC } from "@/lib/verticals";
import { ENTRY_COUNTS, COURSES_NOTE, COURSES_OPTIONS, ENQUIRY_POPUP } from "@/lib/homepage-defaults";
import { TRACKER } from "@/lib/selection-defaults";
import { HEADING_DEFAULTS } from "@/lib/heading-defaults";

const em = (s: string) => `<span class="hl">${s}</span>`;

export const HERO = {
  badge: "Defence and government job coaching, Odisha",
  headingLine1: "Train for the test",
  headingLine2: "that decides the uniform.",
  paragraph:
    "Written exam, physical test and medical, prepared together. Every run is timed against your exam's cut-off, every mock marked the way the real one is.",
  rating: "",
  typedPrefix: "Become ",
  typedWords: ["an Agniveer", "a Constable", "a Sailor", "an Airman", "a Sub-Inspector"],
  primaryCta: "Book free counselling",
  primaryCtaHref: "/contact",
  secondaryCta: "Check eligibility",
  secondaryCtaHref: "/eligibility",
};

export const STORY = {
  kicker: "",
  title: `Most aspirants don't fail the exam. ${em("They fail the ground.")}`,
  paragraph:
    "Thousands clear the written paper every cycle and are sent home at the physical test, a few seconds over the run time or a centimetre short. Almost every case traces back to one of three gaps.",
};

export const STORY_GAPS = [
  { icon: "timer", title: "Training on the wrong clock", body: "Running every day but never against the exact distance and cut-off of their own exam." },
  { icon: "ruler", title: "Not knowing their numbers", body: "Height, chest and relaxations checked for the first time on test day, when it is too late to act." },
  { icon: "exam", title: "Treating the CBT as a school exam", body: "Answering everything on a paper with negative marking, and losing the marks that decided the merit list." },
];

export const WHYUS = {
  kicker: "",
  title: `Why aspirants choose ${em("Samantroy")}`,
  subtitle: "Coaching that treats the ground as seriously as the classroom.",
};

export const WHYUS_ITEMS = [
  { icon: "run", title: "A real ground, every morning", body: "Running track, beam, pits and a ditch on campus. You rehearse the exact events you will face." },
  { icon: "timer", title: "Every run is timed and logged", body: "Your times are recorded against your exam's cut-off, so you can see the gap closing week by week." },
  { icon: "exam", title: "Mocks on the real pattern", body: "Weekly full-length CBTs with negative marking and section-wise analysis." },
  { icon: "translate", title: "Odia and Odisha GK built in", body: "State exams test Odia and Odisha GK. We teach both, not just the central syllabus." },
  { icon: "stethoscope", title: "Medical pre-checks", body: "Height, chest, vision and common medical issues checked early, while there is still time to act." },
  { icon: "handshake", title: "Honest about your chances", body: "No guarantees. A clear picture of where you stand and what it will take." },
];

export const CTA = {
  eyebrow: "New batches start every month",
  title: `The next notification ${em("won't wait.")}`,
  paragraph: "Book a free counselling call. A trainer will check your eligibility and suggest the batch that fits your exam.",
};

export const RECENT_WINS: string[] = [];

export const ABOUT_VALUES = [
  { icon: "timer", title: "Measured, not guessed", body: "Every aspirant is measured, timed and tested from the first week, so progress is a number, not a feeling." },
  { icon: "handshake", title: "Honest with every aspirant", body: "We tell you where you stand, including when an exam is not the right fit." },
  { icon: "shield", title: "Discipline first", body: "Early mornings, fixed routines and full attendance. The forces expect it, so we do too." },
];

export const ABOUT_MISSION = {
  kicker: "",
  title: `Built for the aspirants ${em("coaching forgot")}`,
  body:
    "<p>Most coaching in the state is built for the written exam. But for Agniveer, SSC GD, Odisha Police and Railways, the written paper is only the first filter. The physical test and the medical decide who actually joins.</p><p>Samantroy Academy was set up to train both, together, with a real ground on campus and trainers who time every run against the exam's own cut-off.</p>",
  image: "/images/scenes/field-training.jpg",
};

export const GATEWAYS = [
  { icon: "student", title: "After 10th", body: "Army Agniveer GD, SSC GD, Navy MR, RPF Constable and RRB Group D all open after Class 10.", tags: ["Agniveer GD", "SSC GD", "Navy MR", "Group D"] },
  { icon: "graduation", title: "After 12th", body: "Navy SSR, Airman X and Y, Agniveer Technical and Clerk, Odisha Police Constable and NTPC need Class 12.", tags: ["Navy SSR", "Airman X / Y", "OP Constable", "NTPC"] },
  { icon: "certificate", title: "After graduation", body: "Sub-Inspector posts, SSC CGL and the officer entries CDS and AFCAT open after a degree.", tags: ["OP SI", "SSC CPO", "CGL", "CDS / AFCAT"] },
];

export const JOURNEY_INTRO = {
  text: "Every recruitment, from Agniveer to Odisha Police, follows the same seven stages. Most aspirants prepare hard for one of them. Selection needs all seven.",
};

export const BOOKS_DOC = { items: BOOKS };

export const SECTION_DEFAULTS: Record<string, Record<string, unknown>> = {
  hero: HERO,
  story: STORY,
  story_gaps: { items: STORY_GAPS },
  whyus: WHYUS,
  whyus_items: { items: WHYUS_ITEMS },
  cta: CTA,
  recent_wins: { items: RECENT_WINS.map((text) => ({ text })) },
  preloader: { lottie: "on" },
  exam_counts: { items: ENTRY_COUNTS },
  courses_cards: { items: COURSES },
  courses_note: { text: COURSES_NOTE },
  courses_options: COURSES_OPTIONS,
  enquiry_popup: ENQUIRY_POPUP,
  selection_tracker: TRACKER,
  centres: CENTRES_DOC,
  standards: STANDARDS_DOC,
  verticals: VERTICALS_DOC,
  about_values: { items: ABOUT_VALUES },
  about_mission: ABOUT_MISSION,
  gateways: { items: GATEWAYS },
  journey: { items: DAYS },
  journey_intro: JOURNEY_INTRO,
  stats: { items: STATS },
  books: BOOKS_DOC,
  faqs_fallback: { items: FAQS },
  // One editable heading doc per homepage section (heading.<key>).
  ...Object.fromEntries(Object.entries(HEADING_DEFAULTS).map(([k, v]) => [`heading.${k}`, v])),
  // One editable hero doc per interior page (pagehero.<page>).
  ...Object.fromEntries(Object.entries(PAGE_HEROES).map(([k, v]) => [`pagehero.${k}`, v])),
};
