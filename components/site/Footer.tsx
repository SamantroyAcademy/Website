import Image from "next/image";
import Link from "@/components/ui/Link";
import { MapPinIcon, PhoneIcon, EnvelopeSimpleIcon, ClockIcon } from "@phosphor-icons/react/ssr";
import { mediaUrl } from "@/lib/supabase/media";
import { LogoArt } from "@/components/Logo";
import SocialIcons from "@/components/site/SocialIcons";
import { FOOTER_LINKS } from "@/lib/data";
import { getSettings, mapHref, telHref } from "@/lib/content";
import { getExams } from "@/lib/public-data";

/** Footer: the second half of the page's single dark colour block (the CTA
 *  banner above it is the first). Every value comes from the CMS settings. */
export default async function Footer() {
  const [s, exams] = await Promise.all([getSettings(), getExams()]);
  const year = new Date().getFullYear();
  const featured = exams.slice(0, 9);

  return (
    <footer className="on-dark bg-brand-950 text-brand-100">
      <div className="container-x grid gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-4">
          <Link href="/" aria-label="Samantroy Academy, home" className="block w-full max-w-[17rem] overflow-hidden rounded-xl shadow-[0_18px_40px_-20px_rgb(206_6_8/0.55)]">
            <LogoArt className="block h-auto w-full" label="Samantroy Academy logo: Shaping Nation's Warriors" />
          </Link>
          <p className="mt-6 font-display text-lg font-extrabold leading-snug text-surface">{s.legalName || s.name}</p>
          <p className="mt-2 max-w-sm text-[0.95rem] leading-relaxed text-brand-200">
            Coaching in Brahmapur (Berhampur), Ganjam since {s.foundedYear || "2001"} for Army, Navy, Air Force,
            CAPF, Odisha Police, Bank, Railway and SSC exams. 4000+ recruitments.
          </p>
          <SocialIcons settings={s} className="mt-6" />
        </div>

        <nav className="md:col-span-3" aria-label="Footer">
          <p className="text-sm font-semibold text-surface">Explore</p>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 text-[0.95rem]">
            {FOOTER_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-block py-1 text-brand-200 transition-colors hover:text-surface">{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="md:col-span-2" aria-label="Exams">
          <p className="text-sm font-semibold text-surface">Exams</p>
          <ul className="mt-4 space-y-1 text-[0.95rem]">
            {featured.map((e) => (
              <li key={e.slug}>
                <Link href={`/exams/${e.slug}`} className="inline-block py-1 text-brand-200 transition-colors hover:text-surface">{e.short_name || e.name}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <address className="not-italic md:col-span-3">
          <p className="text-sm font-semibold text-surface">Visit or call</p>
          <ul className="mt-4 space-y-3.5 text-[0.95rem]">
            <li>
              <a href={mapHref(s)} target="_blank" rel="noopener noreferrer" className="flex gap-3 text-brand-200 transition-colors hover:text-surface">
                <MapPinIcon size={20} weight="duotone" className="mt-0.5 shrink-0 text-accent-bright" />
                <span>{s.address}</span>
              </a>
            </li>
            <li>
              <span className="flex gap-3 text-brand-200">
                <PhoneIcon size={20} weight="duotone" className="mt-0.5 shrink-0 text-accent-bright" />
                <span>
                  {s.contactName && <span className="block text-sm text-brand-300">{s.contactName}</span>}
                  <a href={telHref(s.phone1)} className="inline-block py-0.5 transition-colors hover:text-surface">{s.phone1}</a>
                  {s.phone2 && <><br /><a href={telHref(s.phone2)} className="inline-block py-0.5 transition-colors hover:text-surface">{s.phone2}</a></>}
                </span>
              </span>
            </li>
            {s.email && (
              <li>
                <a href={`mailto:${s.email}`} className="flex gap-3 break-all text-brand-200 transition-colors hover:text-surface">
                  <EnvelopeSimpleIcon size={20} weight="duotone" className="mt-0.5 shrink-0 text-accent-bright" />
                  <span>{s.email}</span>
                </a>
              </li>
            )}
            {s.officeHours && (
              <li className="flex gap-3 text-brand-200">
                <ClockIcon size={20} weight="duotone" className="mt-0.5 shrink-0 text-accent-bright" />
                <span>{s.officeHours}</span>
              </li>
            )}
          </ul>
        </address>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-3 py-6 text-sm text-brand-300 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {year} {s.name}. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/credits" className="inline-block py-1 transition-colors hover:text-surface">Image credits</Link>
            <Link href="/contact" className="inline-block py-1 transition-colors hover:text-surface">Contact</Link>
          </div>
        </div>
      </div>

      {/* Developer credit, last line of the page. */}
      <div className="border-t border-white/10">
        <div className="container-x flex justify-center py-5">
          <a
            href="https://www.crayoratech.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Designed and developed by Crayora"
            className="group inline-flex items-center gap-2.5 rounded-full px-3 py-1.5 text-xs text-brand-300 transition-colors hover:text-surface sm:text-sm"
          >
            <span>Designed and developed by</span>
            <Image
              src={mediaUrl("/images/brand/crayora-white.webp")}
              alt="Crayora"
              width={448}
              height={120}
              sizes="120px"
              translate="no"
              className="crayora-glow h-4 w-auto sm:h-[1.15rem]"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
