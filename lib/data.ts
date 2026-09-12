/**
 * Built-in content defaults. The public site renders these whenever the CMS
 * has no published value, so the site works before Supabase is configured.
 * Every value here is editable from /admin once the CMS is connected.
 *
 * Contact details come from the academy's own printed flyers (2026). Email
 * and office hours were not on them, so they ship blank and stay hidden
 * until the admin fills them in.
 *
 * SAMPLE CONTENT - see lib/sample-content.ts. Faculty, testimonials and the
 * Wall of Selection ship with clearly-labelled samples so the design can be
 * reviewed. They disappear as soon as real rows are added in the admin.
 */

import type { IconKey } from "@/lib/icons";

export const SITE = {
  name: "Samantroy Academy",
  /** Full name as printed on the academy's material. */
  legalName: "Samantroy Academy for Defence Career Studies",
  tagline: "Shaping Nation's Warriors",
  foundedYear: "2001",
  /** Person named against the main numbers on the flyer. */
  contactName: "Debesh Samantroy",
  phone1: "+91 98610 77371",
  phone1Href: "tel:+919861077371",
  // Second line: leave blank and the site hides it everywhere.
  phone2: "+91 90906 99770",
  phone2Href: "tel:+919090699770",
  /** More numbers from the flyer, comma separated. Shown on the Contact page. */
  helplines: "82499 62287, 94396 27247, 90902 05131, 98615 67963, 95838 54271, 88478 11094, 70777 77184",
  whatsapp: "https://wa.me/919861077371?text=Jai%20Hind!%20I%20want%20to%20know%20about%20Samantroy%20Academy%20batches.",
  email: "",
  address: "Gosaninuagaon, Sishu Mandir Road, 300 m left of Railway Station, Brahmapur, Ganjam, Odisha 760003",
  /** Opens the academy on Google Maps. Every address on the site links here.
   *  Replace with the academy's own Google Maps pin link when available. */
  mapUrl: "https://maps.google.com/maps?q=Samantroy%20Academy%2C%20Gosaninuagaon%2C%20Brahmapur%2C%20Odisha%20760003",
  instagram: "https://www.instagram.com/samantroyacademy07/",
  youtube: "https://www.youtube.com/@samantroyacademy5722",
  telegram: "",
  facebook: "https://www.facebook.com/p/Samantroy-Academy-Brahmapur-100057121733570/",
  url: "https://www.samantroyacademy.com",
  brochure: "",
  /** "off" hides the download and sends those links to the contact page. */
  brochureEnabled: "off",
  enrollOffline: "",
  enrollOnline: "",
  officeHours: "",
};

/** Where the academy is, for structured data and local search. Coordinates
 *  are Brahmapur railway station (the academy is 300 m from it); refine them
 *  from the academy's Google Maps pin. */
export const LOCATION = {
  streetAddress: "Gosaninuagaon, Sishu Mandir Road, 300 m left of Railway Station",
  locality: "Brahmapur",
  altLocality: "Berhampur",
  district: "Ganjam",
  region: "Odisha",
  regionCode: "IN-OR",
  postalCode: "760003",
  country: "IN",
  lat: 19.2968,
  lng: 84.7974,
};

/** Batch cadence shown on the Courses page. */
export const BATCH_INFO = {
  offline:
    "Admissions are on at the Brahmapur centre, 300 m from the railway station. Join after +2 (Science, Commerce or Arts) or after graduation. Batch dates are confirmed at enrolment.",
  online:
    "Ask about live online classes for the written exam. The next start date is shared on enrolment or over WhatsApp.",
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
 *  4000+ recruitments and "since 2001" are the academy's own published
 *  figures (printed flyers). */
export type Stat = { value: number; label: string; suffix?: string };
export const STATS: Stat[] = [
  { value: 4000, label: "Recruitments", suffix: "+" },
  { value: 2001, label: "Training aspirants since", suffix: "" },
  { value: 14, label: "Recruiting boards we coach for", suffix: "+" },
  { value: 3, label: "Streams welcome: Science, Commerce, Arts", suffix: "" },
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
    tag: "Army, Navy, Air Force",
    highlight: true,
    title: "Defence Careers Batch",
    where: "Brahmapur centre, near the railway station",
    price: "Enquire",
    service: "army",
    desc: "For every Army, Navy and Air Force entry, from Agniveer to officer. Written exam coaching with physical test and medical preparation.",
    features: [
      "Army GD, Technical and Non-Technical",
      "Navy SSR, MR and AA; Air Force X and Y group",
      "Officer entries: NDA, NA, TES, CDS, AFCAT and NCC",
      "Physical test and medical standards prepared early",
      "New batches: NDA from 21 September, CDS from 14 October",
    ],
    cta: "Enquire about this batch",
  },
  {
    tag: "Police and CAPF",
    highlight: false,
    title: "Police and CAPF Batch",
    where: "Brahmapur centre, offline",
    price: "Enquire",
    service: "capf",
    desc: "SSC GD for BSF, CRPF, CISF, ITBP and SSB, plus Odisha Police Constable and SI. The written exam and the physical test, prepared together.",
    features: [
      "SSC GD Constable: BSF, CRPF, CISF, ITBP, SSB",
      "Odisha Police Constable and Sub-Inspector (SI)",
      "Odia and Odisha GK for state exams",
      "Height, chest and running standards checked early",
      "Form filling and document checks for every notification",
    ],
    cta: "Enquire about this batch",
  },
  {
    tag: "Bank, Railway, SSC",
    highlight: false,
    title: "Bank, Railway and SSC Batch",
    where: "Brahmapur centre, offline",
    price: "Enquire",
    service: "railway",
    desc: "Written exam coaching for bank, railway, SSC and Odisha government jobs. Open to +2 and graduate students from every stream.",
    features: [
      "Bank PO and Clerk (IBPS, SBI)",
      "Railway (RRB) and SSC CGL",
      "OSSC, OSSSC, OPSC and ASO",
      "Quantitative aptitude, reasoning, English and GK",
      "Join after +2 Science, Commerce or Arts, or after graduation",
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
    q: "Where is Samantroy Academy?",
    a: "Samantroy Academy is at Gosaninuagaon, Sishu Mandir Road, 300 m left of the railway station in Brahmapur (Berhampur), Ganjam, Odisha 760003. Call Debesh Samantroy on 98610 77371 or 90906 99770.",
  },
  {
    q: "Which exams does Samantroy Academy coach for?",
    a: "Army (GD, Technical and Non-Technical), Navy SSR, MR and AA, Air Force X and Y group, SSC GD for BSF, CRPF, CISF, ITBP and SSB, Odisha Police Constable and SI, OSSC, OSSSC, OPSC and ASO, Bank PO and Clerk, Railway (RRB) and SSC CGL. Officer entries too: NDA, NA, TES, CDS, AFCAT and NCC.",
  },
  {
    q: "Can Arts and Commerce students join the Army, Navy or Air Force?",
    a: "Yes. Arts and Commerce students are eligible for Air Force Y group, Navy MR, Army GD and SSC GD. Science students with Physics and Maths can also apply for Navy SSR, Air Force X group and Army Technical.",
  },
  {
    q: "When can I join, and when do new batches start?",
    a: "Admissions are on. You can join after +2 (Science, Commerce or Arts) or after graduation. The next NDA batch starts on 21 September and the CDS batch on 14 October.",
  },
  {
    q: "How long has Samantroy Academy been running?",
    a: "Since 2001. The academy marks its 25th anniversary in 2026, with 4000+ recruitments across the Army, Navy, Air Force, CAPF, Odisha Police, bank, railway and Odisha government jobs.",
  },
  {
    q: "Do you coach for officer entries like NDA, CDS and AFCAT?",
    a: "Yes: NDA, NA, TES, CDS, AFCAT and NCC special entry. Recent officer results include AFCAT All India Rank 183 and Army ACC All India Rank 26.",
  },
  {
    q: "I live outside Brahmapur. Can I still join?",
    a: "Yes. Our selected candidates come from across Ganjam, Gajapati, Kandhamal, Khordha, Puri, Cuttack, Nayagarh and beyond. Call the academy and we will help with accommodation near the centre.",
  },
  {
    q: "I am a few centimetres short of the height requirement. Can I still apply?",
    a: "Possibly. Height standards differ by force, category and region, and ST candidates and some regions get relaxations. Use the Eligibility Finder or the Standards page, then talk to us so we can check the exact notification for you.",
  },
  {
    q: "Do you guarantee selection?",
    a: "No academy can honestly guarantee selection. What we promise is regular practice against the real exam pattern and cut-offs, and honest feedback on where you stand.",
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
  "SSC GD Constable (BSF, CRPF, CISF, ITBP, SSB)",
  "SSC CPO (SI)",
  "Odisha Police Constable",
  "Odisha Police SI",
  "Odisha Forest Guard / Forester",
  "Odisha Fire Services",
  "OSSC / OSSSC posts",
  "OPSC (OCS / ASO)",
  "Bank PO",
  "Bank Clerk",
  "RRB Group D",
  "RRB NTPC",
  "RRB ALP / Technician",
  "RPF Constable / SI",
  "SSC MTS / CHSL / CGL",
  "NDA / NA / TES",
  "CDS / AFCAT / NCC",
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
      { href: "/exams?vertical=capf", label: "CAPF", desc: "SSC GD for BSF, CRPF, CISF, ITBP, SSB" },
      { href: "/exams?vertical=odisha", label: "Odisha State", desc: "Police, SI, OSSC, OSSSC, OPSC, ASO" },
      { href: "/exams?vertical=ssc", label: "Bank and SSC", desc: "Bank PO and Clerk, SSC CGL" },
      { href: "/exams?vertical=railways", label: "Railways", desc: "Group D, NTPC, ALP, RPF" },
      { href: "/exams?vertical=officer", label: "Officer entries", desc: "NDA, TES, CDS, AFCAT, NCC" },
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

/** Videos from the academy's YouTube channel (@samantroyacademy5722), shown
 *  when the admin has not added any under Resources. Empty hides the grid. */
export const YT_VIDEOS: { id: string; title: string }[] = [
  { id: "2Yg0zmBFLjg", title: "111 Agniveer result: media coverage" },
  { id: "nKzzvRBmbRA", title: "Girl achievers of Samantroy Academy" },
  { id: "AzsAL1HXlFI", title: "Career in defence" },
  { id: "CfCZgce2GFQ", title: "Officer Like Qualities, by Debesh Sir" },
  { id: "-ELEa1kWDRo", title: "Kargil Vijay Diwas blood donation camp" },
  { id: "rVctl7bJ6ns", title: "Current affairs, 6 to 12 February" },
];

/** Card shape for why-us / values / gateway style repeaters. */
export type IconCard = { icon: IconKey | string; title: string; body: string };
