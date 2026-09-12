"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { JourneyStage } from "@/lib/data";
import { TONE_BG, TONE_TEXT } from "@/components/ui/tones";
import { prefersReducedMotion } from "@/components/motion/MotionProvider";

gsap.registerPlugin(ScrollTrigger);

function StageCard({ s }: { s: JourneyStage }) {
  return (
    <article className="card relative flex h-full flex-col overflow-hidden p-6 sm:p-7">
      <span aria-hidden className={`absolute inset-x-0 top-0 h-1 ${TONE_BG[s.service] ?? "bg-accent"}`} />
      <div className="flex items-baseline justify-between gap-4">
        <p className={`numeral text-[2.6rem] sm:text-5xl ${TONE_TEXT[s.service] ?? "text-brand-700"}`}>{s.code}</p>
        {s.day && s.day.toLowerCase() !== s.code.toLowerCase() && <p className="text-sm font-semibold text-muted">{s.day}</p>}
      </div>
      <h3 className="mt-4 font-display text-[1.6rem] font-extrabold leading-tight tracking-tight text-ink">{s.title}</h3>
      {s.subtitle && <p className="mt-1.5 font-medium text-brand-600">{s.subtitle}</p>}
      <div className="rich-html mt-3 text-[0.95rem] leading-relaxed text-ink-2" data-i18n="html" dangerouslySetInnerHTML={{ __html: s.brief }} />
      {s.tests?.length > 0 && (
        <ul className="mt-5 space-y-2 border-t border-line pt-4">
          {s.tests.map((t) => (
            <li key={t.name} className="text-sm leading-snug">
              <span className="font-semibold text-ink">{t.name}.</span> <span className="text-muted">{t.detail}</span>
            </li>
          ))}
        </ul>
      )}
      {s.drill && (
        <div className="mt-auto pt-6">
          <div className="rounded-[14px] bg-brand-50 px-4 py-3.5">
            <p className="text-xs font-semibold text-brand-700">How we prepare you</p>
            <div className="rich-html mt-1 text-sm leading-relaxed text-brand-900" data-i18n="html" dangerouslySetInnerHTML={{ __html: s.drill }} />
          </div>
        </div>
      )}
    </article>
  );
}

/** Must match the `pan` variant in globals.css. */
const PAN_QUERY = "(min-width: 1024px) and (min-height: 760px)";

export default function JourneyPan({ stages, intro }: { stages: JourneyStage[]; intro: ReactNode }) {
  const wrap = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const mm = gsap.matchMedia();
    // Wide AND tall screens: vertical scroll pans the stages horizontally
    // while pinned. Shorter laptops get the vertical timeline instead, so a
    // card is never taller than the pinned screen (and never cut off).
    mm.add(PAN_QUERY, () => {
      const el = track.current!;
      const distance = () => el.scrollWidth - window.innerWidth + 64;
      gsap.to(el, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: wrap.current,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
    });
    // Timeline layout: the line draws as you read down.
    mm.add(`not all and ${PAN_QUERY}`, () => {
      if (!line.current) return;
      gsap.fromTo(line.current, { scaleY: 0 }, {
        scaleY: 1, ease: "none",
        scrollTrigger: { trigger: line.current.parentElement, start: "top 70%", end: "bottom 70%", scrub: true },
      });
    });
    return () => mm.revert();
  }, [stages.length]);

  return (
    <section ref={wrap} className="journey-wrap relative overflow-hidden bg-tint py-20 pan:flex pan:h-[100dvh] pan:items-center pan:py-0" aria-label="Recruitment journey">
      {/* Desktop track */}
      <div ref={track} className="journey-track hidden gap-5 pl-[max(2rem,calc((100vw-1320px)/2+2rem))] pr-16 pan:flex pan:items-stretch">
        {intro && <div className="w-[26rem] shrink-0 py-2 pr-6">{intro}</div>}
        {stages.map((s, i) => (
          <div key={s.code + i} className="w-[26rem] shrink-0">
            <StageCard s={s} />
          </div>
        ))}
      </div>

      {/* Timeline (phones, tablets and short laptops) */}
      <div className="container-x pan:hidden">
        {intro && <div className="mb-10">{intro}</div>}
        <div className="relative">
          <div aria-hidden className="absolute bottom-3 left-[7px] top-3 w-[2px] bg-line">
            <div ref={line} className="h-full w-full origin-top bg-accent" />
          </div>
          <ol className="relative space-y-5 pl-7">
          {stages.map((s, i) => (
            <li key={s.code + i} className="relative" data-reveal>
              <span aria-hidden className={`absolute -left-7 top-8 h-4 w-4 rounded-full border-[3px] border-tint ${TONE_BG[s.service] ?? "bg-accent"}`} />
              <StageCard s={s} />
            </li>
          ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
