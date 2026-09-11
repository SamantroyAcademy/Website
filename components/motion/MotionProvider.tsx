"use client";

/**
 * Site-wide smooth scrolling (Lenis synced to GSAP ScrollTrigger).
 *
 * Reveal effects live in ./Reveals.tsx. Server components opt in
 * declaratively, so they never need "use client":
 *   data-reveal            fade + rise when it enters the viewport (JSX renders
 *                          a bare attribute as data-reveal="true")
 *   data-reveal="fade"     opacity only
 *   data-reveal="clip"     wipe-in from the top (images, media frames)
 *   data-reveal="stagger"  direct children rise one after another
 *   data-split             heading splits into lines that rise from a mask
 *   data-parallax="12"     element drifts +/-12% as its parent scrolls past
 *
 * Why each exists (motion must be motivated): reveals pace the reading order
 * down long pages, split headings mark the start of each chapter, parallax
 * gives the documentary photography depth. Nothing loops for decoration.
 *
 * Everything is disabled under prefers-reduced-motion: Lenis never starts,
 * the html.js-motion class is never added, so content is simply visible.
 */

import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Ctx = {
  scrollTo: (target: string | number | HTMLElement, opts?: { offset?: number }) => void;
  lock: (on: boolean) => void;
};

const MotionCtx = createContext<Ctx>({
  scrollTo: (t) => {
    if (typeof t === "number") window.scrollTo({ top: t, behavior: "smooth" });
  },
  lock: () => {},
});

export const useMotion = () => useContext(MotionCtx);

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function MotionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  // Smooth scrolling, once for the life of the site.
  useEffect(() => {
    (window as unknown as { __saMotion?: boolean }).__saMotion = true;
    if (prefersReducedMotion()) {
      document.documentElement.classList.remove("js-motion");
      return;
    }
    const lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Anchor links (#faq etc.) glide instead of jumping.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a[href^='#']") as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute("href")!;
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -88 });
    };
    document.addEventListener("click", onClick);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh);

    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("load", refresh);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // New page: start at the top. Reveals are initialised by <Reveals />,
  // rendered at the end of each page, so they run only after the page's
  // streamed content has hydrated.
  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
  }, [pathname]);

  const value: Ctx = {
    scrollTo: (target, opts) => {
      if (lenisRef.current) lenisRef.current.scrollTo(target as never, { offset: opts?.offset ?? -88 });
      else if (typeof target === "number") window.scrollTo({ top: target, behavior: "smooth" });
      else if (typeof target === "string") document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
      else target.scrollIntoView({ behavior: "smooth" });
    },
    lock: (on) => {
      if (on) lenisRef.current?.stop();
      else lenisRef.current?.start();
      document.documentElement.style.overflow = on ? "hidden" : "";
    },
  };

  return <MotionCtx.Provider value={value}>{children}</MotionCtx.Provider>;
}
