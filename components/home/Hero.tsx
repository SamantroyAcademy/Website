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
  const [mounted, setMounted] = useState<Set<number>>(() => new Set([0, 1]));
  useEffect(() => {
    const next = (active + 1) % Math.max(slides.length, 1);
    setMounted((m) => (m.has(active) && m.has(next) ? m : new Set([...m, active, next])));
  }, [active, slides.length]);

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
    <section ref={root} className="relative overflow-hidden pt-[4.6rem] sm:pt-20" aria-label="Introduction">
      {/* Full-width poster carousel. */}
      <figure className="relative">
        <div data-hero-media className="relative h-[62vw] max-h-[74dvh] min-h-[15rem] w-full overflow-hidden bg-brand-950 sm:h-[52vw] lg:h-[68dvh]">
          {slides.map((s, i) => (
            <div
              key={s.image + i}
              className="absolute inset-0 transition-opacity duration-[1400ms] ease-out"
              style={{ opacity: i === active ? 1 : 0 }}
              aria-hidden={i !== active}
            >
              {/* Only the current poster and the next one are mounted, so a
                  visitor downloads posters as they come up, not all at once.
                  Posters come in every shape: each is shown whole, on a
                  blurred, darkened copy of itself (same file, one download). */}
              {mounted.has(i) && (
                <>
                  <Image aria-hidden src={s.image} alt="" fill sizes="100vw"
                    className="scale-110 object-cover opacity-40 blur-2xl" />
                  <Image
                    data-hero-img={i === 0 ? "" : undefined}
                    src={s.image}
                    alt={[s.name, s.academy, s.term].filter(Boolean).join(", ") || "Samantroy Academy results poster"}
                    fill
                    priority={i === 0}
                    sizes="100vw"
                    className="object-contain px-3 pb-12 pt-3 drop-shadow-[0_18px_30px_rgb(0_0_0/0.4)] sm:px-6 sm:pb-16 sm:pt-6"
                  />
                </>
              )}
            </div>
          ))}

          {/* Caption, arrows and progress, over a soft bottom shade. */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-brand-950/85 to-transparent" />
          <div className="absolute inset-x-0 bottom-0">
            <div className="container-x flex items-end justify-between gap-4 pb-4 sm:pb-5">
              {current && (current.academy || current.term || current.name) ? (
                <figcaption className="min-w-0 text-white">
                  <span className="block truncate text-sm font-semibold sm:text-base">{current.name || current.academy}</span>
                  <span className="block text-xs text-white/75 sm:text-sm">{current.name ? [current.academy, current.term].filter(Boolean).join(", ") : current.term}</span>
                </figcaption>
              ) : <span />}
              {slides.length > 1 && (
                <div className="flex shrink-0 gap-2">
                  <button type="button" onClick={() => go(active - 1)} aria-label="Previous poster"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink shadow transition hover:bg-white">
                    <ArrowLeftIcon size={18} weight="bold" />
                  </button>
                  <button type="button" onClick={() => go(active + 1)} aria-label="Next poster"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink shadow transition hover:bg-white">
                    <ArrowRightIcon size={18} weight="bold" />
                  </button>
                </div>
              )}
            </div>
            {slides.length > 1 && (
              <div className="container-x flex gap-1.5 pb-3" role="tablist" aria-label="Choose poster">
                {slides.map((s, i) => (
                  <button key={i} type="button" role="tab" aria-selected={i === active} aria-label={`Poster ${i + 1}`}
                    onClick={() => go(i)} className="h-1 flex-1 overflow-hidden rounded-full bg-white/25">
                    <span key={i === active ? `on-${nonce}` : "off"} className={`block h-full rounded-full bg-white transition-[width] ${i === active ? "w-full duration-[6500ms] ease-linear" : "w-0 duration-0"}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
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
            <div data-hero-fade className="rich-html lede" dangerouslySetInnerHTML={{ __html: doc.paragraph }} />
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
            <p data-hero-fade className="mt-6 text-sm text-muted" dangerouslySetInnerHTML={{ __html: doc.rating }} />
          )}
        </div>
      </div>
    </section>
  );
}
