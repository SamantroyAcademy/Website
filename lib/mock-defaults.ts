/** Mock-test subjects and the sample questions used while the CMS has none.
 *  Answers never reach the browser: the page only receives toPublic() copies,
 *  and /api/mock/score looks up sample answers on the server (ids "s1".."s8"). */

export const MOCK_SUBJECTS = [
  "General Knowledge",
  "Odisha GK",
  "Mathematics",
  "Reasoning",
  "General Science",
  "English",
  "Odia",
  "Current Affairs",
  "Computer",
] as const;

export type PublicQuestion = {
  id: string;
  type: "MCQ" | "TF";
  subject: string;
  exam_id: string | null;
  question: string;
  options: string[];
  difficulty: string | null;
  marks: number;
  negative_marks: number;
};

export type SampleQuestion = PublicQuestion & { answer: number; explanation: string };

export const SAMPLE_QUESTIONS: SampleQuestion[] = [
  { id: "s1", type: "MCQ", subject: "Mathematics", exam_id: null, question: "A soldier runs 1.6 km in 6 minutes. What is his average speed in km/h?", options: ["14 km/h", "16 km/h", "18 km/h", "20 km/h"], answer: 1, explanation: "1.6 km in 6 min = 1.6 × 10 = 16 km/h.", difficulty: "easy", marks: 1, negative_marks: 0.25 },
  { id: "s2", type: "MCQ", subject: "Reasoning", exam_id: null, question: "Complete the series: 3, 7, 15, 31, ?", options: ["47", "55", "63", "62"], answer: 2, explanation: "Each term is double the previous plus 1: 31 × 2 + 1 = 63.", difficulty: "easy", marks: 1, negative_marks: 0.25 },
  { id: "s3", type: "MCQ", subject: "Odisha GK", exam_id: null, question: "Chilika Lake, where the Navy trains its sailors at INS Chilka, is in which state?", options: ["Andhra Pradesh", "Odisha", "West Bengal", "Tamil Nadu"], answer: 1, explanation: "Chilika Lake lies on Odisha's east coast across Puri, Khordha and Ganjam districts.", difficulty: "easy", marks: 1, negative_marks: 0.25 },
  { id: "s4", type: "MCQ", subject: "General Science", exam_id: null, question: "Which vitamin is produced in the skin when exposed to sunlight?", options: ["Vitamin A", "Vitamin B12", "Vitamin C", "Vitamin D"], answer: 3, explanation: "Sunlight triggers Vitamin D synthesis in the skin.", difficulty: "easy", marks: 1, negative_marks: 0.25 },
  { id: "s5", type: "MCQ", subject: "Reasoning", exam_id: null, question: "If CAT is coded as DBU, how is DOG coded?", options: ["EPH", "EOH", "FPH", "EPG"], answer: 0, explanation: "Each letter moves one step forward: D→E, O→P, G→H.", difficulty: "medium", marks: 1, negative_marks: 0.25 },
  { id: "s6", type: "MCQ", subject: "General Knowledge", exam_id: null, question: "Which force guards India's borders with Pakistan and Bangladesh?", options: ["CRPF", "CISF", "BSF", "ITBP"], answer: 2, explanation: "The Border Security Force guards the Pakistan and Bangladesh borders.", difficulty: "easy", marks: 1, negative_marks: 0.25 },
  { id: "s7", type: "MCQ", subject: "Mathematics", exam_id: null, question: "The average of 5 numbers is 24. If one number is removed the average becomes 22. The removed number is:", options: ["28", "30", "32", "34"], answer: 2, explanation: "Total 120, remaining 4 × 22 = 88, so removed = 32.", difficulty: "medium", marks: 1, negative_marks: 0.25 },
  { id: "s8", type: "MCQ", subject: "English", exam_id: null, question: "Choose the word closest in meaning to 'diligent'.", options: ["Lazy", "Hard-working", "Careless", "Quick"], answer: 1, explanation: "Diligent means showing care and effort in work.", difficulty: "easy", marks: 1, negative_marks: 0.25 },
];

/** Strip the answer so sample questions have the same public shape. */
export const toPublic = (q: SampleQuestion): PublicQuestion => {
  const { answer: _a, explanation: _e, ...rest } = q;
  void _a; void _e;
  return rest;
};
