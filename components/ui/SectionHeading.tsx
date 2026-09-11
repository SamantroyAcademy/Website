import type { ReactNode } from "react";

const KICKER_SIZE: Record<string, string> = {
  xs: "text-xs", sm: "text-[0.8125rem]", md: "text-sm", lg: "text-base", xl: "text-lg",
};

/** Section heading. Left-aligned by default; the kicker renders only when
 *  the CMS has one (kickers are rationed site-wide). Titles accept CMS HTML
 *  (e.g. <span class="hl">). */
export default function SectionHeading({
  kicker,
  kickerSize,
  title,
  subtitle,
  align = "left",
  tone = "light",
  as: Tag = "h2",
  className = "",
  children,
}: {
  kicker?: string;
  kickerSize?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
  as?: "h1" | "h2" | "h3";
  className?: string;
  children?: ReactNode;
}) {
  if (!title && !kicker) return null;
  const center = align === "center";
  return (
    <div className={`${center ? "mx-auto text-center" : ""} ${tone === "dark" ? "on-dark" : ""} max-w-3xl ${className}`}>
      {kicker && (
        <p data-reveal="fade" className={`font-semibold ${KICKER_SIZE[kickerSize ?? "md"] ?? "text-sm"} ${tone === "dark" ? "text-accent" : "text-brand-600"}`}>
          {kicker}
        </p>
      )}
      {title && (
        <Tag
          data-split
          className={`display-lg ${kicker ? "mt-3" : ""} ${tone === "dark" ? "text-surface" : "text-ink"}`}
          dangerouslySetInnerHTML={{ __html: title }}
        />
      )}
      {subtitle && (
        <p data-reveal className={`lede mt-5 ${center ? "mx-auto" : ""} ${tone === "dark" ? "text-brand-100" : ""}`}>
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}
