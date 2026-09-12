import type { Metadata } from "next";
import { MapPinIcon, PhoneIcon, EnvelopeSimpleIcon, ClockIcon, WhatsappLogoIcon, ArrowUpRightIcon } from "@phosphor-icons/react/ssr";
import { pageMetadata } from "@/lib/seo";
import { getPublished, getSettings, mapEmbedSrc, mapHref, telHref } from "@/lib/content";
import { CONTACT_FORM, resolveContactForm } from "@/lib/form-defaults";
import CmsHero from "@/components/ui/CmsHero";
import ContactForm from "@/components/site/ContactForm";
import SocialIcons from "@/components/site/SocialIcons";
import Reveals from "@/components/motion/Reveals";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("contact");
}

export default async function ContactPage() {
  const [s, formDoc] = await Promise.all([getSettings(), getPublished<unknown>("contact_form", CONTACT_FORM)]);
  const form = resolveContactForm(formDoc);

  const lines = [
    { Icon: PhoneIcon, label: "Call", value: [s.phone1, s.phone2].filter(Boolean).join(", "), href: telHref(s.phone1) },
    { Icon: WhatsappLogoIcon, label: "WhatsApp", value: "Message a trainer", href: s.whatsapp, external: true },
    { Icon: EnvelopeSimpleIcon, label: "Email", value: s.email, href: `mailto:${s.email}` },
    { Icon: MapPinIcon, label: "Visit", value: s.address, href: mapHref(s), external: true },
  ];

  return (
    <main>
      <CmsHero pageKey="contact" compact />
      <section className="pb-24 pt-10 sm:pt-14">
        <div className="container-x grid gap-10 lg:grid-cols-12">
          <div className="card p-6 sm:p-9 lg:col-span-7" data-reveal>
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">Request a callback</h2>
            <p className="mt-1 text-ink-2">A trainer calls back within one working day.</p>
            <div className="mt-7">
              <ContactForm config={form} phone={s.phone1} />
            </div>
          </div>

          <aside className="space-y-4 lg:col-span-5">
            <ul className="space-y-3" data-reveal="stagger">
              {lines.map(({ Icon, label, value, href, external }) => (
                <li key={label}>
                  <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="group flex items-start gap-4 rounded-[var(--radius-card)] bg-surface p-5 shadow-[inset_0_0_0_1px_var(--color-line)] transition-colors hover:bg-tint">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-800 text-surface"><Icon size={20} weight="fill" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-muted">{label}</span>
                      <span className="block break-words font-semibold text-ink">{value}</span>
                    </span>
                    {external && <ArrowUpRightIcon size={18} weight="bold" className="mt-1 shrink-0 text-brand-500" />}
                  </a>
                </li>
              ))}
              {s.officeHours && (
                <li className="flex items-start gap-4 rounded-[var(--radius-card)] bg-brand-50 p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface text-brand-700"><ClockIcon size={20} weight="fill" /></span>
                  <span><span className="block text-sm text-muted">Hours</span><span className="block font-semibold text-ink">{s.officeHours}</span></span>
                </li>
              )}
            </ul>
            <div className="overflow-hidden rounded-[var(--radius-card)] bg-tint" data-reveal="clip">
              <iframe
                src={mapEmbedSrc(s)}
                title={`Map: ${s.address}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-72 w-full border-0"
              />
            </div>
            <SocialIcons settings={s} tone="light" />
          </aside>
        </div>
      </section>
      <Reveals />
    </main>
  );
}
