import { SECTION_DEFAULTS } from "@/lib/section-defaults";
import { PAGE_HEROES } from "@/lib/pagehero-defaults";
import { ICON_OPTIONS } from "@/lib/icons";
import { TONE_OPTIONS } from "@/lib/data";

export type FieldType = "text" | "rich" | "image" | "tags" | "repeater" | "select";
export type SectionField = {
  key: string;
  label: string;
  type: FieldType;
  itemFields?: SectionField[]; // for repeater
  itemLabel?: string; // singular noun for repeater items
  options?: { value: string; label: string }[]; // for select
};

/** Reusable kicker font-size picker. */
export const KICKER_SIZE_FIELD: SectionField = {
  key: "kickerSize",
  label: "Kicker font size",
  type: "select",
  options: [
    { value: "xs", label: "Extra small" },
    { value: "sm", label: "Small" },
    { value: "md", label: "Default" },
    { value: "lg", label: "Large" },
    { value: "xl", label: "Extra large" },
  ],
};

/** Card icons are picked from the icon registry (no emoji). */
const ICON_FIELD: SectionField = { key: "icon", label: "Icon", type: "select", options: ICON_OPTIONS };
const TONE_FIELD: SectionField = { key: "service", label: "Colour theme", type: "select", options: TONE_OPTIONS };
const ONOFF = [{ value: "on", label: "On" }, { value: "off", label: "Off" }];

export type SectionDef = {
  key: string;
  label: string;
  page: string;
  description: string;
  previewPath: string;
  fields: SectionField[];
};

const HERO_FIELDS: SectionField[] = [
  { key: "kicker", label: "Kicker (small line above the title, optional)", type: "text" },
  KICKER_SIZE_FIELD,
  { key: "title", label: 'Title (HTML allowed, e.g. <span class="hl">Word</span>)', type: "text" },
  { key: "subtitle", label: "Subtitle", type: "text" },
  { key: "image", label: "Background image", type: "image" },
  { key: "crumb", label: "Breadcrumb label", type: "text" },
];

const PAGE_LABEL: Record<string, string> = {
  about: "About", "recruitment-process": "Recruitment Process", exams: "Exams",
  standards: "Physical Standards", "training-centres": "Training Centres", courses: "Courses",
  eligibility: "Eligibility Finder", "mock-tests": "Mock Tests", resources: "Resources",
  gallery: "Gallery", selected: "Wall of Selection", blog: "Blog",
  testimonials: "Testimonials", contact: "Contact",
};

// One editable hero per interior page.
const PAGE_HERO_SECTIONS: SectionDef[] = Object.keys(PAGE_HEROES).map((k) => ({
  key: `pagehero.${k}`,
  label: "Page Hero",
  page: PAGE_LABEL[k] ?? k,
  description: "The banner at the top of the page: kicker, title, subtitle and background image.",
  previewPath: `/${k}`,
  fields: HERO_FIELDS,
}));

/** Every homepage section heading is editable under `heading.<key>`. */
export const HEADING_KEYS: { key: string; label: string }[] = [
  { key: "wall", label: "Wall of Selection" },
  { key: "shorts", label: "Success Stories" },
  { key: "toppers", label: "Result Posters" },
  { key: "courses", label: "Courses" },
  { key: "campus", label: "Campus Gallery" },
  { key: "books", label: "Study Material" },
  { key: "mentors", label: "Faculty" },
  { key: "stats", label: "Scoreboard" },
  { key: "testimonials", label: "Testimonials" },
  { key: "videos", label: "Educational Videos" },
  { key: "google_reviews", label: "Google Reviews" },
  { key: "instagram", label: "Social" },
  { key: "officer_banners", label: "Now Serving" },
  { key: "faq", label: "FAQs" },
];

const HEADING_SECTIONS: SectionDef[] = HEADING_KEYS.map((h) => ({
  key: `heading.${h.key}`,
  label: `${h.label} (heading)`,
  page: "Home",
  description: "Kicker, title and subtitle for this section. Leave the kicker blank to hide it.",
  previewPath: "/",
  fields: [
    { key: "kicker", label: "Kicker (optional)", type: "text" },
    KICKER_SIZE_FIELD,
    { key: "title", label: "Title (HTML allowed)", type: "text" },
    { key: "subtitle", label: "Subtitle", type: "text" },
  ],
}));

/** Editable page sections backed by `site_content` documents. */
export const SECTIONS: SectionDef[] = [
  {
    key: "hero", label: "Hero", page: "Home",
    description: "Every text in the homepage hero: badge, both heading lines, the animated words, paragraph and both buttons.",
    previewPath: "/",
    fields: [
      { key: "badge", label: "Badge (small line above the heading)", type: "text" },
      { key: "headingLine1", label: "Heading, line 1", type: "text" },
      { key: "headingLine2", label: "Heading, line 2", type: "text" },
      { key: "typedPrefix", label: 'Animated line, fixed start (e.g. "Become ")', type: "text" },
      { key: "typedWords", label: "Animated line, rotating words (comma-separated)", type: "tags" },
      { key: "paragraph", label: "Intro paragraph", type: "rich" },
      { key: "rating", label: "Rating line (optional, HTML allowed)", type: "text" },
      { key: "primaryCta", label: "Primary button, label", type: "text" },
      { key: "primaryCtaHref", label: "Primary button, link", type: "text" },
      { key: "secondaryCta", label: "Secondary button, label", type: "text" },
      { key: "secondaryCtaHref", label: "Secondary button, link", type: "text" },
    ],
  },
  {
    key: "courses_options", label: "Course Prices", page: "Home",
    description: "Show or hide the price on every course card, on the homepage and the Courses page at once.",
    previewPath: "/courses",
    fields: [{
      key: "showPrices", label: "Course prices", type: "select",
      options: [
        { value: "on", label: "Show prices on the course cards" },
        { value: "off", label: "Hide prices, show 'Enquire for fees'" },
      ],
    }],
  },
  {
    key: "selection_tracker", label: "Selection Tracker", page: "Home",
    description: "The results block: heading, the three number cards and the bar-chart title. Leave a number override blank to count it from the Selection Tracker rows.",
    previewPath: "/",
    fields: [
      { key: "kicker", label: "Kicker", type: "text" },
      { key: "heading", label: "Heading", type: "text" },
      { key: "subtitle", label: "Line under the heading", type: "text" },
      { key: "totalLabel", label: "Card 1, label", type: "text" },
      { key: "totalOverride", label: "Card 1, number override (blank = auto)", type: "text" },
      { key: "yearsLabel", label: "Card 2, label", type: "text" },
      { key: "yearsOverride", label: "Card 2, number override (blank = auto)", type: "text" },
      { key: "centresLabel", label: "Card 3, label", type: "text" },
      { key: "centresOverride", label: "Card 3, number override (blank = auto)", type: "text" },
      { key: "barsHeading", label: "Bar chart heading", type: "text" },
    ],
  },
  {
    key: "story", label: "Why Aspirants Fail", page: "About",
    description: "The 'most aspirants fail the ground' story block on the About page.",
    previewPath: "/about",
    fields: [
      { key: "kicker", label: "Kicker (optional)", type: "text" },
      KICKER_SIZE_FIELD,
      { key: "title", label: "Title (word-art supported)", type: "rich" },
      { key: "paragraph", label: "Paragraph", type: "rich" },
    ],
  },
  {
    key: "story_gaps", label: "Why Aspirants Fail (cards)", page: "About",
    description: "The three gap cards (icon, title and text).",
    previewPath: "/about",
    fields: [{ key: "items", label: "Cards", type: "repeater", itemLabel: "Card", itemFields: [
      ICON_FIELD,
      { key: "title", label: "Title", type: "text" },
      { key: "body", label: "Body", type: "rich" },
    ] }],
  },
  {
    key: "recent_wins", label: "Recent Wins", page: "Home",
    description: "Short result lines that rotate under the scoreboard. Leave empty to hide.",
    previewPath: "/",
    fields: [{ key: "items", label: "Lines", type: "repeater", itemLabel: "Line", itemFields: [
      { key: "text", label: "Line text", type: "text" },
    ] }],
  },
  {
    key: "preloader", label: "Intro Screen", page: "Site-wide",
    description: "The short intro shown when the site first opens.",
    previewPath: "/",
    fields: [{
      key: "lottie", label: "Intro animation", type: "select",
      options: [
        { value: "on", label: "On, play the intro animation" },
        { value: "off", label: "Off, open the site straight away" },
      ],
    }],
  },
  {
    key: "whyus", label: "Why Samantroy (heading)", page: "Home",
    description: "Heading for the 'Why aspirants choose Samantroy' section.",
    previewPath: "/",
    fields: [
      { key: "kicker", label: "Kicker (optional)", type: "text" },
      KICKER_SIZE_FIELD,
      { key: "title", label: "Title (word-art supported)", type: "rich" },
      { key: "subtitle", label: "Subtitle", type: "rich" },
    ],
  },
  {
    key: "whyus_items", label: "Why Samantroy (cards)", page: "Home",
    description: "The six reasons shown in the Why Samantroy section.", previewPath: "/",
    fields: [{ key: "items", label: "Cards", type: "repeater", itemLabel: "Card", itemFields: [
      ICON_FIELD,
      { key: "title", label: "Title", type: "text" },
      { key: "body", label: "Body", type: "rich" },
    ] }],
  },
  {
    key: "cta", label: "Call-to-Action Banner", page: "Site-wide",
    description: "The closing banner above the footer (appears on most pages).",
    previewPath: "/",
    fields: [
      { key: "eyebrow", label: "Top line", type: "text" },
      { key: "title", label: "Title (word-art supported)", type: "rich" },
      { key: "paragraph", label: "Paragraph", type: "rich" },
    ],
  },
  {
    key: "journey", label: "Recruitment Journey", page: "Home",
    description: "The seven-stage recruitment timeline (also on the Recruitment Process page).", previewPath: "/",
    fields: [{ key: "items", label: "Stages", type: "repeater", itemLabel: "Stage", itemFields: [
      { key: "day", label: "Stage name (e.g. Apply, Written, PST)", type: "text" },
      { key: "code", label: "Short code (e.g. APPLY, CBT, PET)", type: "text" },
      TONE_FIELD,
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "brief", label: "What happens", type: "rich" },
      { key: "drill", label: "How we prepare you", type: "rich" },
      { key: "tests", label: "Checks at this stage", type: "repeater", itemLabel: "Check", itemFields: [
        { key: "name", label: "Name", type: "text" },
        { key: "detail", label: "Detail", type: "text" },
      ] },
    ] }],
  },
  {
    key: "journey_intro", label: "Recruitment Process (intro)", page: "Recruitment Process",
    description: "The paragraph at the top of the Recruitment Process page.",
    previewPath: "/recruitment-process",
    fields: [{ key: "text", label: "Intro", type: "rich" }],
  },
  {
    key: "about_mission", label: "Mission", page: "About",
    description: "The main intro block on the About page.", previewPath: "/about",
    fields: [
      { key: "kicker", label: "Kicker (optional)", type: "text" },
      KICKER_SIZE_FIELD,
      { key: "title", label: "Title (HTML allowed)", type: "text" },
      { key: "body", label: "Body paragraphs", type: "rich" },
      { key: "image", label: "Photo", type: "image" },
    ],
  },
  {
    key: "about_values", label: "Core Values", page: "About",
    description: "The three value cards.", previewPath: "/about",
    fields: [{ key: "items", label: "Values", type: "repeater", itemLabel: "Value", itemFields: [
      ICON_FIELD,
      { key: "title", label: "Title", type: "text" },
      { key: "body", label: "Body", type: "text" },
    ] }],
  },
  {
    key: "gateways", label: "Where Do You Stand", page: "Exams",
    description: "The 'After 10th / After 12th / After graduation' cards on the Exams page.", previewPath: "/exams",
    fields: [{ key: "items", label: "Gateways", type: "repeater", itemLabel: "Gateway", itemFields: [
      ICON_FIELD,
      { key: "title", label: "Title", type: "text" },
      { key: "body", label: "Body", type: "rich" },
      { key: "tags", label: "Exam chips", type: "tags" },
    ] }],
  },
  {
    key: "centres", label: "Training Centres", page: "Training Centres",
    description: "Heading plus every training centre: photo, motto, intro, course table and highlights.",
    previewPath: "/training-centres",
    fields: [
      { key: "kicker", label: "Kicker (optional)", type: "text" },
      KICKER_SIZE_FIELD,
      { key: "title", label: "Title (HTML allowed)", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "items", label: "Centres", type: "repeater", itemLabel: "Centre", itemFields: [
        { key: "short", label: "Short name", type: "text" },
        { key: "name", label: "Full name", type: "text" },
        { key: "motto", label: "Line under the name", type: "text" },
        { key: "location", label: "Location", type: "text" },
        { key: "service", label: "Force and entries", type: "text" },
        { key: "established", label: "Established (optional)", type: "text" },
        { key: "image", label: "Photo", type: "image" },
        { key: "intro", label: "Introduction", type: "rich" },
        { key: "courses", label: "Training courses", type: "repeater", itemLabel: "Course", itemFields: [
          { key: "name", label: "Course", type: "text" },
          { key: "duration", label: "Duration", type: "text" },
          { key: "who", label: "Who trains here", type: "text" },
        ] },
        { key: "highlights", label: "Highlights", type: "tags" },
      ] },
    ],
  },
  {
    key: "standards", label: "Standards Page Content", page: "Physical Standards",
    description: "The copy around the standards tables: stages, medical standards, common rejections, appeal and FAQs. The height/chest/run numbers are edited under Physical Standards.",
    previewPath: "/standards",
    fields: [
      { key: "kicker", label: "Kicker (optional)", type: "text" },
      KICKER_SIZE_FIELD,
      { key: "processTitle", label: "Process heading", type: "text" },
      { key: "processIntro", label: "Process intro", type: "text" },
      { key: "stages", label: "Stages", type: "repeater", itemLabel: "Stage", itemFields: [
        ICON_FIELD,
        { key: "step", label: "Short label (e.g. PST)", type: "text" },
        { key: "title", label: "Title", type: "text" },
        { key: "detail", label: "Detail", type: "rich" },
      ] },
      { key: "image1", label: "Photo 1", type: "image" },
      { key: "image2", label: "Photo 2", type: "image" },
      { key: "standardsTitle", label: "Tables heading", type: "text" },
      { key: "standardsIntro", label: "Tables intro", type: "text" },
      { key: "verifiedOn", label: "Accuracy note shown above the tables", type: "text" },
      { key: "medical", label: "Medical standards", type: "repeater", itemLabel: "Row", itemFields: [
        { key: "area", label: "Area", type: "text" },
        { key: "requirement", label: "Requirement", type: "text" },
        { key: "notes", label: "Notes", type: "text" },
      ] },
      { key: "commonTitle", label: "Common rejections heading", type: "text" },
      { key: "common", label: "Common rejection reasons", type: "tags" },
      { key: "appealTitle", label: "Appeal heading", type: "text" },
      { key: "appealBody", label: "Appeal explanation", type: "rich" },
      { key: "faqs", label: "FAQs", type: "repeater", itemLabel: "FAQ", itemFields: [
        { key: "q", label: "Question", type: "text" },
        { key: "a", label: "Answer", type: "rich" },
      ] },
    ],
  },
  {
    key: "exam_counts", label: "Exams Marquee", page: "Home",
    description: "Exams shown in the scrolling band. Add a count only if it is a real, verified number; leave blank to show the exam name alone.",
    previewPath: "/",
    fields: [{ key: "items", label: "Exams", type: "repeater", itemLabel: "Exam", itemFields: [
      { key: "entry", label: "Exam name", type: "text" },
      { key: "count", label: "Selected count (optional)", type: "text" },
    ] }],
  },
  {
    key: "courses_note", label: "Courses (facilities note)", page: "Home",
    description: "The line under the course cards about hostel and facilities.",
    previewPath: "/",
    fields: [{ key: "text", label: "Note", type: "rich" }],
  },
  {
    key: "books", label: "Study Material", page: "Home",
    description: "Books and study material cards. Leave empty to hide the section.",
    previewPath: "/",
    fields: [{ key: "items", label: "Books", type: "repeater", itemLabel: "Book", itemFields: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "author", label: "Author", type: "text" },
      { key: "publisher", label: "Publisher", type: "text" },
      { key: "edition", label: "Edition", type: "text" },
      { key: "blurb", label: "Description", type: "rich" },
      { key: "cover", label: "Cover", type: "image" },
      { key: "buyUrl", label: "Buy link", type: "text" },
    ] }],
  },
  {
    key: "enquiry_popup", label: "Enquiry Popup", page: "Site-wide",
    description: "The pop-up that greets visitors shortly after the site loads (once per visit).",
    previewPath: "/",
    fields: [
      { key: "enabled", label: "Show the popup", type: "select", options: ONOFF },
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Sub-line", type: "text" },
      { key: "body", label: "Message", type: "rich" },
      { key: "delayMs", label: "Delay before it opens (milliseconds)", type: "text" },
    ],
  },
  ...HEADING_SECTIONS,
  ...PAGE_HERO_SECTIONS,
];

export const getSection = (key: string) => SECTIONS.find((s) => s.key === key);
export const sectionDefaults = (key: string): Record<string, unknown> => SECTION_DEFAULTS[key] ?? {};
