"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { TrophyIcon } from "@phosphor-icons/react";
import { prefersReducedMotion } from "@/components/motion/MotionProvider";

/** Recent results, one line at a time (a rotator, not a second marquee).
 *  Pauses when the visitor hovers or focuses it. */
export default function WinsRotator({ items }: { items: string[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const line = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (items.length < 2 || paused || prefersReducedMotion()) return;
    const id = window.setInterval(() => {
      if (!line.current) return setI((v) => (v + 1) % items.length);
      gsap.to(line.current, {
        yPercent: -100, opacity: 0, duration: 0.35, ease: "power2.in",
        onComplete: () => {
          setI((v) => (v + 1) % items.length);
          gsap.fromTo(line.current, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: "expo.out" });
        },
      });
    }, 3200);
    return () => window.clearInterval(id);
  }, [items.length, paused]);

  return (
    <div
      className="mt-6 flex items-center gap-3 rounded-full bg-surface px-5 py-3 shadow-[inset_0_0_0_1px_var(--color-line)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      tabIndex={0}
      aria-label="Recent results"
    >
      <TrophyIcon size={20} weight="duotone" className="shrink-0 text-accent-ink" />
      <div className="overflow-hidden">
        <p ref={line} className="truncate text-sm font-medium text-ink sm:text-base" aria-live="polite">{items[i]}</p>
      </div>
    </div>
  );
}
