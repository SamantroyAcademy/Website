import Link from "@/components/ui/Link";

export const dynamic = "force-dynamic";

type Item = { label: string; href: string; hint?: string };
type Page = { name: string; view?: string; items: Item[] };

// Every page, broken into its editable sections (each links to its own editor).
const PAGES: Page[] = [
  {
    name: "Home", view: "/",
    items: [
      { label: "Section Order", href: "/admin/homepage", hint: "Show, hide and reorder sections" },
      { label: "Hero", href: "/admin/sections/hero", hint: "Headline, badge, intro, buttons" },
      { label: "Hero Showcase", href: "/admin/hero-showcase", hint: "Rotating photos + captions" },
      { label: "Exams Marquee", href: "/admin/sections/exam_counts", hint: "Exam names + optional counts" },
      { label: "Top Rank Cards", href: "/admin/toppers", hint: "Result cards" },
      { label: "Top Rank Cards (heading)", href: "/admin/sections/heading.toppers" },
      { label: "Wall of Selection", href: "/admin/candidates", hint: "Selected candidate tiles" },
      { label: "Wall (heading)", href: "/admin/sections/heading.wall" },
      { label: "Course Cards", href: "/admin/courses", hint: "Batches, prices, links" },
      { label: "Courses (heading)", href: "/admin/sections/heading.courses" },
      { label: "Courses (facilities note)", href: "/admin/sections/courses_note" },
      { label: "Course Prices", href: "/admin/sections/courses_options", hint: "Show or hide prices" },
      { label: "Campus Gallery", href: "/admin/campus" },
      { label: "Campus (heading)", href: "/admin/sections/heading.campus" },
      { label: "Study Material", href: "/admin/sections/books", hint: "Books and notes cards" },
      { label: "Study Material (heading)", href: "/admin/sections/heading.books" },
      { label: "Faculty", href: "/admin/mentors" },
      { label: "Faculty (heading)", href: "/admin/sections/heading.mentors" },
      { label: "Six Verticals", href: "/admin/verticals", hint: "Cards, photos, exam chips" },
      { label: "Why Samantroy (heading)", href: "/admin/sections/whyus" },
      { label: "Why Samantroy (cards)", href: "/admin/sections/whyus_items" },
      { label: "Countdown", href: "/admin/countdown", hint: "Batch and exam dates" },
      { label: "Scoreboard", href: "/admin/stats" },
      { label: "Scoreboard (heading)", href: "/admin/sections/heading.stats" },
      { label: "Recent Wins", href: "/admin/sections/recent_wins" },
      { label: "Selection Tracker", href: "/admin/selections" },
      { label: "Selection Tracker (copy)", href: "/admin/sections/selection_tracker" },
      { label: "Recruitment Journey", href: "/admin/sections/journey", hint: "The seven stages" },
      { label: "Now Serving", href: "/admin/officer-banners" },
      { label: "Now Serving (heading)", href: "/admin/sections/heading.officer_banners" },
      { label: "YouTube Videos", href: "/admin/resources", hint: "Same list as Resources" },
      { label: "Videos (heading)", href: "/admin/sections/heading.videos" },
      { label: "Google Reviews", href: "/admin/google-reviews" },
      { label: "Google Reviews (heading)", href: "/admin/sections/heading.google_reviews" },
      { label: "Testimonials", href: "/admin/testimonials" },
      { label: "Testimonials (heading)", href: "/admin/sections/heading.testimonials" },
      { label: "Social (heading)", href: "/admin/sections/heading.instagram" },
      { label: "FAQs", href: "/admin/faqs" },
      { label: "FAQs (heading)", href: "/admin/sections/heading.faq" },
      { label: "CTA Banner", href: "/admin/sections/cta" },
    ],
  },
  { name: "About", view: "/about", items: [
    { label: "Page Hero", href: "/admin/sections/pagehero.about" },
    { label: "Mission", href: "/admin/sections/about_mission", hint: "Intro block + photo" },
    { label: "Why Aspirants Fail", href: "/admin/sections/story" },
    { label: "Why Aspirants Fail (cards)", href: "/admin/sections/story_gaps" },
    { label: "Core Values", href: "/admin/sections/about_values", hint: "Three value cards" },
  ] },
  { name: "Recruitment Process", view: "/recruitment-process", items: [
    { label: "Page Hero", href: "/admin/sections/pagehero.recruitment-process" },
    { label: "Intro", href: "/admin/sections/journey_intro" },
    { label: "Journey Timeline", href: "/admin/sections/journey", hint: "The seven stages" },
  ] },
  { name: "Exams", view: "/exams", items: [
    { label: "Page Hero", href: "/admin/sections/pagehero.exams" },
    { label: "Where Do You Stand", href: "/admin/sections/gateways" },
    { label: "Exams Catalogue", href: "/admin/exams", hint: "Every exam + detail pages" },
  ] },
  { name: "Physical Standards", view: "/standards", items: [
    { label: "Page Hero", href: "/admin/sections/pagehero.standards" },
    { label: "Page Content", href: "/admin/sections/standards", hint: "Stages, medical, appeal, FAQs" },
    { label: "Standards Tables", href: "/admin/standards", hint: "Height, chest, run times" },
  ] },
  { name: "Training Centres", view: "/training-centres", items: [
    { label: "Page Hero", href: "/admin/sections/pagehero.training-centres" },
    { label: "Centres", href: "/admin/sections/centres", hint: "Each centre, courses and photos" },
  ] },
  { name: "Courses", view: "/courses", items: [
    { label: "Page Hero", href: "/admin/sections/pagehero.courses" },
    { label: "Course Cards", href: "/admin/courses" },
  ] },
  { name: "Eligibility Finder", view: "/eligibility", items: [{ label: "Page Hero", href: "/admin/sections/pagehero.eligibility" }] },
  { name: "Mock Tests", view: "/mock-tests", items: [{ label: "Page Hero", href: "/admin/sections/pagehero.mock-tests" }, { label: "Questions", href: "/admin/mock-tests" }] },
  { name: "Resources", view: "/resources", items: [{ label: "Page Hero", href: "/admin/sections/pagehero.resources" }, { label: "Files and Videos", href: "/admin/resources" }] },
  { name: "Gallery", view: "/gallery", items: [{ label: "Page Hero", href: "/admin/sections/pagehero.gallery" }] },
  { name: "Wall of Selection", view: "/selected", items: [{ label: "Page Hero", href: "/admin/sections/pagehero.selected" }, { label: "Candidates", href: "/admin/candidates" }] },
  { name: "Blog", view: "/blog", items: [{ label: "Page Hero", href: "/admin/sections/pagehero.blog" }, { label: "Articles", href: "/admin/blog" }] },
  { name: "Testimonials", view: "/testimonials", items: [{ label: "Page Hero", href: "/admin/sections/pagehero.testimonials" }, { label: "Testimonials", href: "/admin/testimonials" }] },
  { name: "Contact", view: "/contact", items: [{ label: "Page Hero", href: "/admin/sections/pagehero.contact" }, { label: "Enquiry Form", href: "/admin/contact-form" }, { label: "Footer and Contact", href: "/admin/settings" }] },
  { name: "Site-wide", items: [
    { label: "Footer and Contact", href: "/admin/settings" },
    { label: "SEO (all pages)", href: "/admin/seo" },
    { label: "Media Library", href: "/admin/media" },
    { label: "Intro Screen", href: "/admin/sections/preloader", hint: "Intro animation on/off" },
    { label: "Enquiry Popup", href: "/admin/sections/enquiry_popup", hint: "Popup text and delay" },
  ] },
];

export default function SectionsHub() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Pages &amp; Sections</h1>
      <p className="mt-1 text-sm text-slate-500">
        Every page and its editable sections. Pick a section to edit its text, images, tags and buttons, with a draft preview before you publish.
      </p>

      <div className="mt-6 space-y-6">
        {PAGES.map((p) => (
          <div key={p.name} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">{p.name}</h2>
              {p.view && <Link href={p.view} target="_blank" className="text-xs font-medium text-brand-600 hover:underline">View page</Link>}
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {p.items.map((it) => (
                <Link key={it.href + it.label} href={it.href}
                  className="group flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 transition hover:border-brand-300 hover:bg-brand-50">
                  <span>
                    <span className="block text-sm font-semibold text-slate-800">{it.label}</span>
                    {it.hint && <span className="block text-xs text-slate-400">{it.hint}</span>}
                  </span>
                  <span className="text-slate-300 transition group-hover:text-brand-500" aria-hidden>&rarr;</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
