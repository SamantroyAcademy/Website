import { InstagramLogoIcon, YoutubeLogoIcon, TelegramLogoIcon, FacebookLogoIcon, WhatsappLogoIcon } from "@phosphor-icons/react/ssr";

type S = { instagram?: string; youtube?: string; telegram?: string; facebook?: string; whatsapp?: string };

/** Social links from the CMS settings. A blank or bare-domain URL is skipped,
 *  so an unconfigured network never renders a dead icon. */
export default function SocialIcons({ settings, className = "", tone = "dark" }: { settings: S; className?: string; tone?: "dark" | "light" }) {
  const isReal = (u?: string) => !!u && /^https?:\/\/[^/]+\/.+/.test(u);
  const items = [
    { href: settings.instagram, label: "Instagram", Icon: InstagramLogoIcon },
    { href: settings.youtube, label: "YouTube", Icon: YoutubeLogoIcon },
    { href: settings.facebook, label: "Facebook", Icon: FacebookLogoIcon },
    { href: settings.telegram, label: "Telegram", Icon: TelegramLogoIcon },
    { href: settings.whatsapp, label: "WhatsApp", Icon: WhatsappLogoIcon },
  ].filter((i) => isReal(i.href));
  if (!items.length) return null;
  const cls = tone === "dark"
    ? "bg-white/8 text-brand-100 hover:bg-accent hover:text-ink"
    : "bg-surface text-ink shadow-[inset_0_0_0_1.5px_var(--color-line)] hover:bg-accent";
  return (
    <ul className={`flex flex-wrap gap-2.5 ${className}`}>
      {items.map(({ href, label, Icon }) => (
        <li key={label}>
          <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
            className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${cls}`}>
            <Icon size={20} weight="fill" />
          </a>
        </li>
      ))}
    </ul>
  );
}
