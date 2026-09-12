export type PageHeroDoc = { kicker: string; kickerSize?: string; title: string; subtitle: string; image: string; crumb: string };

/** Emphasis inside a title uses the SAME font in the accent colour (never a
 *  second typeface). The rich-text editor can apply the same class. */
const em = (s: string) => `<span class="hl">${s}</span>`;

export const PAGE_HEROES: Record<string, PageHeroDoc> = {
  about: {
    kicker: "", crumb: "About",
    title: `Trained on the ground. ${em("Selected on merit.")}`,
    subtitle: "Samantroy Academy for Defence Career Studies, Brahmapur (Ganjam), Odisha. Coaching for defence, police and government jobs since 2001.",
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
    subtitle: "Army, Navy, Air Force, CAPF, Odisha Police, OSSC and OPSC, Bank, Railway and SSC, and officer entries. Filter by what you are aiming for.",
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
    title: `Batches built around ${em("your exam")}`,
    subtitle: "Defence careers, police and CAPF, and bank, railway and SSC batches at our Brahmapur centre. Admissions are on.",
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
    title: `Results, ${em("year after year")}`,
    subtitle: "Result posters, selections and the aspirants who made it into uniform.",
    image: "/images/forces/assam-rifles-contingent.jpg",
  },
  selected: {
    kicker: "", crumb: "Wall of Selection",
    title: `Every aspirant who ${em("made it")}`,
    subtitle: "Selected candidates from Samantroy Academy, Brahmapur, across the Army, Navy, Air Force, CAPF, Odisha Police, Bank and OSSC.",
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
    title: `Visit us in ${em("Brahmapur")}`,
    subtitle: "300 m from the railway station, on Sishu Mandir Road, Gosaninuagaon. Call, WhatsApp or leave your details and we will call back.",
    image: "/images/scenes/field-training.jpg",
  },
};

export const pageHero = (key: string): PageHeroDoc =>
  PAGE_HEROES[key] ?? { kicker: "", title: "", subtitle: "", image: "/images/scenes/army-parade.jpg", crumb: "" };
