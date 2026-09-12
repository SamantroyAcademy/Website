"use client";

/**
 * Initialises the declarative reveal effects (see MotionProvider for the
 * data-attribute vocabulary). Rendered as the LAST child of every page, so
 * its effect runs only after that page's streamed content has hydrated.
 * Running earlier would mutate DOM that React has not claimed yet and cause
 * hydration mismatches.
 */

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { prefersReducedMotion } from "./MotionProvider";

gsap.registerPlugin(ScrollTrigger, SplitText);

const EASE = "expo.out";

function initReveals() {
  // Fade + rise, batched so dozens of elements share a handful of triggers.
  const risers = gsap.utils.toArray<HTMLElement>('[data-reveal="true"], [data-reveal=""], [data-reveal="up"], [data-reveal="fade"]');
  if (risers.length) {
    gsap.set(risers, { opacity: 0, y: (i, el) => ((el as HTMLElement).dataset.reveal === "fade" ? 0 : 28) });
    ScrollTrigger.batch(risers, {
      start: "top 88%",
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, { opacity: 1, y: 0, duration: 1, ease: EASE, stagger: 0.08, overwrite: true }),
    });
  }

  // Media wipes.
  gsap.utils.toArray<HTMLElement>('[data-reveal="clip"]').forEach((el) => {
    gsap.fromTo(
      el,
      { clipPath: "inset(0% 0% 100% 0%)" },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1.3,
        ease: "power4.inOut",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      },
    );
  });

  // Staggered children.
  gsap.utils.toArray<HTMLElement>('[data-reveal="stagger"]').forEach((el) => {
    const kids = Array.from(el.children) as HTMLElement[];
    gsap.set(el, { opacity: 1 });
    gsap.fromTo(
      kids,
      { opacity: 0, y: 32 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: EASE,
        stagger: 0.07,
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      },
    );
  });

  // Split headings: lines rise out of a mask.
  // In Odia mode headings are translated in place, so they fade in whole:
  // splitting into lines would cut the text into untranslatable fragments.
  const odia = document.documentElement.classList.contains("i18n-or");
  gsap.utils.toArray<HTMLElement>("[data-split]").forEach((el) => {
    if (odia) {
      gsap.fromTo(el, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1, ease: EASE, scrollTrigger: { trigger: el, start: "top 88%", once: true } });
      return;
    }
    SplitText.create(el, {
      type: "lines",
      mask: "lines",
      linesClass: "split-line",
      autoSplit: true,
      onSplit(self) {
        gsap.set(el, { opacity: 1 });
        return gsap.from(self.lines, {
          yPercent: 110,
          duration: 1.1,
          ease: EASE,
          stagger: 0.09,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      },
    });
  });

  // Parallax drift inside overflow-hidden frames.
  gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
    const amount = Number(el.dataset.parallax) || 10;
    gsap.fromTo(
      el,
      { yPercent: -amount },
      {
        yPercent: amount,
        ease: "none",
        scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: true },
      },
    );
  });
}

export default function Reveals() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => initReveals());
    ScrollTrigger.refresh();
    // Safety net: if anything above threw, never leave content hidden.
    const failsafe = window.setTimeout(() => {
      document.querySelectorAll<HTMLElement>("[data-reveal], [data-split]").forEach((el) => {
        if (getComputedStyle(el).opacity === "0" && el.getBoundingClientRect().top < window.innerHeight) {
          gsap.to(el, { opacity: 1, y: 0, clipPath: "none", duration: 0.4 });
        }
      });
    }, 3500);
    return () => {
      window.clearTimeout(failsafe);
      ctx.revert();
    };
  }, []);
  return null;
}
