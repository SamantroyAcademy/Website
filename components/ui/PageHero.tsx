import Image from "next/image";
import Link from "@/components/ui/Link";
import type { ReactNode } from "react";
import { CaretRightIcon } from "@phosphor-icons/react/ssr";
import { mediaUrl } from "@/lib/supabase/media";

const KICKER_SIZE: Record<string, string> = {
  xs: "text-xs", sm: "text-[0.8125rem]", md: "text-sm", lg: "text-base", xl: "text-lg",
};

/** Interior page hero: breadcrumb, title and subtitle on the paper canvas,
 *  then a wide documentary photo band that wipes in and drifts on scroll.
 *  Light theme throughout: no dark overlay over the headline. */
export default function PageHero({
  kicker,
  kickerSize,
  title,
  subtitle,
  image,
  crumb,
  aside,
  compact = false,
}: {
  kicker?: string;
  kickerSize?: string;
  title: string;
  subtitle?: string;
  image?: string;
  crumb?: string;
  /** Optional right-column element (e.g. a CTA or quick facts). */
  aside?: ReactNode;
  /** Skip the photo band (tool pages that need the fold for the tool). */
  compact?: boolean;
}) {
  return (
    <header className="pt-24 sm:pt-28 lg:pt-32">
      <div className="container-x">
        {crumb && (
          <nav aria-label="Breadcrumb" data-reveal="fade" className="flex items-center gap-1.5 text-sm text-muted">
            <Link href="/" className="transition-colors hover:text-ink">Home</Link>
            <CaretRightIcon size={12} weight="bold" aria-hidden />
            <span aria-current="page" className="font-medium text-ink-2">{crumb}</span>
          </nav>
        )}
        <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            {kicker && (
              <p data-reveal="fade" className={`mb-4 font-semibold text-brand-600 ${KICKER_SIZE[kickerSize ?? "md"] ?? "text-sm"}`}>{kicker}</p>
            )}
            <h1 data-split className="display-xl text-ink" data-i18n="html" dangerouslySetInnerHTML={{ __html: title }} />
          </div>
          <div className="lg:col-span-4">
            {subtitle && <p data-reveal className="lede">{subtitle}</p>}
            {aside && <div data-reveal className="mt-6">{aside}</div>}
          </div>
        </div>
      </div>

      {!compact && image && (
        <div className="container-x mt-10 sm:mt-14">
          <div data-reveal="clip" className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-tint sm:aspect-[16/7]">
            <div data-parallax="7" className="absolute -inset-y-[9%] inset-x-0">
              <Image src={mediaUrl(image)} alt="" fill priority sizes="(min-width: 1320px) 1280px, 100vw" className="object-cover" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
