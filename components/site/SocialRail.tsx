import { InstagramLogoIcon, FacebookLogoIcon, YoutubeLogoIcon, TrophyIcon } from "@phosphor-icons/react/ssr";
import type { SiteSettings } from "@/lib/content";

const isReal = (u?: string) => !!u && /^https?:\/\/[^/]+\/.+/.test(u);

type Item = { href: string; label: string; icon: React.ReactNode; tone: string; badge?: boolean };

/** Social links pinned to the middle of the right edge on every page:
 *  Instagram, Facebook and both YouTube channels, stacked vertically, in brand
 *  colours; filled on hover, and a label slides out on desktop. Only profiles set in
 *  Admin, Settings are shown. */
export default function SocialRail({ settings: s }: { settings: SiteSettings }) {
  const items = ([
    isReal(s.instagram) && {
      href: s.instagram, label: "Instagram",
      icon: <InstagramLogoIcon size={20} weight="bold" />,
      tone: "text-[#e1306c] group-hover:bg-[linear-gradient(45deg,#f09433,#e6683c_25%,#dc2743_50%,#cc2366_75%,#bc1888)] group-hover:text-white",
    },
    isReal(s.facebook) && {
      href: s.facebook, label: "Facebook",
      icon: <FacebookLogoIcon size={20} weight="fill" />,
      tone: "text-[#1877f2] group-hover:bg-[#1877f2] group-hover:text-white",
    },
    isReal(s.youtube2) && {
      href: s.youtube2, label: "Success stories on YouTube",
      icon: <YoutubeLogoIcon size={20} weight="fill" />,
      tone: "text-[#ff0000] group-hover:bg-[#ff0000] group-hover:text-white",
      badge: true,
    },
    isReal(s.youtube) && {
      href: s.youtube, label: "Samantroy Academy on YouTube",
      icon: <YoutubeLogoIcon size={20} weight="fill" />,
      tone: "text-[#ff0000] group-hover:bg-[#ff0000] group-hover:text-white",
    },
  ].filter(Boolean) as Item[]);
  if (!items.length) return null;

  return (
    <nav
      aria-label="Social media"
      className="fixed right-0 top-1/2 z-30 -translate-y-1/2 print:hidden"
    >
      <ul className="flex flex-col gap-1 rounded-l-2xl border border-r-0 border-line/80 bg-surface/85 p-1 shadow-[var(--shadow-card)] backdrop-blur-md sm:gap-1.5 sm:p-1.5">
        {items.map((it) => (
          <li key={it.href} className="relative">
            <a href={it.href} target="_blank" rel="noopener noreferrer" aria-label={it.label} className="group relative flex">
              <span className={`relative flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-300 sm:h-10 sm:w-10 ${it.tone}`}>
                {it.icon}
                {it.badge && (
                  <span aria-hidden className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-white ring-2 ring-surface">
                    <TrophyIcon size={9} weight="fill" />
                  </span>
                )}
              </span>
              {/* Desktop label, slides out to the left on hover or keyboard focus. */}
              <span
                aria-hidden
                className="pointer-events-none absolute right-full top-1/2 mr-2 hidden -translate-y-1/2 translate-x-2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-xs font-semibold text-surface opacity-0 shadow-lg transition duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 md:block"
              >
                {it.label}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
