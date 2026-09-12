"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "@/components/ui/Link";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
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
    // Odia mode: swap whole words (each one is in the dictionary), no typing.
    if (document.documentElement.classList.contains("i18n-or")) {
      let k = 0;
      const id = window.setInterval(() => { k = (k + 1) % words.length; setText(words[k]); setDone(words[k]); }, 2600);
      return () => window.clearInterval(id);
    }
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
  // Slides whose images are in the DOM: the first two at start, then each
  // new slide and the one after it as the carousel reaches them.
  const [mounted, setMounted] = useState<Set<number>>(() => new Set([0, 1, Math.max(slides.length - 1, 0)]));
  useEffect(() => {
    const n = Math.max(slides.length, 1);
    const next = (active + 1) % n;
    const prev = (active - 1 + n) % n;
    setMounted((m) => (m.has(active) && m.has(next) && m.has(prev) ? m : new Set([...m, active, next, prev])));
  }, [active, slides.length]);

  // Intro choreography, after the intro screen lifts.
  useEffect(() => {
    if (!root.current || prefersReducedMotion()) return;
    const q = gsap.utils.selector(root);
    let split: SplitText | undefined;
    const ctx = gsap.context(() => {
      // Odia mode translates the title in place, so it is not split into lines.
      const odia = document.documentElement.classList.contains("i18n-or");
      split = odia ? undefined : SplitText.create(q("[data-hero-title]"), { type: "lines", mask: "lines", linesClass: "split-line" });
      gsap.set(q("[data-hero-title]"), { opacity: 1 });
      const tl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
      tl.from(q("[data-hero-badge]"), { opacity: 0, y: 12, duration: 0.8 })
        .from(split ? split.lines : q("[data-hero-title]"), split ? { yPercent: 110, duration: 1.2, stagger: 0.1 } : { opacity: 0, y: 24, duration: 1.1 }, "-=0.55")
        .from(q("[data-hero-fade]"), { opacity: 0, y: 18, duration: 1, stagger: 0.08 }, "-=0.8")
        .fromTo(q("[data-hero-media]"), { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "power4.inOut" }, 0.1)
        .from(q("[data-hero-img]"), { scale: 1.18, duration: 2, ease: "power3.out" }, 0.1);
      const play = () => tl.play();
      if (document.documentElement.classList.contains("sa-intro-done")) play();
      else window.addEventListener("sa:loaded", play, { once: true });
    }, root);
    return () => { ctx.revert(); split?.revert(); };
  }, []);

  // Slide rotation. `nonce` restarts the timer after a manual change, so a
  // tapped poster gets its full time on screen.
  const [nonce, setNonce] = useState(0);
  useEffect(() => {
    if (slides.length < 2) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % slides.length), 6500);
    return () => window.clearInterval(id);
  }, [slides.length, nonce]);
  const go = (i: number) => { setActive((i + slides.length) % slides.length); setNonce((n) => n + 1); };

  const current = slides[active];

  return (
    <section ref={root} className="relative overflow-hidden pt-24 sm:pt-28" aria-label="Introduction">
      {/* Poster carousel: the current poster large in the centre, its
          neighbours peeking in at the sides (on phones too). Each poster is
          shown whole; no blur. Sizes come from --slide-w (see globals.css). */}
      <figure className="hero-carousel relative select-none">
        <div data-hero-media className="relative w-full overflow-hidden" style={{ height: "var(--slide-h)" }}>
          {slides.map((s, i) => {
            const n = slides.length;
            let offset = (i - active + n) % n;
            if (offset > n / 2) offset -= n;
            const near = Math.abs(offset) <= 1;
            return (
              <div
                key={s.image + i}
                className="absolute top-0 h-full overflow-hidden rounded-[var(--radius-card)] bg-surface shadow-[var(--shadow-lift)] transition-[transform,opacity] duration-700 ease-[var(--ease-out-expo)]"
                style={{
                  left: "calc(50% - var(--slide-w) / 2)",
                  width: "var(--slide-w)",
                  transform: `translateX(calc(${offset} * (100% + var(--slide-gap)))) scale(${offset === 0 ? 1 : 0.92})`,
                  opacity: offset === 0 ? 1 : near ? 0.5 : 0,
                  zIndex: offset === 0 ? 2 : 1,
                  pointerEvents: near ? "auto" : "none",
                }}
                aria-hidden={offset !== 0}
                onClick={offset !== 0 ? () => go(i) : undefined}
              >
                {mounted.has(i) && (
                  <Image
                    data-hero-img={i === 0 ? "" : undefined}
                    src={s.image}
                    alt={[s.name, s.academy, s.term].filter(Boolean).join(", ") || "Samantroy Academy results poster"}
                    fill
                    priority={i === 0}
                    sizes="(min-width: 1024px) 76vw, 88vw"
                    className="object-contain"
                  />
                )}
              </div>
            );
          })}

          {slides.length > 1 && (
            <>
              <button type="button" onClick={() => go(active - 1)} aria-label="Previous poster"
                className="absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-[var(--shadow-card)] transition hover:bg-white sm:h-12 sm:w-12"
                style={{ left: "calc(50% - var(--slide-w) / 2 + 0.75rem)" }}>
                <ArrowLeftIcon size={18} weight="bold" />
              </button>
              <button type="button" onClick={() => go(active + 1)} aria-label="Next poster"
                className="absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-[var(--shadow-card)] transition hover:bg-white sm:h-12 sm:w-12"
                style={{ right: "calc(50% - var(--slide-w) / 2 + 0.75rem)" }}>
                <ArrowRightIcon size={18} weight="bold" />
              </button>
            </>
          )}
        </div>

        <div className="container-x mt-4 flex flex-col items-center gap-2.5">
          {slides.length > 1 && (
            <div className="flex items-center gap-2" role="tablist" aria-label="Choose poster">
              {slides.map((s, i) => (
                <button key={i} type="button" role="tab" aria-selected={i === active} aria-label={`Poster ${i + 1}`}
                  onClick={() => go(i)}
                  className={`h-2 rounded-full transition-all duration-500 ${i === active ? "w-7 bg-accent" : "w-2 bg-tint-2 hover:bg-line"}`} />
              ))}
            </div>
          )}
          {current && (current.academy || current.term || current.name) && (
            <figcaption className="text-center text-sm text-muted">
              <span className="font-semibold text-ink">{current.name || current.academy}</span>
              {(current.name ? [current.academy, current.term].filter(Boolean).join(", ") : current.term) && (
                <> &middot; {current.name ? [current.academy, current.term].filter(Boolean).join(", ") : current.term}</>
              )}
            </figcaption>
          )}
        </div>
      </figure>

      {/* Headline and offer, below the carousel. */}
      <div className="container-x grid gap-8 pb-14 pt-10 sm:pt-12 lg:grid-cols-12 lg:gap-14 lg:pb-16">
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
        </div>
        <div className="lg:col-span-5 lg:self-end">
          {doc.paragraph && (
            <div data-hero-fade className="rich-html lede" data-i18n="html" dangerouslySetInnerHTML={{ __html: doc.paragraph }} />
          )}
          <div data-hero-fade className="mt-8 flex flex-col gap-3 sm:flex-row">
            <OpenEnquiry label={doc.primaryCta || undefined} className="btn btn-primary" />
            {doc.secondaryCta && (
              <Link href={doc.secondaryCtaHref || "/eligibility"} className="btn btn-ghost group">
                {doc.secondaryCta}
                <ArrowRightIcon size={18} weight="bold" className="arrow" />
              </Link>
            )}
          </div>
          {doc.rating && (
            <p data-hero-fade className="mt-6 text-sm text-muted" data-i18n="html" dangerouslySetInnerHTML={{ __html: doc.rating }} />
          )}
        </div>
      </div>
    </section>
  );
}
