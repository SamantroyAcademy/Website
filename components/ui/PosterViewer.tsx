"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeftIcon, ArrowRightIcon, ArrowSquareOutIcon, XIcon } from "@phosphor-icons/react";
import { useMotion } from "@/components/motion/MotionProvider";

export type Poster = { src: string; alt: string };

/** Full-screen viewer for result posters, so students can read the names
 *  without leaving the site. Any `a[data-poster="<index>"]` inside opens it;
 *  without JavaScript those links still open the image itself. */
export default function PosterViewer({ posters, children }: { posters: Poster[]; children: ReactNode }) {
  const [index, setIndex] = useState<number | null>(null);
  const { lock } = useMotion();
  const closeBtn = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const touchX = useRef<number | null>(null);
  const open = index !== null;

  const go = useCallback((dir: 1 | -1) => setIndex((i) => (i === null ? i : (i + dir + posters.length) % posters.length)), [posters.length]);
  const close = useCallback(() => setIndex(null), []);

  useEffect(() => {
    lock(open);
    if (!open) { opener.current?.focus(); return; }
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onClick = (e: React.MouseEvent) => {
    const a = (e.target as HTMLElement).closest<HTMLElement>("[data-poster]");
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    opener.current = a;
    setIndex(Number(a.dataset.poster) || 0);
  };

  const p = index !== null ? posters[index] : null;
  return (
    <div onClick={onClick}>
      {children}
      {p && (
        <div
          className="fixed inset-0 z-[70] flex flex-col bg-brand-950/95 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={p.alt}
          data-lenis-prevent
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
          onTouchStart={(e) => { touchX.current = e.touches.length === 1 ? e.touches[0].clientX : null; }}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
            touchX.current = null;
          }}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm text-brand-100 sm:px-6">
            <span aria-live="polite">{(index ?? 0) + 1} / {posters.length}</span>
            <div className="flex items-center gap-2">
              <a href={p.src} target="_blank" rel="noopener noreferrer" className="hidden items-center gap-1.5 rounded-full px-3 py-2 font-semibold hover:bg-white/10 sm:flex">
                <ArrowSquareOutIcon size={16} weight="bold" /> Open original
              </a>
              <button ref={closeBtn} type="button" onClick={close} aria-label="Close" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
                <XIcon size={20} weight="bold" />
              </button>
            </div>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-4 sm:px-20" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
            {/* Plain img: shown at its natural shape, pinch-zoom works on phones. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={p.src} src={p.src} alt={p.alt} className="max-h-full max-w-full rounded-lg object-contain shadow-2xl" />
            {posters.length > 1 && (
              <>
                <button type="button" onClick={() => go(-1)} aria-label="Previous poster" className="absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow hover:bg-white sm:left-5">
                  <ArrowLeftIcon size={20} weight="bold" />
                </button>
                <button type="button" onClick={() => go(1)} aria-label="Next poster" className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow hover:bg-white sm:right-5">
                  <ArrowRightIcon size={20} weight="bold" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
