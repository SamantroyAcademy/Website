import { PlusIcon, WhatsappLogoIcon } from "@phosphor-icons/react/ssr";
import { getFaqs, type Faq } from "@/lib/public-data";
import { getSettings } from "@/lib/content";
import CmsSectionHeading from "@/components/ui/CmsSectionHeading";
import OpenEnquiry from "@/components/site/OpenEnquiry";

/** Accordion built on native <details>: works without JavaScript, keyboard
 *  and screen-reader friendly by default. */
export function FaqList({ items }: { items: Faq[] }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((f, i) => (
        <details key={(f.id ?? f.question) + i} className="group py-1" data-reveal>
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-left [&::-webkit-details-marker]:hidden">
            <span className="font-display text-lg font-bold leading-snug tracking-tight text-ink sm:text-xl">{f.question}</span>
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-tint text-ink transition-transform duration-300 group-open:rotate-45">
              <PlusIcon size={16} weight="bold" />
            </span>
          </summary>
          <div className="rich-html max-w-[65ch] pb-6 pr-12 leading-relaxed text-ink-2" dangerouslySetInnerHTML={{ __html: f.answer }} />
        </details>
      ))}
    </div>
  );
}

const plain = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

/** FAQPage structured data from the same questions the page shows, so search
 *  engines and AI answer engines can quote them directly. */
export function FaqJsonLd({ items }: { items: Faq[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: plain(f.question),
      acceptedAnswer: { "@type": "Answer", text: plain(f.answer) },
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

/** FAQs (CMS: faqs). Split: heading and a direct line on the left, answers
 *  on the right. */
export default async function FaqSection() {
  const [items, s] = await Promise.all([getFaqs(), getSettings()]);
  if (!items.length) return null;
  return (
    <section id="faq" className="section-y" aria-label="Frequently asked questions">
      <FaqJsonLd items={items} />
      <div className="container-x grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <CmsSectionHeading sectionKey="faq" />
            <div className="mt-8 rounded-[var(--radius-card)] bg-brand-50 p-6" data-reveal>
              <p className="font-semibold text-ink">Question not here?</p>
              <p className="mt-1 text-sm text-ink-2">A trainer answers on WhatsApp, usually the same day.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a href={s.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-dark btn-sm">
                  <WhatsappLogoIcon size={18} weight="fill" /> WhatsApp us
                </a>
                <OpenEnquiry className="btn btn-ghost btn-sm" arrow={false} />
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-7">
          <FaqList items={items} />
        </div>
      </div>
    </section>
  );
}
