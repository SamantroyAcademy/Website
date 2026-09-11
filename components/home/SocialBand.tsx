import { InstagramLogoIcon, YoutubeLogoIcon, ArrowUpRightIcon } from "@phosphor-icons/react/ssr";
import { getSettings } from "@/lib/content";
import CmsSectionHeading from "@/components/ui/CmsSectionHeading";

const isReal = (u?: string) => !!u && /^https?:\/\/[^/]+\/.+/.test(u);
const handle = (u: string) => {
  const m = u.match(/(?:instagram\.com|youtube\.com)\/(@?[\w.-]+)/i);
  return m ? (m[1].startsWith("@") ? m[1] : `@${m[1]}`) : u.replace(/^https?:\/\//, "");
};

/** Social section (homepage key "instagram"). Two large follow cards. Only
 *  rendered when at least one real profile URL is set in the CMS settings. */
export default async function SocialBand() {
  const s = await getSettings();
  const cards = [
    isReal(s.instagram) && { href: s.instagram, label: "Instagram", Icon: InstagramLogoIcon, line: "Daily ground clips and results" },
    isReal(s.youtube) && { href: s.youtube, label: "YouTube", Icon: YoutubeLogoIcon, line: "Lessons, strategy and exam updates" },
  ].filter(Boolean) as { href: string; label: string; Icon: typeof InstagramLogoIcon; line: string }[];
  if (!cards.length) return null;

  return (
    <section className="section-y" aria-label="Follow us">
      <div className="container-x">
        <CmsSectionHeading sectionKey="instagram" />
        <ul className={`mt-10 grid gap-4 ${cards.length > 1 ? "md:grid-cols-2" : ""}`} data-reveal="stagger">
          {cards.map(({ href, label, Icon, line }) => (
            <li key={label}>
              <a href={href} target="_blank" rel="noopener noreferrer"
                className="group card flex items-center gap-5 p-6 transition-shadow hover:shadow-[var(--shadow-lift)] sm:p-8">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[18px] bg-brand-800 text-surface">
                  <Icon size={30} weight="fill" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-2xl font-bold tracking-tight text-ink">{label}</span>
                  <span className="block truncate text-sm text-muted">{handle(href)}, {line.toLowerCase()}</span>
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
