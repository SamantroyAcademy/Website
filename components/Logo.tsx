import Link from "@/components/ui/Link";
import { BARS_LEFT, BARS_RIGHT, LOGO_H, LOGO_RED, LOGO_W, MARK_BOX, MARK_D, RULE, TAGLINE_D, type Bar } from "@/lib/logo-art";

/** The tagline paths are the heaviest part of the artwork, so they are
 *  defined once per page (site layout) and reused by <LogoArt/>. */
export function LogoDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden focusable="false">
      <defs>
        <path id="sa-tagline-path" d={TAGLINE_D} fillRule="evenodd" />
      </defs>
    </svg>
  );
}

const PAD = MARK_BOX.w * 0.2;
const SIDE = MARK_BOX.w + PAD * 2;
const MARK_VIEW = `${MARK_BOX.x - PAD} ${MARK_BOX.y + MARK_BOX.h / 2 - SIDE / 2} ${SIDE} ${SIDE}`;

/** The SA monogram on brand red: favicon, navbar, chat and admin. */
export function LogoMark({ className = "h-9 w-9", rounded = true }: { className?: string; rounded?: boolean }) {
  const [x, y] = MARK_VIEW.split(" ").map(Number);
  return (
    <svg viewBox={MARK_VIEW} className={className} aria-hidden focusable="false">
      <rect x={x} y={y} width={SIDE} height={SIDE} rx={rounded ? SIDE * 0.22 : 0} fill={LOGO_RED} />
      <path d={MARK_D} fill="#fff" fillRule="evenodd" />
    </svg>
  );
}

const bars = (list: Bar[]) => list.map((b, i) => <rect key={i} data-bar x={b.x} y={b.y} width={b.w} height={b.h} />);

/** The full lockup: rank bars, SA, "Shaping Nation's Warriors", rule.
 *  Parts carry data-logo hooks so the preloader can animate them. Needs
 *  <LogoDefs/> on the page for the tagline. */
export function LogoArt({ className = "", background = true, label }: { className?: string; background?: boolean; label?: string }) {
  return (
    <svg
      viewBox={`0 0 ${LOGO_W} ${LOGO_H}`}
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {background && <rect data-logo="bg" width={LOGO_W} height={LOGO_H} fill={LOGO_RED} />}
      <g fill="#fff">
        <g data-logo="bars-left">{bars(BARS_LEFT)}</g>
        <g data-logo="bars-right">{bars(BARS_RIGHT)}</g>
        <path data-logo="mark" d={MARK_D} fillRule="evenodd" />
        <use data-logo="tagline" href="#sa-tagline-path" />
        <rect data-logo="rule" x={RULE.x} y={RULE.y} width={RULE.w} height={RULE.h} />
      </g>
    </svg>
  );
}

/** Navbar and footer wordmark: the monogram plus the academy's name. */
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
      <LogoMark className="h-10 w-10 shrink-0" />
      <span className="flex flex-col leading-none">
        <span className={`font-display text-[1.14rem] font-extrabold tracking-[-0.02em] sm:text-[1.22rem] ${invert ? "text-paper" : "text-ink"}`}>
          Samantroy Academy
        </span>
        <span className={`mt-1 text-[0.56rem] font-bold tracking-[0.14em] sm:text-[0.6rem] ${invert ? "text-brand-200" : "text-accent-ink"}`}>
          SHAPING NATION&rsquo;S WARRIORS
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
