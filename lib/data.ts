/**
 * Built-in content defaults. The public site renders these whenever the CMS
 * has no published value, so the site works before Supabase is configured.
 * Every value here is editable from /admin once the CMS is connected.
 *
 * PLACEHOLDERS - replace before launch (Admin -> Footer & Contact):
 *   phone, WhatsApp, email, address, map link, socials, payment links.
 *   The phone number below is deliberately invalid so it can never ring a
 *   real person by accident.
 *
 * SAMPLE CONTENT - see lib/sample-content.ts. Faculty, testimonials and the
 * Wall of Selection ship with clearly-labelled samples so the design can be
 * reviewed. They disappear as soon as real rows are added in the admin.
 */

import type { IconKey } from "@/lib/icons";

export const SITE = {
  name: "Samantroy Academy",
  tagline: "Discipline. Fitness. Selection.",
  phone1: "+91 00000 00000",
  phone1Href: "tel:+910000000000",
  // Second line: leave blank and the site hides it everywhere.
  phone2: "",
  phone2Href: "",
  whatsapp: "https://wa.me/910000000000?text=Jai%20Hind!%20I%20want%20to%20know%20about%20Samantroy%20Academy%20batches.",
  email: "info@samantroyacademy.com",
  address: "Samantroy Academy, Bhubaneswar, Odisha",
  /** Opens the academy on Google Maps. Every address on the site links here. */
  mapUrl: "https://maps.google.com/maps?q=Bhubaneswar%2C%20Odisha",
  instagram: "https://www.instagram.com/",
  youtube: "https://www.youtube.com/",
  telegram: "https://t.me/",
  facebook: "https://www.facebook.com/",
  url: "https://www.samantroyacademy.com",
  brochure: "",
  /** "off" hides the download and sends those links to the contact page. */
  brochureEnabled: "off",
  enrollOffline: "",
  enrollOnline: "",
  officeHours: "Mon to Sat, 6:00 AM to 8:00 PM",
};

/** Batch cadence shown on the Courses page. */
export const BATCH_INFO = {
  offline:
    "New offline batches start every month at the Bhubaneswar campus. Ground training runs every morning; classroom sessions follow. Exact dates are confirmed at enrolment.",
  online:
    "Live online batches run every evening with recordings. The next start date is shared on enrolment or over WhatsApp.",
};

/** Colour theme per force / vertical. Drives the accent strip on journey
 *  stages, course cards and exam cards. */
export type Tone = "army" | "navy" | "airforce" | "capf" | "odisha" | "railway";
export const TONE_OPTIONS: { value: Tone; label: string }[] = [
  { value: "army", label: "Army (olive)" },
  { value: "navy", label: "Navy (deep blue)" },
  { value: "airforce", label: "Air Force (sky)" },
  { value: "capf", label: "CAPF (khaki)" },
  { value: "odisha", label: "Odisha State (Konark red)" },
  { value: "railway", label: "Railways (steel blue)" },
];

/** Scoreboard. `suffix` follows the number; the admin can blank it or use %.
 *  PLACEHOLDER numbers: replace with real figures in Admin -> Scoreboard. */
export type Stat = { value: number; label: string; suffix?: string };
export const STATS: Stat[] = [
  { value: 1200, label: "Aspirants trained", suffix: "+" },
  { value: 380, label: "Selections", suffix: "+" },
  { value: 12, label: "Forces and departments", suffix: "" },
  { value: 6, label: "Days a week on the ground", suffix: "" },
];

/** Study material / books. Hidden on the homepage when empty. */
export type BookItem = {
  title: string;
  subtitle: string;
  author: string;
  publisher: string;
  edition?: string;
  blurb: string;
  cover: string;
  buyUrl: string;
};
export const BOOKS: BookItem[] = [];

/** Course / batch cards. PLACEHOLDER prices: set real fees in Admin -> Courses,
 *  or switch prices off in Admin -> Pages & Sections -> Course Prices. */
export type CourseItem = {
  tag: string;
  highlight: boolean;
  title: string;
  where: string;
  price?: string;
  service: Tone;
  desc: string;
  features: string[];
  cta: string;
  enrollUrl?: string;
  ctaUrl?: string;
  image?: { src: string; alt: string };
};

export const COURSES: CourseItem[] = [
  {
    tag: "Most chosen",
    highlight: true,
    title: "Complete Selection Batch",
    where: "Bhubaneswar campus, residential option",
    price: "Enquire",
    service: "army",
    desc: "Written exam, ground training and medical guidance in one routine. Built for aspirants who want to clear every stage in a single attempt.",
    features: [
      "Daily morning ground: 1.6 km runs, beam, long and high jump, ditch",
      "Classroom for GK, maths, reasoning, science, English and Odia",
      "Weekly full-length CBT mocks with negative marking",
      "Height, chest and medical pre-checks before the real board",
      "Document and form-filling support for every notification",
    ],
    cta: "Enquire about this batch",
  },
  {
    tag: "Written only",
    highlight: false,
    title: "CBT and Written Batch",
    where: "Offline and live online",
    price: "Enquire",
    service: "navy",
    desc: "Subject coaching and test series for SSC GD, Agniveer CEE, RRB, Navy SSR/MR, Air Force X/Y and Odisha Police written exams.",
    features: [
      "Exam-wise syllabus plans with weekly targets",
      "Previous papers solved in class, section by section",
      "Speed and accuracy drills against the real exam clock",
      "Doubt sessions after every class",
    ],
    cta: "Enquire about this batch",
  },
  {
    tag: "Ground only",
    highlight: false,
    title: "Physical Training Batch",
    where: "Early morning, on campus ground",
    price: "Enquire",
    service: "capf",
    desc: "For aspirants who have cleared the written exam and have weeks, not months, before PST and PET. Timed, measured, recorded every day.",
    features: [
      "Timed runs against your exam's cut-off, logged daily",
      "Beam (pull-up), long jump, high jump and 9-foot ditch technique",
      "Zig-zag balance and endurance conditioning",
      "Diet and recovery guidance from trainers",
    ],
    cta: "Enquire about this batch",
  },
];

/** The 7-stage recruitment journey (CMS key: journey). */
export type JourneyStage = {
  day: string;
  code: string;
  service: Tone;
  title: string;
  subtitle: string;
  brief: string;
  drill: string;
  tests: { name: string; detail: string }[];
};

export const DAYS: JourneyStage[] = [
  {
    day: "Apply",
    code: "APPLY",
    service: "odisha",
    title: "Notification and application",
    subtitle: "Most rejections happen before the exam even starts",
    brief:
      "Every recruitment opens with an official notification. Age is counted on a fixed date, photos and signatures have exact sizes, and category certificates must match the format asked. A small mistake in the form can cancel an otherwise strong candidate.",
    drill:
      "We read every notification with you, check your eligibility line by line, and help fill the form so it is right the first time.",
    tests: [
      { name: "Eligibility check", detail: "Age on the cut-off date, education, height and domicile" },
      { name: "Form filling", detail: "Photo, signature and certificate uploads in the exact format" },
      { name: "Fee and category", detail: "Correct category, fee exemption and relaxation claims" },
    ],
  },
  {
    day: "Written",
    code: "CBT",
    service: "navy",
    title: "Written exam (CBT / CEE)",
    subtitle: "Speed, accuracy and negative marking",
    brief:
      "Most forces now run a computer-based test. Questions cover general knowledge, maths, reasoning, science and language. Wrong answers cost marks, so knowing when to skip matters as much as knowing the answer.",
    drill:
      "Weekly full-length mocks on the real pattern, with section-wise analysis so you know exactly where marks are being lost.",
    tests: [
      { name: "General knowledge", detail: "Static GK, Odisha GK and current affairs" },
      { name: "Maths and reasoning", detail: "Arithmetic, number series, coding and puzzles" },
      { name: "Science and language", detail: "Class 10 and 12 science, English and Odia" },
    ],
  },
  {
    day: "PST",
    code: "PST",
    service: "capf",
    title: "Physical standard test",
    subtitle: "Height, chest and weight, measured on the spot",
    brief:
      "Height and chest are measured against the notification for your category and region. There is no second attempt on the day if you are short, so you must know your numbers well before the test.",
    drill:
      "We measure every aspirant on joining and every month after, and explain the relaxations that apply to your category and state.",
    tests: [
      { name: "Height", detail: "Measured barefoot against the category standard" },
      { name: "Chest", detail: "Unexpanded and expanded, minimum expansion required" },
      { name: "Weight", detail: "Proportionate to height and age" },
    ],
  },
  {
    day: "PET",
    code: "PET",
    service: "army",
    title: "Physical efficiency test",
    subtitle: "The stage that decides the most selections",
    brief:
      "Running is timed to the second. Army rallies add beam, 9-foot ditch and zig-zag balance; police and railway exams add long and high jump. Aspirants who fail here usually trained on the wrong distance or the wrong surface.",
    drill:
      "Six mornings a week on the ground. Every run is timed against your exam's cut-off and recorded, so progress is visible week by week.",
    tests: [
      { name: "Running", detail: "1.6 km, 5 km or 1000 m depending on the exam" },
      { name: "Beam and jumps", detail: "Pull-ups, long jump, high jump" },
      { name: "Ditch and balance", detail: "9-foot ditch and zig-zag balance" },
    ],
  },
  {
    day: "Documents",
    code: "DV",
    service: "railway",
    title: "Document verification",
    subtitle: "Every certificate checked against your form",
    brief:
      "Your originals are compared with what you filled in. Mismatched names, missing caste or domicile certificates, and expired NCC or sports certificates are the most common reasons candidates are stopped here.",
    drill:
      "A document checklist for your exam, reviewed with you before the notification closes, not after the result.",
    tests: [
      { name: "Education and age", detail: "Marksheets and birth certificate" },
      { name: "Category and domicile", detail: "Caste, residence and relaxation proofs" },
      { name: "Bonus certificates", detail: "NCC, sports and relation certificates" },
    ],
  },
  {
    day: "Medical",
    code: "MED",
    service: "airforce",
    title: "Medical examination",
    subtitle: "Eyes, teeth, feet and more",
    brief:
      "The medical board checks vision, hearing, teeth, feet, knees and general fitness. Many conditions are temporary and can be corrected in time if they are found early.",
    drill:
      "Pre-medical checks during training so there are no surprises, and guidance on the review and appeal process if you are declared unfit.",
    tests: [
      { name: "Vision", detail: "Distance vision and colour perception" },
      { name: "Physical", detail: "Flat foot, knock knees, varicocele, tattoos" },
      { name: "Appeal", detail: "Review and appeal medical boards" },
    ],
  },
  {
    day: "Merit",
    code: "MERIT",
    service: "odisha",
    title: "Merit list and joining",
    subtitle: "From result to training centre",
    brief:
      "Final selection is made on merit across stages. Selected candidates receive joining instructions and report to their training centre on a fixed date.",
    drill:
      "We help you read the merit list, prepare for joining and understand what training at your centre will ask of you.",
    tests: [
      { name: "Merit", detail: "Written marks plus PET marks where applicable" },
      { name: "Joining", detail: "Call letter, reporting date and documents" },
      { name: "Training", detail: "What the first weeks at the centre look like" },
    ],
  },
];

export const FAQS = [
  {
    q: "Which exams does Samantroy Academy prepare for?",
    a: "Army Agniveer (GD, Technical, Clerk, Tradesman), Navy Agniveer SSR and MR, Air Force Agniveervayu X and Y, SSC GD Constable for BSF, CRPF, CISF, ITBP, SSB and Assam Rifles, Odisha Police Constable and SI, RRB Group D, NTPC, ALP, RPF, and SSC MTS, CHSL and CGL. We also run officer-entry coaching for NDA, CDS and AFCAT.",
  },
  {
    q: "Do you train for both the written exam and the physical test?",
    a: "Yes. The Complete Selection Batch combines daily ground training with classroom coaching. If you have already cleared the written exam, the Physical Training Batch focuses only on PST and PET.",
  },
  {
    q: "I am a few centimetres short of the height requirement. Can I still apply?",
    a: "Possibly. Height standards differ by force, category and region, and ST candidates and some regions get relaxations. Use the Eligibility Finder or the Standards page, then talk to us so we can check the exact notification for you.",
  },
  {
    q: "Is there hostel accommodation?",
    a: "Residential seats are available for the offline batch on a first-come basis. Ask at enquiry for current availability and charges.",
  },
  {
    q: "Do you guarantee selection?",
    a: "No academy can honestly guarantee selection. What we guarantee is daily training measured against the real cut-offs, regular mocks, and honest feedback on where you stand.",
  },
  {
    q: "Can I join online?",
    a: "Written coaching is available as a live online batch with recordings. Physical training needs a ground, so it is offline only.",
  },
];

/** Exam names for the enquiry form, marquee and footer. Kept short on purpose. */
export const EXAM_OPTIONS: string[] = [
  "Army Agniveer GD",
  "Army Agniveer Technical",
  "Army Agniveer Clerk / SKT",
  "Army Agniveer Tradesman",
  "Navy Agniveer SSR",
  "Navy Agniveer MR",
  "Air Force Agniveervayu (X group)",
  "Air Force Agniveervayu (Y group)",
  "Coast Guard Navik / Yantrik",
  "SSC GD Constable (CAPF)",
  "SSC CPO (SI)",
  "Odisha Police Constable",
  "Odisha Police SI",
  "Odisha Forest Guard / Forester",
  "Odisha Fire Services",
  "OSSSC / OSSC posts",
  "RRB Group D",
  "RRB NTPC",
  "RRB ALP / Technician",
  "RPF Constable / SI",
  "SSC MTS / CHSL / CGL",
  "NDA / CDS / AFCAT",
  "Not sure yet",
];

/** Navigation. */
export type NavLink = { href: string; label: string; desc?: string };
export type NavGroup = { label: string; items: NavLink[] };
export type NavEntry = NavLink | NavGroup;

export const NAV: NavEntry[] = [
  { href: "/about", label: "About" },
  {
    label: "Exams",
    items: [
      { href: "/exams", label: "All exams", desc: "Every exam we prepare for, in one place" },
      { href: "/exams?vertical=armed-forces", label: "Army, Navy, Air Force", desc: "Agniveer, SSR, MR, X and Y group" },
      { href: "/exams?vertical=capf", label: "CAPF", desc: "SSC GD for BSF, CRPF, CISF, ITBP" },
      { href: "/exams?vertical=odisha", label: "Odisha State", desc: "Police, forest, fire, OSSSC" },
      { href: "/exams?vertical=railways", label: "Railways", desc: "Group D, NTPC, ALP, RPF" },
      { href: "/exams?vertical=officer", label: "Officer entries", desc: "NDA, CDS, AFCAT" },
    ],
  },
  {
    label: "Prepare",
    items: [
      { href: "/recruitment-process", label: "Recruitment process", desc: "Seven stages from form to joining" },
      { href: "/standards", label: "Physical standards", desc: "Height, chest, run timings, medical" },
      { href: "/eligibility", label: "Eligibility finder", desc: "Find the exams you qualify for" },
      { href: "/mock-tests", label: "Free mock tests", desc: "Timed practice with instant score" },
      { href: "/resources", label: "Notes and papers", desc: "Free PDFs and video lessons" },
      { href: "/training-centres", label: "Training centres", desc: "Where each force trains its recruits" },
    ],
  },
  { href: "/courses", label: "Courses" },
  {
    label: "Results",
    items: [
      { href: "/selected", label: "Wall of Selection", desc: "Our selected candidates" },
      { href: "/gallery", label: "Gallery", desc: "Ground, classroom and results" },
      { href: "/testimonials", label: "Testimonials", desc: "In their own words" },
    ],
  },
  { href: "/blog", label: "Blog" },
];

export const isNavGroup = (e: NavEntry): e is NavGroup => "items" in e;

/** Flat list for the footer. */
export const FOOTER_LINKS: NavLink[] = [
  { href: "/about", label: "About" },
  { href: "/courses", label: "Courses" },
  { href: "/exams", label: "Exams" },
  { href: "/recruitment-process", label: "Recruitment process" },
  { href: "/standards", label: "Physical standards" },
  { href: "/eligibility", label: "Eligibility finder" },
  { href: "/mock-tests", label: "Mock tests" },
  { href: "/resources", label: "Resources" },
  { href: "/selected", label: "Wall of Selection" },
  { href: "/gallery", label: "Gallery" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

/** YouTube ids for the video grid when the CMS has none. Empty hides it. */
export const YT_VIDEOS: string[] = [];

/** Card shape for why-us / values / gateway style repeaters. */
export type IconCard = { icon: IconKey | string; title: string; body: string };
