import Link from "next/link";

/** Chevron mark (two rank stripes). Pure geometry, scales from favicon to hero. */
export function LogoMark({ className = "h-9 w-9", invert = false }: { className?: string; invert?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden focusable="false">
      <rect width="64" height="64" rx="16" fill={invert ? "#f3f4f0" : "#1a3625"} />
      <path d="M14 20 32 33 50 20v9L32 42 14 29z" fill="#ee7d1e" />
      <path d="M14 34 32 47 50 34v7L32 54 14 41z" fill={invert ? "#1a3625" : "#f3f4f0"} />
    </svg>
  );
}

/** Wordmark: the mark plus "Samantroy" set in the display face. */
export default function Logo({
  href = "/",
  invert = false,
  className = "",
}: {
  href?: string | null;
  invert?: boolean;
  className?: string;
}) {
  const inner = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark invert={invert} className="h-9 w-9 shrink-0" />
      <span className="flex flex-col leading-none">
        <span className={`font-display text-[1.28rem] font-extrabold tracking-[-0.03em] ${invert ? "text-paper" : "text-ink"}`}>
          Samantroy
        </span>
        <span className={`mt-0.5 text-[0.66rem] font-semibold tracking-[0.18em] ${invert ? "text-brand-200" : "text-brand-600"}`}>
          ACADEMY
        </span>
      </span>
    </span>
  );
  if (!href) return inner;
  return (
    <Link href={href} aria-label="Samantroy Academy, home" className="rounded-lg">
      {inner}
    </Link>
  );
}
