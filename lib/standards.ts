/**
 * Physical and medical standards.
 *
 *   STANDARD_ROWS  mirrors the `physical_standards` table (one row per
 *                  exam x gender x category). Drives the PST/PET tables, the
 *                  calculator and the summary on each exam page.
 *   STANDARDS_DOC  the explanatory copy around the tables (CMS key: standards).
 *
 * ACCURACY WARNING. These numbers change between notifications and an
 * aspirant who trains to a wrong figure can lose a whole cycle. Every row is
 * INDICATIVE, based on recent notifications, and must be re-verified against
 * the current official notification before launch and every cycle after.
 * Where a figure could not be verified the field is left blank and the site
 * shows "See notification" instead of a guess.
 */

export type Category = "All" | "UR" | "OBC" | "SC" | "ST";
export const CATEGORIES: Category[] = ["UR", "OBC", "SC", "ST"];

export type StandardRow = {
  id?: string;
  /** DB rows carry exam_id; the public loader fills exam_slug from it, so
   *  every consumer keys on the slug. Defaults carry the slug directly. */
  exam_id?: string | null;
  exam_slug?: string;
  label: string;
  gender: "male" | "female";
  category: Category;
  region: string;
  height_cm: number | null;
  chest_cm: number | null;
  chest_expanded_cm: number | null;
  weight_kg: string;
  run_distance_m: number | null;
  run_time: string;
  long_jump: string;
  high_jump: string;
  beam_pullups: string;
  ditch: string;
  zigzag: string;
  vision: string;
  notes: string;
  sort_order?: number;
};

const row = (r: Partial<StandardRow> & Pick<StandardRow, "exam_slug" | "gender">): StandardRow => ({
  label: "",
  category: "All",
  region: "",
  height_cm: null,
  chest_cm: null,
  chest_expanded_cm: null,
  weight_kg: "",
  run_distance_m: null,
  run_time: "",
  long_jump: "",
  high_jump: "",
  beam_pullups: "",
  ditch: "",
  zigzag: "",
  vision: "",
  notes: "",
  ...r,
});

export const STANDARD_ROWS: StandardRow[] = [
  // Army Agniveer GD (rally)
  row({
    exam_slug: "army-agniveer-gd", gender: "male", category: "All", region: "Odisha (eastern region)",
    height_cm: 169, chest_cm: 77, chest_expanded_cm: 82, weight_kg: "Proportionate to height",
    run_distance_m: 1600, run_time: "5 min 30 sec for full marks, 5 min 45 sec to qualify",
    beam_pullups: "6 to qualify, 10 for full marks", ditch: "9 ft, qualify", zigzag: "Qualify",
    notes: "Height varies by region and tribal areas get relaxation. Confirm in your ARO notification.",
  }),
  // Navy SSR / MR
  row({
    exam_slug: "navy-agniveer-ssr", gender: "male", height_cm: 157,
    run_distance_m: 1600, run_time: "6 min 30 sec",
    beam_pullups: "20 squats, 15 push-ups, 15 sit-ups",
    notes: "Same physical fitness test for MR.",
  }),
  row({
    exam_slug: "navy-agniveer-ssr", gender: "female", height_cm: 152,
    run_distance_m: 1600, run_time: "8 min",
    beam_pullups: "15 squats, 10 sit-ups",
    notes: "Same physical fitness test for MR.",
  }),
  // Air Force Agniveervayu
  row({
    exam_slug: "airforce-agniveervayu-x", gender: "male", height_cm: 152.5, chest_expanded_cm: null,
    run_distance_m: 1600, run_time: "7 min",
    beam_pullups: "10 push-ups, 10 sit-ups, 20 squats (1 min each)",
    notes: "Minimum chest expansion of 5 cm. Same test for the Y group.",
  }),
  row({
    exam_slug: "airforce-agniveervayu-x", gender: "female", height_cm: 152,
    run_distance_m: 1600, run_time: "8 min",
    beam_pullups: "10 sit-ups (90 sec), 15 squats (1 min)",
    notes: "Same test for the Y group.",
  }),
  // Coast Guard Navik
  row({
    exam_slug: "coast-guard-navik", gender: "male", height_cm: 157,
    run_distance_m: 1600, run_time: "7 min",
    beam_pullups: "20 squats, 10 push-ups",
  }),
  // SSC GD Constable
  row({
    exam_slug: "ssc-gd-constable", gender: "male", category: "UR", height_cm: 170,
    chest_cm: 80, chest_expanded_cm: 85, run_distance_m: 5000, run_time: "24 min",
    notes: "Applies to UR, OBC and SC. Hill and some regional categories get relaxation.",
  }),
  row({
    exam_slug: "ssc-gd-constable", gender: "male", category: "ST", height_cm: 162.5,
    chest_cm: 76, chest_expanded_cm: 81, run_distance_m: 5000, run_time: "24 min",
  }),
  row({
    exam_slug: "ssc-gd-constable", gender: "female", category: "UR", height_cm: 157,
    run_distance_m: 1600, run_time: "8 min 30 sec",
    notes: "Applies to UR, OBC and SC.",
  }),
  row({
    exam_slug: "ssc-gd-constable", gender: "female", category: "ST", height_cm: 150,
    run_distance_m: 1600, run_time: "8 min 30 sec",
  }),
  // Odisha Police Constable
  row({
    exam_slug: "odisha-police-constable", gender: "male", category: "UR", height_cm: 168,
    chest_cm: 79, chest_expanded_cm: 84,
    notes: "Applies to UR, SEBC and SC. PET events and marks are set in each OPRB notification.",
  }),
  row({
    exam_slug: "odisha-police-constable", gender: "male", category: "ST", height_cm: 163,
    chest_cm: 76, chest_expanded_cm: 81,
    notes: "PET events and marks are set in each OPRB notification.",
  }),
  row({
    exam_slug: "odisha-police-constable", gender: "female", category: "UR", height_cm: 155,
    weight_kg: "45 kg minimum",
    notes: "Applies to UR, SEBC and SC.",
  }),
  row({
    exam_slug: "odisha-police-constable", gender: "female", category: "ST", height_cm: 150,
    weight_kg: "45 kg minimum",
  }),
  // RPF Constable
  row({
    exam_slug: "rpf-constable", gender: "male", category: "UR", height_cm: 165,
    chest_cm: 80, chest_expanded_cm: 85, run_distance_m: 1600, run_time: "5 min 45 sec",
    long_jump: "14 ft", high_jump: "4 ft", notes: "Applies to UR and OBC.",
  }),
  row({
    exam_slug: "rpf-constable", gender: "male", category: "ST", height_cm: 160,
    chest_cm: 76.2, chest_expanded_cm: 81.2, run_distance_m: 1600, run_time: "5 min 45 sec",
    long_jump: "14 ft", high_jump: "4 ft", notes: "Applies to SC and ST.",
  }),
  row({
    exam_slug: "rpf-constable", gender: "female", category: "UR", height_cm: 157,
    run_distance_m: 800, run_time: "3 min 40 sec", long_jump: "9 ft", high_jump: "3 ft",
    notes: "Applies to UR and OBC.",
  }),
  row({
    exam_slug: "rpf-constable", gender: "female", category: "ST", height_cm: 152,
    run_distance_m: 800, run_time: "3 min 40 sec", long_jump: "9 ft", high_jump: "3 ft",
    notes: "Applies to SC and ST.",
  }),
  // RRB Group D
  row({
    exam_slug: "rrb-group-d", gender: "male", run_distance_m: 1000, run_time: "4 min 15 sec",
    beam_pullups: "Carry 35 kg for 100 m in 2 min without putting it down",
    notes: "No height or chest standard.",
  }),
  row({
    exam_slug: "rrb-group-d", gender: "female", run_distance_m: 1000, run_time: "5 min 40 sec",
    beam_pullups: "Carry 20 kg for 100 m in 2 min without putting it down",
    notes: "No height or chest standard.",
  }),
].map((r, i) => ({ ...r, sort_order: i }));

/** Pick the row that applies to a candidate. Exact category first, then the
 *  row that covers everyone, then the UR row (which most notifications use
 *  as the base standard). Returns null when the exam has no rows. */
export function lookupStandard(
  rows: StandardRow[],
  examKey: string,
  gender: "male" | "female",
  category: Category,
): StandardRow | null {
  const forExam = rows.filter((r) => r.exam_slug === examKey && r.gender === gender);
  if (forExam.length === 0) return null;
  const exact = forExam.find((r) => r.category === category);
  if (exact) return exact;
  // SC and OBC usually share the UR standard unless a separate row exists.
  return forExam.find((r) => r.category === "All") ?? forExam.find((r) => r.category === "UR") ?? forExam[0];
}

/** How far a candidate is from a height or chest requirement.
 *  Positive = margin above the minimum, negative = shortfall. */
export const margin = (have: number | null | undefined, need: number | null | undefined) =>
  have == null || need == null ? null : Math.round((have - need) * 10) / 10;

export type StandardsDoc = {
  kicker: string;
  kickerSize?: string;
  processTitle: string;
  processIntro: string;
  stages: { icon: string; step: string; title: string; detail: string }[];
  image1: string;
  image2: string;
  standardsTitle: string;
  standardsIntro: string;
  verifiedOn: string;
  medical: { area: string; requirement: string; notes: string }[];
  commonTitle: string;
  common: string[];
  appealTitle: string;
  appealBody: string;
  faqs: { q: string; a: string }[];
};

export const STANDARDS_DOC: StandardsDoc = {
  kicker: "",
  processTitle: "Four checks between you and the merit list",
  processIntro:
    "After the written exam, every force measures you, times you and examines you. Know the numbers for your exam before test day, not on it.",
  stages: [
    { icon: "ruler", step: "PST", title: "Physical standard test", detail: "Height, chest and weight measured against your category and region." },
    { icon: "run", step: "PET", title: "Physical efficiency test", detail: "Timed run plus the events your force uses: beam, jumps, ditch, balance." },
    { icon: "stethoscope", step: "Medical", title: "Detailed medical", detail: "Vision, hearing, teeth, feet, knees and general fitness." },
    { icon: "scales", step: "Review", title: "Review and appeal", detail: "If declared unfit, most forces allow a review or appeal medical within a set window." },
  ],
  image1: "/images/scenes/field-training.jpg",
  image2: "/images/scenes/police-training.jpg",
  standardsTitle: "Height, chest and timings by exam",
  standardsIntro:
    "Pick your exam to see the physical standard and the events you will face. Use the calculator to check your own numbers.",
  verifiedOn: "Indicative, based on recent notifications. Always confirm with the official notification for your cycle.",
  medical: [
    { area: "Vision", requirement: "Distance vision to the force's standard; colour perception tested", notes: "Some forces allow corrected vision, others do not" },
    { area: "Teeth", requirement: "A minimum number of healthy dental points", notes: "Get dental work done well before the medical" },
    { area: "Feet and knees", requirement: "No flat foot or knock knees beyond permitted limits", notes: "Early detection gives time to act" },
    { area: "Tattoos", requirement: "Permitted only in specific places and designs", notes: "Rules differ by force and tribal status" },
    { area: "General", requirement: "Normal hearing, blood pressure and BMI", notes: "Varicocele, hydrocele and ear wax are common temporary rejections" },
  ],
  commonTitle: "Most common reasons candidates are held back",
  common: [
    "Short by 1 to 2 cm in height",
    "Chest expansion under 5 cm",
    "Run time over the cut-off",
    "Flat foot",
    "Knock knees",
    "Colour vision",
    "Dental points",
    "Ear wax",
    "Varicocele",
    "Tattoo placement",
  ],
  appealTitle: "If you are declared unfit",
  appealBody:
    "<p>Most forces allow a review or appeal medical within a fixed window after the first examination. Many rejections, such as ear wax or dental problems, are temporary and can be corrected before the review.</p><p>Read the rejection slip carefully, note the deadline, and get a specialist opinion early. We guide our aspirants through this process.</p>",
  faqs: [
    { q: "Is height measured with shoes?", a: "No. Height is measured barefoot, standing straight, against a fixed scale." },
    { q: "Do ST candidates get relaxation?", a: "Yes, in most forces. The amount depends on the exam and sometimes the region. Check the category rows in the tables above." },
    { q: "Can I train for the run in 30 days?", a: "Improvement is possible in a month, but most aspirants who clear comfortably train for 8 to 12 weeks on the exact distance." },
  ],
};
