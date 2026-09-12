"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { LogoArt } from "@/components/Logo";

const SESSION_KEY = "sa-intro";

/** First-visit intro built from the academy's own logo (CMS: preloader,
 *  "on"/"off"). On brand red, the rank bars draw out from the monogram, SA
 *  rises into place, the tagline and rule follow, then the panel lifts away.
 *  Plays once per browser session. The inline script in app/layout.tsx hides
 *  it before first paint on repeat visits and under reduced motion, so it
 *  never flashes. Always fires the "sa:loaded" event the popup waits for. */
export default function Preloader({ enabled = true }: { enabled?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const finish = () => {
      try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* ignore */ }
      document.documentElement.classList.add("sa-intro-done");
      setDone(true);
      window.dispatchEvent(new Event("sa:loaded"));
    };
    const skip =
      !enabled ||
      document.documentElement.classList.contains("sa-intro-done") ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (skip || !root.current) return finish();

    const q = gsap.utils.selector(root);
    const tl = gsap.timeline({ defaults: { ease: "expo.out" }, onComplete: finish });
    tl.set(q("[data-logo]"), { autoAlpha: 1 })
      .from(q('[data-logo="mark"]'), { yPercent: 38, autoAlpha: 0, duration: 0.9 })
      .from(q('[data-logo="bars-left"] [data-bar]'), { scaleX: 0, transformOrigin: "100% 50%", duration: 0.8, stagger: 0.08 }, "-=0.62")
      .from(q('[data-logo="bars-right"] [data-bar]'), { scaleX: 0, transformOrigin: "0% 50%", duration: 0.8, stagger: 0.08 }, "<")
      .from(q('[data-logo="tagline"]'), { y: 24, autoAlpha: 0, duration: 0.7 }, "-=0.5")
      .from(q('[data-logo="rule"]'), { scaleX: 0, transformOrigin: "50% 50%", duration: 0.75, ease: "power3.inOut" }, "-=0.45")
      .from(q("[data-sub]"), { autoAlpha: 0, y: 8, duration: 0.5 }, "-=0.35")
      .to(root.current, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.9, ease: "power4.inOut" }, "+=0.35");
    return () => { tl.kill(); };
  }, [enabled]);

  if (done) return null;

  return (
    <div
      ref={root}
      className="sa-preloader fixed inset-0 z-[80] flex items-center justify-center bg-accent"
      style={{ clipPath: "inset(0% 0% 0% 0%)" }}
      aria-hidden
    >
      <div className="w-[min(84vw,38rem)]">
        <LogoArt background={false} className="h-auto w-full overflow-visible" />
        <p data-sub className="mt-8 text-center text-[0.68rem] font-semibold tracking-[0.32em] text-white/85 sm:text-xs">
          SAMANTROY ACADEMY &middot; BRAHMAPUR &middot; SINCE 2001
        </p>
      </div>
    </div>
  );
}
