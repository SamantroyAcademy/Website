import Image from "next/image";
import { InstagramLogoIcon, YoutubeLogoIcon, FacebookLogoIcon, ArrowUpRightIcon, PlayIcon } from "@phosphor-icons/react/ssr";
import { getSettings } from "@/lib/content";
import { getFacebookFeed, getInstagramFeed, type SocialPost } from "@/lib/feeds/meta";
import CmsSectionHeading from "@/components/ui/CmsSectionHeading";
import Rail from "@/components/ui/Rail";

type Tile = SocialPost & { from: "Instagram" | "Facebook" };

const isReal = (u?: string) => !!u && /^https?:\/\/[^/]+\/.+/.test(u);
const handle = (u: string) => {
  if (/facebook\.com/i.test(u)) return "Samantroy Academy Brahmapur";
  const m = u.match(/(?:instagram\.com|youtube\.com)\/(@?[\w.-]+)/i);
  return m ? (m[1].startsWith("@") ? m[1] : `@${m[1]}`) : u.replace(/^https?:\/\//, "");
};

/** Social section (homepage key "instagram"): the newest Instagram and
 *  Facebook videos (once connected under Admin, Connections), newest first,
 *  then large follow cards. Rendered when there is a feed or a real profile
 *  URL in the CMS settings. */
export default async function SocialBand() {
  const [s, ig, fb] = await Promise.all([getSettings(), getInstagramFeed().catch(() => []), getFacebookFeed().catch(() => [])]);
  const tiles: Tile[] = [
    ...ig.map((p) => ({ ...p, from: "Instagram" as const })),
    ...fb.map((p) => ({ ...p, from: "Facebook" as const })),
  ].filter((p) => p.image && p.url).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);
  const cards = [
    isReal(s.instagram) && { href: s.instagram, label: "Instagram", Icon: InstagramLogoIcon, line: "Results and new batches" },
    isReal(s.youtube) && { href: s.youtube, label: "YouTube", Icon: YoutubeLogoIcon, line: "Results and current affairs" },
    isReal(s.facebook) && { href: s.facebook, label: "Facebook", Icon: FacebookLogoIcon, line: "News from the academy" },
  ].filter(Boolean) as { href: string; label: string; Icon: typeof InstagramLogoIcon; line: string }[];
  if (!cards.length && !tiles.length) return null;

  return (
    <section className="section-y" aria-label="Follow us">
      <div className="container-x">
        <CmsSectionHeading sectionKey="instagram" />
      </div>
      {tiles.length > 0 && (
        <div className="mt-10">
          <Rail label="Latest from Instagram and Facebook" className="rail flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-3 sm:gap-4 sm:px-8 lg:px-[max(2rem,calc((100vw-1320px)/2+2rem))]">
            {tiles.map((t) => {
              const Icon = t.from === "Instagram" ? InstagramLogoIcon : FacebookLogoIcon;
              return (
                <li key={t.from + t.id} className="w-[46vw] max-w-[14rem] shrink-0 snap-start">
                  <a href={t.url} target="_blank" rel="noopener noreferrer" aria-label={`${t.video ? "Watch" : "View"} on ${t.from}${t.caption ? `: ${t.caption.slice(0, 80)}` : ""}`}
                    className="group relative block aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-brand-950">
                    <Image src={t.image} alt="" fill sizes="(min-width: 640px) 14rem, 46vw"
                      className="object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105" />
                    <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-950/10 to-transparent" />
                    <span className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-brand-900 shadow">
                      <Icon size={18} weight="fill" />
                    </span>
                    {t.video && (
                      <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-white shadow-lg transition-transform group-hover:scale-110">
                        <PlayIcon size={20} weight="fill" />
                      </span>
                    )}
                    {t.caption && (
                      <span className="absolute inset-x-0 bottom-0 p-3.5">
                        <span translate="no" className="line-clamp-3 text-[0.85rem] font-medium leading-snug text-white">{t.caption}</span>
                      </span>
                    )}
                  </a>
                </li>
              );
            })}
          </Rail>
        </div>
      )}
      {cards.length > 0 && (
      <div className="container-x">
        <ul className={`${tiles.length ? "mt-8" : "mt-10"} grid grid-cols-1 gap-4 ${cards.length > 2 ? "lg:grid-cols-3" : cards.length > 1 ? "md:grid-cols-2" : ""}`} data-reveal="stagger">
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
      )}
    </section>
  );
}
