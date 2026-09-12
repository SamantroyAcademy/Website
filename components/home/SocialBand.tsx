import { InstagramLogoIcon, YoutubeLogoIcon, FacebookLogoIcon, ArrowUpRightIcon } from "@phosphor-icons/react/ssr";
import { getSettings } from "@/lib/content";
import CmsSectionHeading from "@/components/ui/CmsSectionHeading";

const isReal = (u?: string) => !!u && /^https?:\/\/[^/]+\/.+/.test(u);
const handle = (u: string) => {
  if (/facebook\.com/i.test(u)) return "Samantroy Academy Brahmapur";
  const m = u.match(/(?:instagram\.com|youtube\.com)\/(@?[\w.-]+)/i);
  return m ? (m[1].startsWith("@") ? m[1] : `@${m[1]}`) : u.replace(/^https?:\/\//, "");
};

/** Social section (homepage key "instagram"). Large follow cards. Only
 *  rendered when at least one real profile URL is set in the CMS settings. */
export default async function SocialBand() {
  const s = await getSettings();
  const cards = [
    isReal(s.instagram) && { href: s.instagram, label: "Instagram", Icon: InstagramLogoIcon, line: "Results and new batches" },
    isReal(s.youtube) && { href: s.youtube, label: "YouTube", Icon: YoutubeLogoIcon, line: "Results and current affairs" },
    isReal(s.facebook) && { href: s.facebook, label: "Facebook", Icon: FacebookLogoIcon, line: "News from the academy" },
  ].filter(Boolean) as { href: string; label: string; Icon: typeof InstagramLogoIcon; line: string }[];
  if (!cards.length) return null;

  return (
    <section className="section-y" aria-label="Follow us">
      <div className="container-x">
        <CmsSectionHeading sectionKey="instagram" />
        <ul className={`mt-10 grid grid-cols-1 gap-4 ${cards.length > 2 ? "lg:grid-cols-3" : cards.length > 1 ? "md:grid-cols-2" : ""}`} data-reveal="stagger">
          {cards.map(({ href, label, Icon, line }) => (
            <li key={label} className="min-w-0">
              <a href={href} target="_blank" rel="noopener noreferrer"
                className="group card flex items-center gap-4 p-6 transition-shadow hover:shadow-[var(--shadow-lift)] sm:gap-5 sm:p-7">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-accent text-white sm:h-16 sm:w-16">
                  <Icon size={28} weight="fill" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-2xl font-bold tracking-tight text-ink">{label}</span>
                  <span className="block truncate text-sm font-medium text-ink-2">{handle(href)}</span>
                  <span className="block truncate text-sm text-muted">{line}</span>
                </span>
                <ArrowUpRightIcon size={24} weight="bold" className="shrink-0 text-brand-600 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
