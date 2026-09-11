"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/components/motion/MotionProvider";

gsap.registerPlugin(ScrollTrigger);

type Item = { entry: string; count: string };

/** Chevron separator: the brand mark's rank stripe, not a decorative dot. */
function Chevron() {
  return (
    <svg viewBox="0 0 36 18" className="h-3 w-6 shrink-0 text-accent sm:h-4 sm:w-8" aria-hidden>
      <path d="M0 0 18 11 36 0v7L18 18 0 7z" fill="currentColor" />
    </svg>
  );
}

/** Infinite loop whose speed follows scroll velocity and whose direction
 *  follows scroll direction, so the band feels tied to the page. Static and
 *  wrapping under reduced motion. */
export default function MarqueeTrack({ items }: { items: Item[] }) {
  const track = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el || prefersReducedMotion()) return;
    const loop = gsap.to(el, { xPercent: -50, ease: "none", duration: Math.max(28, items.length * 5), repeat: -1 });
    let dir = 1;
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const v = self.getVelocity() / 350;
        if (self.direction !== dir) dir = self.direction;
        gsap.to(loop, { timeScale: dir * Math.min(4, 1 + Math.abs(v)), duration: 0.4, overwrite: true });
        gsap.to(loop, { timeScale: dir, duration: 1.4, delay: 0.4, overwrite: false });
      },
    });
    const pause = () => gsap.to(loop, { timeScale: 0, duration: 0.5, overwrite: true });
    const resume = () => gsap.to(loop, { timeScale: dir, duration: 0.6, overwrite: true });
    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", resume);
    return () => {
      loop.kill();
      st.kill();
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("mouseleave", resume);
    };
  }, [items.length]);

  const row = (hidden: boolean) =>
    items.map((it, i) => (
      <li key={`${hidden ? "b" : "a"}-${i}`} aria-hidden={hidden || undefined} className={`flex shrink-0 items-center gap-6 pr-6 sm:gap-10 sm:pr-10 ${hidden ? "marquee-dup" : ""}`}>
        <span className="whitespace-nowrap font-display text-[clamp(1.6rem,3.6vw,2.9rem)] font-extrabold tracking-[-0.03em] text-ink">
          {it.entry}
        </span>
        {it.count && (
          <span className="numeral whitespace-nowrap text-[clamp(1.2rem,2.2vw,1.8rem)] text-brand-600">
            {it.count}
            <span className="ml-1.5 font-sans text-xs font-semibold tracking-normal text-muted">selected</span>
          </span>
        )}
        <Chevron />
      </li>
    ));

  return (
    <div className="marquee-mask overflow-hidden">
      <ul ref={track} className="marquee-track flex w-max will-change-transform">
        {row(false)}
        {row(true)}
      </ul>
    </div>
  );
}
