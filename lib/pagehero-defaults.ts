export type PageHeroDoc = { kicker: string; kickerSize?: string; title: string; subtitle: string; image: string; crumb: string };

/** Emphasis inside a title uses the SAME font in the accent colour (never a
 *  second typeface). The rich-text editor can apply the same class. */
const em = (s: string) => `<span class="hl">${s}</span>`;

export const PAGE_HEROES: Record<string, PageHeroDoc> = {
  about: {
    kicker: "", crumb: "About",
    title: `Trained on the ground. ${em("Selected on merit.")}`,
    subtitle: "A coaching academy in Odisha built around one idea: train every aspirant against the real cut-off, every day.",
    image: "/images/scenes/army-parade.jpg",
  },
  "recruitment-process": {
    kicker: "", crumb: "Recruitment process",
    title: `Seven stages from form to ${em("joining")}`,
    subtitle: "Every force follows the same path. Know each stage before you face it.",
    image: "/images/scenes/field-training.jpg",
  },
  exams: {
    kicker: "", crumb: "Exams",
    title: `Every exam we ${em("prepare")} you for`,
    subtitle: "Armed forces, CAPF, Odisha State, Railways and SSC. Filter by what you are aiming for.",
    image: "/images/forces/bsf-contingent.jpg",
  },
  standards: {
    kicker: "", crumb: "Physical standards",
    title: `Height, chest, run time. ${em("Know your numbers.")}`,
    subtitle: "Physical and medical standards by exam, with a calculator to check yours.",
    image: "/images/scenes/police-training.jpg",
  },
  "training-centres": {
    kicker: "", crumb: "Training centres",
    title: `Where recruits are ${em("trained")}`,
    subtitle: "The centre you report to after selection, and what training asks of you.",
    image: "/images/forces/navy-contingent.jpg",
  },
  courses: {
    kicker: "", crumb: "Courses",
    title: `Batches built around the ${em("cut-off")}`,
    subtitle: "Written, physical or both. Every batch is measured against the exam you are taking.",
    image: "/images/scenes/field-training.jpg",
  },
  eligibility: {
    kicker: "", crumb: "Eligibility",
    title: `Which exams can ${em("you")} apply for?`,
    subtitle: "Answer a few questions. See every exam you qualify for, and the ones you are close to.",
    image: "/images/forces/crpf-contingent.jpg",
  },
  "mock-tests": {
    kicker: "", crumb: "Mock tests",
    title: `Free mock tests with ${em("instant score")}`,
    subtitle: "Timed questions on the real pattern, with negative marking and explanations.",
    image: "/images/forces/iaf-contingent.jpg",
  },
  resources: {
    kicker: "", crumb: "Resources",
    title: `Free notes, papers and ${em("lessons")}`,
    subtitle: "Syllabus PDFs, previous papers and video lessons, sorted by exam.",
    image: "/images/scenes/odisha-police-hq.jpg",
  },
  gallery: {
    kicker: "", crumb: "Gallery",
    title: `On the ground and ${em("in uniform")}`,
    subtitle: "Training, results and the aspirants who made it.",
    image: "/images/forces/assam-rifles-contingent.jpg",
  },
  selected: {
    kicker: "", crumb: "Wall of Selection",
    title: `Every aspirant who ${em("made it")}`,
    subtitle: "The complete wall of our selected candidates across forces and exams.",
    image: "/images/forces/itbp-contingent.jpg",
  },
  blog: {
    kicker: "", crumb: "Blog",
    title: `Notifications, strategy and ${em("updates")}`,
    subtitle: "Exam alerts, preparation plans and physical training advice from our trainers.",
    image: "/images/forces/coastguard-contingent.jpg",
  },
  testimonials: {
    kicker: "", crumb: "Testimonials",
    title: `In their ${em("own words")}`,
    subtitle: "What changed for our aspirants between joining and selection.",
    image: "/images/scenes/army-parade.jpg",
  },
  contact: {
    kicker: "", crumb: "Contact",
    title: `Talk to a ${em("trainer")}`,
    subtitle: "Share your details. We call back with the exams you qualify for and a plan to clear them.",
    image: "/images/scenes/field-training.jpg",
  },
};

export const pageHero = (key: string): PageHeroDoc =>
  PAGE_HEROES[key] ?? { kicker: "", title: "", subtitle: "", image: "/images/scenes/army-parade.jpg", crumb: "" };
