"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";

/** Horizontal snap rail with visible controls. Touch users swipe; mouse users
 *  get previous / next buttons and edge fades that show there is more, so a
 *  card cut off at the edge reads as "scroll for more", not as broken. */
export default function Rail({ children, className = "", label }: { children: ReactNode; className?: string; label: string }) {
  const ref = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      setCanPrev(el.scrollLeft > 8);
      setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", update); ro.disconnect(); };
  }, []);

  const step = (dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const btn = "absolute top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-surface text-ink shadow-[var(--shadow-lift),inset_0_0_0_1px_var(--color-line)] transition hover:bg-white disabled:pointer-events-none disabled:opacity-0 md:flex";

  return (
    <div className="relative">
      <ul ref={ref} className={className} aria-label={label} data-lenis-prevent>
        {children}
      </ul>
      <span aria-hidden className={`pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-paper to-transparent transition-opacity ${canPrev ? "opacity-100" : "opacity-0"}`} />
      <span aria-hidden className={`pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-paper to-transparent transition-opacity ${canNext ? "opacity-100" : "opacity-0"}`} />
      <button type="button" onClick={() => step(-1)} disabled={!canPrev} aria-label="Scroll back" className={`${btn} left-4 lg:left-6`}>
        <ArrowLeftIcon size={20} weight="bold" />
      </button>
      <button type="button" onClick={() => step(1)} disabled={!canNext} aria-label="Scroll forward" className={`${btn} right-4 lg:right-6`}>
        <ArrowRightIcon size={20} weight="bold" />
      </button>
    </div>
  );
}
