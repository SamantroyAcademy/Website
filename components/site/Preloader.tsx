"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const SESSION_KEY = "sa-intro";

/** First-visit intro (CMS: preloader, "on"/"off"). Plays once per browser
 *  session. The inline script in app/layout.tsx hides it before first paint on
 *  repeat visits and under reduced motion, so it never flashes. Always fires
 *  the "sa:loaded" event the enquiry popup waits for. */
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
    tl.from(q("[data-chev]"), { y: 26, opacity: 0, duration: 0.7, stagger: 0.12 })
      .from(q("[data-letter]"), { yPercent: 110, duration: 0.8, stagger: 0.035 }, "-=0.45")
      .from(q("[data-sub]"), { opacity: 0, y: 8, duration: 0.5 }, "-=0.5")
      .to(q("[data-bar]"), { scaleX: 1, duration: 0.55, ease: "power2.inOut" }, "-=0.6")
      .to(root.current, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.85, ease: "power4.inOut" }, "+=0.1");
    return () => { tl.kill(); };
  }, [enabled]);

  if (done) return null;

  const word = "SAMANTROY";
  return (
    <div
      ref={root}
      className="sa-preloader fixed inset-0 z-[80] flex items-center justify-center bg-paper"
      style={{ clipPath: "inset(0% 0% 0% 0%)" }}
      aria-hidden
    >
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 64 64" className="h-16 w-16" focusable="false">
          <rect width="64" height="64" rx="16" fill="#1a3625" />
          <path data-chev d="M14 20 32 33 50 20v9L32 42 14 29z" fill="#ee7d1e" />
          <path data-chev d="M14 34 32 47 50 34v7L32 54 14 41z" fill="#f3f4f0" />
        </svg>
        <p className="mt-6 flex overflow-hidden font-stencil text-5xl font-extrabold tracking-[0.02em] text-ink sm:text-7xl">
          {word.split("").map((c, i) => (
            <span key={i} data-letter className="inline-block">{c}</span>
          ))}
        </p>
        <p data-sub className="mt-2 text-xs font-semibold tracking-[0.4em] text-brand-600">ACADEMY</p>
        <div className="mt-6 h-[2px] w-40 overflow-hidden rounded-full bg-tint">
          <div data-bar className="h-full w-full origin-left scale-x-0 bg-accent" />
        </div>
      </div>
    </div>
  );
}
