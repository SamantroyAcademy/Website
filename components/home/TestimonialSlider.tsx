"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ArrowLeftIcon, ArrowRightIcon, QuotesIcon } from "@phosphor-icons/react";
import Portrait from "@/components/ui/Portrait";
import type { Testimonial } from "@/lib/public-data";
import { prefersReducedMotion } from "@/components/motion/MotionProvider";

const strip = (html: string) => html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

/** One quote at a time, crossfaded. Quotes are clamped to three lines so the
 *  block reads at a glance; arrows and swipe move between them. */
export default function TestimonialSlider({ items }: { items: Testimonial[] }) {
  const [i, setI] = useState(0);
  const stage = useRef<HTMLDivElement>(null);
  const touch = useRef<number | null>(null);
  const n = items.length;

  const go = (next: number) => {
    const target = (next + n) % n;
    if (!stage.current || prefersReducedMotion()) return setI(target);
    gsap.to(stage.current, {
      opacity: 0, y: -12, duration: 0.25, ease: "power2.in",
      onComplete: () => {
        setI(target);
        gsap.fromTo(stage.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: "expo.out" });
      },
    });
  };

  useEffect(() => {
    if (n < 2 || prefersReducedMotion()) return;
    const id = window.setInterval(() => go(i + 1), 7000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, n]);

  const t = items[i];
  return (
    <div
      className="mt-12 grid gap-10 lg:grid-cols-12 lg:items-center"
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current === null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1));
        touch.current = null;
      }}
    >
      <div ref={stage} className="lg:col-span-9" aria-live="polite">
        <QuotesIcon size={44} weight="fill" className="text-accent" aria-hidden />
        <blockquote className="mt-4 line-clamp-4 font-display text-[clamp(1.5rem,3vw,2.5rem)] font-bold leading-[1.18] tracking-tight text-ink sm:line-clamp-3">
          &ldquo;{strip(t.body)}&rdquo;
        </blockquote>
        <div className="mt-8 flex items-center gap-4">
          <Portrait src={t.image_path} name={t.name} className="h-14 w-14 shrink-0" rounded="rounded-full" sizes="56px" monoClass="text-lg" />
          <div>
            <p className="font-semibold text-ink">{t.name}</p>
            {t.rank && <p className="text-sm text-muted">{t.rank}</p>}
          </div>
        </div>
      </div>
      {n > 1 && (
        <div className="flex items-center gap-3 lg:col-span-3 lg:justify-end">
          <button type="button" onClick={() => go(i - 1)} aria-label="Previous testimonial"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-paper text-ink shadow-[inset_0_0_0_1.5px_var(--color-line)] transition hover:bg-tint">
            <ArrowLeftIcon size={20} weight="bold" />
          </button>
          <button type="button" onClick={() => go(i + 1)} aria-label="Next testimonial"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-surface transition hover:bg-brand-800">
            <ArrowRightIcon size={20} weight="bold" />
          </button>
        </div>
      )}
    </div>
  );
}
