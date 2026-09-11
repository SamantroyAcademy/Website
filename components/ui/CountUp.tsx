"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/components/motion/MotionProvider";

gsap.registerPlugin(ScrollTrigger);

const fmt = (n: number) => Math.round(n).toLocaleString("en-IN");

/** Counts up once when scrolled into view. Server renders the final number,
 *  so it is correct with JS off and for crawlers. */
export default function CountUp({ value, suffix = "", className = "" }: { value: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !Number.isFinite(value)) return;
    const obj = { n: 0 };
    el.textContent = fmt(0) + suffix;
    const tween = gsap.to(obj, {
      n: value,
      duration: 2,
      ease: "power3.out",
      onUpdate: () => { el.textContent = fmt(obj.n) + suffix; },
      scrollTrigger: { trigger: el, start: "top 90%", once: true },
    });
    return () => { tween.kill(); el.textContent = fmt(value) + suffix; };
  }, [value, suffix]);

  return <span ref={ref} className={className}>{fmt(value)}{suffix}</span>;
}
