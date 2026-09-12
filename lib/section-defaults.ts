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
  badge: "Admissions are on: NDA batch from 21 September",
  headingLine1: "Train in Brahmapur.",
  headingLine2: "Serve the nation.",
  paragraph:
    "Samantroy Academy for Defence Career Studies has coached aspirants in Brahmapur (Berhampur), Ganjam since 2001, with <strong>4000+ recruitments</strong> across the Army, Navy, Air Force, CAPF, Odisha Police, bank, railway and SSC. Join after +2 Science, Commerce or Arts, or after graduation.",
  rating: "",
  typedPrefix: "Become ",
  typedWords: ["an Agniveer", "a Sailor", "an Airman", "a CAPF Constable", "a Police SI", "a Bank PO", "an Officer"],
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
  subtitle: "25 years of results from one centre in Brahmapur.",
};

export const WHYUS_ITEMS = [
  { icon: "trophy", title: "Since 2001, 4000+ recruitments", body: "A quarter century of coaching in Brahmapur, with selections every year across defence, police, bank and government jobs." },
  { icon: "shield", title: "Defence to desk jobs, one centre", body: "Army, Navy, Air Force, CAPF and Odisha Police, plus Bank, Railway, SSC, OSSC and OPSC. Change track without changing academy." },
  { icon: "exam", title: "The real exam pattern", body: "Classes and practice tests on the actual pattern of your exam, with negative marking where the exam has it." },
  { icon: "run", title: "Physical test prepared early", body: "Height, chest and running standards checked well before test day, while there is still time to close the gap." },
  { icon: "translate", title: "Odia and Odisha GK built in", body: "State exams test Odia and Odisha GK. We teach both, not just the central syllabus." },
  { icon: "graduation", title: "Every stream welcome", body: "Science, Commerce or Arts after +2, or graduates. Arts and Commerce students qualify for Air Force Y group, Navy MR, Army GD and SSC GD." },
];

export const CTA = {
  eyebrow: "Admissions are on",
  title: `The next batch starts ${em("21 September.")}`,
  paragraph: "NDA and other competitive exams from 21 September, CDS from 14 October. Book a free counselling call and we will check which exams you qualify for.",
};

export const RECENT_WINS: string[] = [];

export const ABOUT_VALUES = [
  { icon: "timer", title: "Measured, not guessed", body: "Every aspirant is measured, timed and tested from the first week, so progress is a number, not a feeling." },
  { icon: "handshake", title: "Honest with every aspirant", body: "We tell you where you stand, including when an exam is not the right fit." },
  { icon: "shield", title: "Discipline first", body: "Early mornings, fixed routines and full attendance. The forces expect it, so we do too." },
];

export const ABOUT_MISSION = {
  kicker: "",
  title: `Shaping the nation's warriors ${em("since 2001")}`,
  body:
    "<p>Samantroy Academy for Defence Career Studies has trained aspirants in Brahmapur (Berhampur), Ganjam since 2001. In 2026 the academy marks its 25th anniversary, with more than 4000 of its aspirants recruited into the Army, Navy, Air Force, the central armed police forces and Odisha Police, and into bank, railway, SSC and Odisha government jobs.</p><p>Aspirants join after +2 in Science, Commerce or Arts, or after graduation, from across Ganjam, Gajapati, Kandhamal, Khordha, Puri and Cuttack. Classes run at our centre on Sishu Mandir Road, Gosaninuagaon, 300 m from Brahmapur railway station.</p>",
  image: "/images/scenes/field-training.jpg",
};

export const GATEWAYS = [
  { icon: "student", title: "After 10th", body: "Army GD, SSC GD for BSF, CRPF, CISF, ITBP and SSB, Navy MR, RPF Constable and RRB Group D all open after Class 10.", tags: ["Army GD", "SSC GD", "Navy MR", "Group D"] },
  { icon: "graduation", title: "After +2", body: "Navy SSR, Air Force X and Y, Army Technical and Clerk, Odisha Police Constable, NDA and NTPC. Arts and Commerce students qualify for Air Force Y group.", tags: ["Navy SSR", "Air Force X / Y", "NDA", "OP Constable"] },
  { icon: "certificate", title: "After graduation", body: "Sub-Inspector posts, Bank PO and Clerk, SSC CGL, OSSC and OPSC, and the officer entries CDS and AFCAT open after a degree.", tags: ["OP SI", "Bank PO", "OPSC / ASO", "CDS / AFCAT"] },
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
