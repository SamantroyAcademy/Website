"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ArrowRightIcon, CalendarDotsIcon, XIcon } from "@phosphor-icons/react";
import Link from "@/components/ui/Link";
import { LogoMark } from "@/components/Logo";
import { prefersReducedMotion } from "@/components/motion/MotionProvider";
import type { PopupBatch } from "@/lib/countdown-defaults";

const dateLabel = (ts: number) =>
  new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });

/** Opening popup: current and upcoming batches and exam dates, straight from
 *  Admin, Batch & Exam Countdown. Shown once per session after the intro and
 *  before the enquiry popup. Words and numbers sit in separate elements so the
 *  Odia switch can translate the words. */
export default function BatchesPopup({ batches, onClose, onEnquire }: { batches: PopupBatch[]; onClose: () => void; onEnquire: () => void }) {
  const card = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const running = batches.some((b) => b.status === "current");

  useEffect(() => {
    if (card.current && backdrop.current && !prefersReducedMotion()) {
      gsap.fromTo(backdrop.current, { opacity: 0 }, { opacity: 1, duration: 0.35 });
      gsap.fromTo(card.current, { opacity: 0, y: 40, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "expo.out" });
      gsap.fromTo(card.current.querySelectorAll("[data-batch]"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, ease: "expo.out", stagger: 0.07, delay: 0.15 });
    }
    // Focus the dialog itself (no ring on a button the visitor never chose).
    card.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && card.current) {
        const f = card.current.querySelectorAll<HTMLElement>("button, a[href]");
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      ref={backdrop}
      className="fixed inset-0 z-[70] flex items-end justify-center bg-brand-950/45 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="batches-title"
    >
      <div ref={card} tabIndex={-1} data-lenis-prevent className="relative max-h-[92dvh] outline-none w-full max-w-lg overflow-y-auto rounded-t-[24px] bg-paper shadow-[var(--shadow-lift)] sm:rounded-[24px]">
        <button type="button" onClick={onClose} aria-label="Close"
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-surface text-ink shadow-[inset_0_0_0_1.5px_var(--color-line)] transition hover:bg-tint">
          <XIcon size={18} weight="bold" />
        </button>

        <div className="p-5 sm:p-7">
          <div className="flex items-center gap-3 pr-12">
            <LogoMark className="h-11 w-11 shrink-0" />
            <div>
              <p id="batches-title" className="font-display text-2xl font-extrabold leading-tight tracking-tight text-ink">
                {running ? "Current and upcoming batches" : "Upcoming batches"}
              </p>
              <p className="text-sm text-muted">Brahmapur centre, near the railway station</p>
            </div>
          </div>

          <ul className="mt-5 space-y-2.5">
            {batches.map((b) => (
              <li key={b.label + b.date} data-batch className="rounded-[18px] bg-surface p-4 shadow-[inset_0_0_0_1px_var(--color-line)]">
                <div className="flex items-center justify-between gap-3 text-xs font-semibold">
                  <span className={`rounded-full px-2.5 py-1 ${b.kind === "exam" ? "bg-brand-50 text-brand-700" : b.status === "current" ? "bg-emerald-50 text-emerald-800" : "bg-accent-50 text-accent-ink"}`}>
                    {b.kind === "exam" ? "Exam" : b.status === "current" ? "Now running" : "Batch"}
                  </span>
                  <span className="flex items-center gap-1.5 text-muted">
                    <CalendarDotsIcon size={15} weight="bold" aria-hidden />
                    <span>{dateLabel(b.ts)}</span>
                  </span>
                </div>
                <p className="mt-2.5 font-display text-lg font-bold leading-snug text-ink">{b.label}</p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  {b.status === "current" ? (
                    <p className="text-sm font-medium text-ink-2">Started, still time to join</p>
                  ) : b.days === 0 ? (
                    <p className="text-sm font-bold text-accent-ink">Starts today</p>
                  ) : (
                    <p className="flex items-baseline gap-1.5">
                      <span className="numeral text-3xl text-accent-ink">{b.days}</span>
                      <span className="text-sm font-medium text-ink-2">{b.days === 1 ? "day to go" : "days to go"}</span>
                    </p>
                  )}
                  {b.kind !== "exam" && (
                    <button type="button" onClick={onEnquire} className="group inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-accent-ink hover:bg-accent-50">
                      Enquire <ArrowRightIcon size={15} weight="bold" className="arrow" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
            <button type="button" onClick={onEnquire} className="btn btn-primary w-full">Book free counselling</button>
            <Link href="/courses" onClick={onClose} className="btn btn-ghost w-full">See all batches</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
