/**
 * Eligibility rules engine (indicative; official notifications are final).
 * Pure and dependency-free so it runs on the client for the interactive
 * finder and can be unit-tested with `node --test`.
 *
 * Extends the SSB Wings finder (age, gender, marital, education) with the
 * checks that decide other-rank eligibility: height, chest, category and
 * domicile. Every rejected entry comes back with the reason, so the finder
 * can show "near misses" ("2 cm short of the SSC GD height") instead of just
 * hiding them.
 */

import { EXAMS, type Education, type Exam } from "./exams.ts";
import { STANDARD_ROWS, lookupStandard, type Category, type StandardRow } from "./standards.ts";

export type Gender = "male" | "female";
export type Marital = "unmarried" | "married";

export type EligibilityInput = {
  age: number;
  gender: Gender;
  marital: Marital;
  education: Education;
  /** Maths and Physics in Class 12 (needed for SSR, Airman X, Navik GD, NDA air/navy). */
  pcm: boolean;
  heightCm: number | null;
  chestCm: number | null;
  category: Category;
  domicile: "odisha" | "other";
};

export type EducationRule = { min: Education; pcm?: boolean; graduate?: boolean };

/** Minimum education per exam. Kept here (not in the catalogue) because it is
 *  logic, not copy: the admin edits the human-readable qualification text. */
export const EDUCATION_RULES: Record<string, EducationRule> = {
  "army-agniveer-gd": { min: "10th" },
  "army-agniveer-technical": { min: "12th-science", pcm: true },
  "army-agniveer-clerk": { min: "12th-other" },
  "army-agniveer-tradesman": { min: "8th" },
  "navy-agniveer-ssr": { min: "12th-science", pcm: true },
  "navy-agniveer-mr": { min: "10th" },
  "airforce-agniveervayu-x": { min: "12th-science", pcm: true },
  "airforce-agniveervayu-y": { min: "12th-other" },
  "coast-guard-navik": { min: "10th" },
  "ssc-gd-constable": { min: "10th" },
  "ssc-cpo": { min: "graduate" },
  "odisha-police-constable": { min: "12th-other" },
  "odisha-police-si": { min: "graduate" },
  "odisha-forest-guard": { min: "10th" },
  "rrb-group-d": { min: "10th" },
  "rrb-ntpc": { min: "12th-other" },
  "rrb-alp": { min: "iti-diploma" },
  "rpf-constable": { min: "10th" },
  "ssc-mts": { min: "10th" },
  "ssc-chsl-cgl": { min: "12th-other" },
  nda: { min: "12th-other" },
  "cds-afcat": { min: "graduate" },
};

/** Rank of each education level. 12th science and 12th other are the same
 *  rank; the PCM flag is what separates science-only entries. */
const RANK: Record<Education, number> = {
  "8th": 0,
  "10th": 1,
  "iti-diploma": 2,
  "12th-other": 3,
  "12th-science": 3,
  graduate: 4,
};

export type Verdict = {
  exam: Exam;
  eligible: boolean;
  /** Plain-language reasons the candidate does not qualify (empty if eligible). */
  reasons: string[];
  /** Soft notes, e.g. relaxations that might apply. */
  notes: string[];
};

function educationOk(input: EligibilityInput, rule: EducationRule | undefined): boolean {
  if (!rule) return true;
  if (RANK[input.education] < RANK[rule.min]) {
    // A diploma satisfies 12th-level technical entries (e.g. Airman X).
    if (!(input.education === "iti-diploma" && rule.min === "12th-science")) return false;
  }
  if (rule.pcm && !input.pcm && input.education !== "iti-diploma" && input.education !== "graduate") return false;
  return true;
}

/** Pass the CMS exams and standards (rows keyed by exam_slug) so admin edits
 *  flow through; defaults are used when the CMS is empty. */
export function assess(input: EligibilityInput, exams: Exam[] = EXAMS, standards: StandardRow[] = STANDARD_ROWS): Verdict[] {
  return exams.map((exam) => {
    const reasons: string[] = [];
    const notes: string[] = [];

    if (exam.age_min != null && input.age < exam.age_min) reasons.push(`Minimum age is ${exam.age_min}`);
    if (exam.age_max != null && input.age > exam.age_max) {
      reasons.push(`Maximum age is ${exam.age_max}`);
      if (input.category !== "UR") notes.push("Reserved categories usually get an age relaxation. Check the notification.");
    }
    if (exam.gender !== "both" && exam.gender !== input.gender) {
      reasons.push(exam.gender === "male" ? "Open to men only" : "Open to women only");
    }
    if (/unmarried/i.test(exam.marital_status) && input.marital !== "unmarried") reasons.push("Must be unmarried");
    if (!educationOk(input, EDUCATION_RULES[exam.slug])) reasons.push(`Needs: ${exam.qualification}`);
    if (/odisha/i.test(exam.domicile) && input.domicile !== "odisha") reasons.push("Open to Odisha residents only");

    const std = lookupStandard(standards, exam.slug, input.gender, input.category);
    if (std?.height_cm != null && input.heightCm != null && input.heightCm < std.height_cm) {
      const short = Math.round((std.height_cm - input.heightCm) * 10) / 10;
      reasons.push(`${short} cm short of the ${std.height_cm} cm height standard`);
    }
    if (std?.chest_cm != null && input.chestCm != null && input.gender === "male" && input.chestCm < std.chest_cm) {
      const short = Math.round((std.chest_cm - input.chestCm) * 10) / 10;
      reasons.push(`${short} cm short of the ${std.chest_cm} cm chest standard`);
    }
    if (std?.region) notes.push(`Standard shown for ${std.region}.`);

    return { exam, eligible: reasons.length === 0, reasons, notes };
  });
}

/** Just the exams a candidate qualifies for. */
export const findEligible = (input: EligibilityInput, exams: Exam[] = EXAMS, standards: StandardRow[] = STANDARD_ROWS): Exam[] =>
  assess(input, exams, standards).filter((v) => v.eligible).map((v) => v.exam);

/** Exams missed on exactly one criterion: the most useful thing to show. */
export const nearMisses = (input: EligibilityInput, exams: Exam[] = EXAMS, standards: StandardRow[] = STANDARD_ROWS): Verdict[] =>
  assess(input, exams, standards).filter((v) => !v.eligible && v.reasons.length === 1);
