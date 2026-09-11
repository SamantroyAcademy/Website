"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { ArrowRightIcon } from "@phosphor-icons/react";
import type { HERO } from "@/lib/section-defaults";
import type { HeroSlide } from "@/lib/hero-slides";
import OpenEnquiry from "@/components/site/OpenEnquiry";
import { prefersReducedMotion } from "@/components/motion/MotionProvider";

gsap.registerPlugin(SplitText);

type Doc = Omit<typeof HERO, "typedWords"> & { typedWords: string[] };

/** Cycles the CMS words with a type-and-delete rhythm. The live region is
 *  polite and only announces completed words, not every keystroke. */
function Typewriter({ words }: { words: string[] }) {
  const [text, setText] = useState(words[0] ?? "");
  const [done, setDone] = useState(words[0] ?? "");

  useEffect(() => {
    if (words.length < 2 || prefersReducedMotion()) return;
    let w = 0;
    let i = words[0].length;
    let deleting = true;
    let t: number;
    const step = () => {
      const word = words[w];
      if (deleting) {
        i -= 1;
        setText(word.slice(0, i));
        if (i === 0) { deleting = false; w = (w + 1) % words.length; }
        t = window.setTimeout(step, 38);
      } else {
        const next = words[w];
        i += 1;
        setText(next.slice(0, i));
        if (i === next.length) { deleting = true; setDone(next); t = window.setTimeout(step, 2100); return; }
        t = window.setTimeout(step, 70);
      }
    };
    t = window.setTimeout(step, 2600);
    return () => window.clearTimeout(t);
  }, [words]);

  return (
    <>
      <span aria-hidden className="hl">{text}</span>
      <span aria-hidden className="ml-0.5 inline-block h-[0.85em] w-[3px] translate-y-[0.08em] animate-pulse rounded-full bg-accent" />
      <span className="sr-only" aria-live="polite">{done}</span>
    </>
  );
}

export default function Hero({ doc, slides }: { doc: Doc; slides: (HeroSlide & { image: string })[] }) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  // Intro choreography, after the intro screen lifts.
  useEffect(() => {
    if (!root.current || prefersReducedMotion()) return;
    const q = gsap.utils.selector(root);
    let split: SplitText | undefined;
    const ctx = gsap.context(() => {
      split = SplitText.create(q("[data-hero-title]"), { type: "lines", mask: "lines", linesClass: "split-line" });
      gsap.set(q("[data-hero-title]"), { opacity: 1 });
      const tl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
      tl.from(q("[data-hero-badge]"), { opacity: 0, y: 12, duration: 0.8 })
        .from(split.lines, { yPercent: 110, duration: 1.2, stagger: 0.1 }, "-=0.55")
        .from(q("[data-hero-fade]"), { opacity: 0, y: 18, duration: 1, stagger: 0.08 }, "-=0.8")
        .fromTo(q("[data-hero-media]"), { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "power4.inOut" }, 0.1)
        .from(q("[data-hero-img]"), { scale: 1.18, duration: 2, ease: "power3.out" }, 0.1);
      const play = () => tl.play();
      if (document.documentElement.classList.contains("sa-intro-done")) play();
      else window.addEventListener("sa:loaded", play, { once: true });
    }, root);
    return () => { ctx.revert(); split?.revert(); };
  }, []);

  // Slide rotation.
  useEffect(() => {
    if (slides.length < 2) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % slides.length), 5200);
    return () => window.clearInterval(id);
  }, [slides.length]);

  const current = slides[active];

  return (
    <section ref={root} className="relative overflow-hidden pt-24 sm:pt-28 lg:pt-24" aria-label="Introduction">
      <div className="container-x grid items-center gap-10 pb-14 lg:min-h-[calc(100dvh-6rem)] lg:grid-cols-12 lg:gap-14 lg:pb-12">
        <div className="lg:col-span-7">
          {doc.badge && (
            <p data-hero-badge className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3.5 py-1.5 text-sm font-semibold text-brand-700 shadow-[inset_0_0_0_1px_var(--color-brand-100)]">
              {doc.badge}
            </p>
          )}
          <h1 data-hero-title className="display-hero mt-6 text-ink [html.js-motion_&]:opacity-0">
            {doc.headingLine1}{" "}
            <span className="lg:block">{doc.headingLine2}</span>
          </h1>
          {doc.typedWords.length > 0 && (
            <p data-hero-fade className="display-md mt-4 min-h-[1.2em] text-ink-2">
              {doc.typedPrefix}
              <Typewriter words={doc.typedWords} />
            </p>
          )}
          {doc.paragraph && (
            <div data-hero-fade className="rich-html lede mt-6" dangerouslySetInnerHTML={{ __html: doc.paragraph }} />
          )}
          <div data-hero-fade className="mt-9 flex flex-col gap-3 sm:flex-row">
            <OpenEnquiry label={doc.primaryCta || undefined} className="btn btn-primary" />
            {doc.secondaryCta && (
              <Link href={doc.secondaryCtaHref || "/eligibility"} className="btn btn-ghost group">
                {doc.secondaryCta}
                <ArrowRightIcon size={18} weight="bold" className="arrow" />
              </Link>
            )}
          </div>
          {doc.rating && (
            <p data-hero-fade className="mt-6 text-sm text-muted" dangerouslySetInnerHTML={{ __html: doc.rating }} />
          )}
        </div>

        <figure className="lg:col-span-5">
          <div data-hero-media className="relative mx-auto aspect-[4/5] max-h-[72dvh] w-full overflow-hidden rounded-[var(--radius-card)] bg-tint lg:max-h-[78dvh]">
            {slides.map((s, i) => (
              <div
                key={s.image + i}
                className="absolute inset-0 transition-opacity duration-[1400ms] ease-out"
                style={{ opacity: i === active ? 1 : 0 }}
                aria-hidden={i !== active}
              >
                <Image
                  data-hero-img={i === 0 ? "" : undefined}
                  src={s.image}
                  alt={[s.name, s.academy, s.term].filter(Boolean).join(", ") || "Training and parade photograph"}
                  fill
                  priority={i === 0}
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className={`object-cover transition-transform duration-[6000ms] ease-out ${i === active ? "scale-105" : "scale-100"}`}
                />
              </div>
            ))}
          </div>
          {current && (current.academy || current.term || current.name) && (
            <figcaption data-hero-fade className="mt-4 flex items-baseline justify-between gap-4 text-sm">
              <span className="font-semibold text-ink">{current.name || current.academy}</span>
              <span className="text-right text-muted">{current.name ? [current.academy, current.term].filter(Boolean).join(", ") : current.term}</span>
            </figcaption>
          )}
          {slides.length > 1 && (
            <div className="mt-3 flex gap-1.5" role="tablist" aria-label="Choose photo">
              {slides.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  aria-label={`Photo ${i + 1}`}
                  onClick={() => setActive(i)}
                  className="h-1 flex-1 overflow-hidden rounded-full bg-tint-2"
                >
                  <span className={`block h-full rounded-full bg-brand-700 transition-[width] ${i === active ? "w-full duration-[5200ms] ease-linear" : "w-0 duration-0"}`} />
                </button>
              ))}
            </div>
          )}
        </figure>
      </div>
    </section>
  );
}
