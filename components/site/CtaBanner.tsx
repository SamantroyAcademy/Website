import Image from "next/image";
import { mediaUrl } from "@/lib/supabase/media";
import { PhoneIcon } from "@phosphor-icons/react/ssr";
import { getPublished, getSettings, telHref } from "@/lib/content";
import { CTA } from "@/lib/section-defaults";
import OpenEnquiry from "./OpenEnquiry";

/** Closing call to action (CMS: cta). Opens the page's single dark colour
 *  block and flows straight into the footer below it. */
export default async function CtaBanner() {
  const [doc, s] = await Promise.all([getPublished("cta", CTA), getSettings()]);
  return (
    <section className="on-dark relative isolate overflow-hidden bg-brand-950 text-surface" aria-labelledby="cta-title">
      <div className="absolute inset-0 -z-10" aria-hidden>
        <Image src={mediaUrl("/images/scenes/gorkha-rifles-parade-2016.jpg")} alt="" fill sizes="100vw" className="object-cover opacity-[0.16] grayscale" data-parallax="8" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-950/40 via-brand-950/70 to-brand-950" />
      </div>
      <div className="container-x grid gap-10 pb-16 pt-20 md:grid-cols-12 md:items-end md:pb-20 md:pt-28">
        <div className="md:col-span-8">
          {doc.eyebrow && <p className="text-sm font-semibold text-accent-bright" data-reveal="fade">{doc.eyebrow}</p>}
          <h2 id="cta-title" data-split className="display-lg mt-4 max-w-3xl text-surface"
            data-i18n="html" dangerouslySetInnerHTML={{ __html: doc.title }} />
          <div className="rich-html mt-5 max-w-xl text-lg text-brand-100" data-reveal data-i18n="html" dangerouslySetInnerHTML={{ __html: doc.paragraph }} />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row md:col-span-4 md:flex-col md:items-end" data-reveal>
          <OpenEnquiry className="btn btn-primary w-full sm:w-auto md:w-full lg:w-auto" />
          <a href={telHref(s.phone1)} className="btn w-full text-surface shadow-[inset_0_0_0_1.5px_rgb(255_255_255/0.25)] hover:bg-white/10 sm:w-auto md:w-full lg:w-auto">
            <PhoneIcon size={18} weight="bold" /> {s.phone1}
          </a>
        </div>
      </div>
      <div className="container-x"><div className="h-px bg-white/10" /></div>
    </section>
  );
}
