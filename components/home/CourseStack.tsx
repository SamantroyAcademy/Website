"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CheckIcon, ArrowRightIcon, LockSimpleIcon } from "@phosphor-icons/react";
import type { CourseItem } from "@/lib/data";
import { TONE_BG } from "@/components/ui/tones";
import { useContactModal } from "@/components/site/ModalProvider";
import { prefersReducedMotion } from "@/components/motion/MotionProvider";

gsap.registerPlugin(ScrollTrigger);

function CourseCard({ c, showPrices }: { c: CourseItem; showPrices: boolean }) {
  const { open } = useContactModal();
  const hasPay = Boolean(c.enrollUrl && /^https:\/\//.test(c.enrollUrl));
  const price = c.price?.trim();
  return (
    <article className={`card relative grid overflow-hidden md:grid-cols-12 ${c.highlight ? "shadow-[var(--shadow-lift),inset_0_0_0_2px_var(--color-accent)]" : ""}`}>
      <span aria-hidden className={`absolute inset-x-0 top-0 h-1.5 ${TONE_BG[c.service] ?? "bg-accent"}`} />
      <div className="flex flex-col p-7 sm:p-9 md:col-span-7">
        {c.tag && (
          <p className={`self-start rounded-full px-3 py-1 text-xs font-semibold ${c.highlight ? "bg-accent text-white" : "bg-tint text-ink-2"}`}>{c.tag}</p>
        )}
        <h3 className="mt-5 font-display text-[clamp(1.8rem,3vw,2.6rem)] font-extrabold leading-[1.02] tracking-tight text-ink">{c.title}</h3>
        {c.where && <p className="mt-2 font-medium text-brand-600">{c.where}</p>}
        <p className="mt-4 max-w-[52ch] leading-relaxed text-ink-2">{c.desc}</p>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-5 pt-8">
          <div>
            <p className="text-xs font-semibold text-muted">Fee</p>
            {showPrices && price && !/enquire/i.test(price) ? (
              <p className="numeral mt-1 text-3xl text-ink">{price}</p>
            ) : (
              <p className="mt-1 font-display text-xl font-bold text-ink">Ask for the fee</p>
            )}
          </div>
          {hasPay ? (
            <a href={c.enrollUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary group">
              {c.cta || "Enrol"} <ArrowRightIcon size={18} weight="bold" className="arrow" />
            </a>
          ) : (
            <button type="button" onClick={() => open()} className="btn btn-primary group">
              {c.cta || "Enquire about this batch"} <ArrowRightIcon size={18} weight="bold" className="arrow" />
            </button>
          )}
        </div>
        {hasPay && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted"><LockSimpleIcon size={13} /> Secure payment page</p>
        )}
      </div>
      <div className="border-t border-line bg-paper/60 p-7 sm:p-9 md:col-span-5 md:border-l md:border-t-0">
        <p className="text-sm font-semibold text-ink">What the batch covers</p>
        <ul className="mt-4 space-y-3">
          {c.features.filter(Boolean).map((f) => (
            <li key={f} className="flex gap-3 text-[0.95rem] leading-snug text-ink-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                <CheckIcon size={12} weight="bold" />
              </span>
              {f}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

/** Desktop: each card pins at the top while the next slides over it, and the
 *  covered card shrinks back (sticky stack). Mobile: a plain vertical list. */
export default function CourseStack({ items, showPrices }: { items: CourseItem[]; showPrices: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion() || items.length < 2) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-stack-card]", ref.current);
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        gsap.to(card.firstElementChild, {
          scale: 0.94,
          opacity: 0.5,
          ease: "none",
          scrollTrigger: { trigger: cards[i + 1], start: "top bottom", end: "top 18%", scrub: true },
        });
      });
    });
    return () => mm.revert();
  }, [items.length]);

  return (
    <div ref={ref} className="container-x mt-12 space-y-6 lg:space-y-10">
      {items.map((c, i) => (
        <div
          key={c.title + i}
          data-stack-card
          data-reveal
          className="lg:sticky"
          style={{ top: `calc(6rem + ${i * 1.25}rem)` }}
        >
          <div className="origin-top will-change-transform">
            <CourseCard c={c} showPrices={showPrices} />
          </div>
        </div>
      ))}
    </div>
  );
}
