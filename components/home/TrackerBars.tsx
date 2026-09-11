"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/components/motion/MotionProvider";

gsap.registerPlugin(ScrollTrigger);

/** Horizontal bars with no background track (a number plus a proportional
 *  bar reads cleaner than a dashboard gauge). They grow when scrolled in. */
export default function TrackerBars({ bars }: { bars: { exam: string; count: number }[] }) {
  const ref = useRef<HTMLUListElement>(null);
  const max = Math.max(...bars.map((b) => b.count), 1);

  useEffect(() => {
    if (!ref.current || prefersReducedMotion()) return;
    const els = ref.current.querySelectorAll("[data-bar]");
    const tween = gsap.from(els, {
      scaleX: 0, duration: 1.4, ease: "expo.out", stagger: 0.08,
      scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
    });
    return () => { tween.kill(); };
  }, []);

  return (
    <ul ref={ref} className="mt-5 space-y-5">
      {bars.map((b) => (
        <li key={b.exam}>
          <div className="flex items-baseline justify-between gap-4">
            <span className="font-medium text-ink">{b.exam}</span>
            <span className="numeral text-2xl text-ink">{b.count}</span>
          </div>
          <div data-bar className="mt-2 h-2.5 origin-left rounded-full bg-brand-600" style={{ width: `${Math.max(4, (b.count / max) * 100)}%` }} />
        </li>
      ))}
    </ul>
  );
}
