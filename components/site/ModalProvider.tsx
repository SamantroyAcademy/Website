"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { XIcon } from "@phosphor-icons/react";
import ContactForm from "./ContactForm";
import BatchesPopup from "./BatchesPopup";
import { LogoMark } from "@/components/Logo";
import { ENQUIRY_POPUP, type EnquiryPopupDoc } from "@/lib/homepage-defaults";
import { CONTACT_FORM, type ContactFormDoc } from "@/lib/form-defaults";
import { popupBatches, type CountdownItem, type PopupBatch } from "@/lib/countdown-defaults";
import { useMotion, prefersReducedMotion } from "@/components/motion/MotionProvider";

type Ctx = { open: (presetEntry?: string) => void; close: () => void };
const ModalContext = createContext<Ctx>({ open: () => {}, close: () => {} });
export const useContactModal = () => useContext(ModalContext);

const SESSION_KEY = "sa-popup-seen";
const BATCHES_KEY = "sa-batches-seen";

const seen = (key: string) => { try { return Boolean(sessionStorage.getItem(key)); } catch { return false; } };
const markSeen = (key: string) => { try { sessionStorage.setItem(key, "1"); } catch { /* storage blocked */ } };

/** Opening sequence, once per browser session: the intro, then the batches
 *  popup (CMS: countdown), then the enquiry popup (CMS: enquiry_popup +
 *  contact_form) a few seconds after the batches popup closes. Any "Book free
 *  counselling" button opens the enquiry popup on demand via useContactModal(). */
export default function ModalProvider({
  children,
  popup = ENQUIRY_POPUP,
  form = CONTACT_FORM,
  phone = "",
  batches = { items: [], enabled: false },
}: {
  children: ReactNode;
  popup?: EnquiryPopupDoc;
  form?: ContactFormDoc;
  phone?: string;
  batches?: { items: CountdownItem[]; enabled: boolean };
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [preset, setPreset] = useState("");
  const [batchList, setBatchList] = useState<PopupBatch[] | null>(null);
  const enquiryTimer = useRef<number | undefined>(undefined);
  const { lock } = useMotion();
  const pathname = usePathname();
  const card = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const open = useCallback((presetEntry?: string) => {
    lastFocus.current = document.activeElement as HTMLElement | null;
    setPreset(presetEntry ?? "");
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);

  const enquiryAuto = popup.enabled !== "off";
  const enquiryDelay = Math.max(1500, Number(popup.delayMs) || 6000);
  const scheduleEnquiry = useCallback((delay: number) => {
    if (!enquiryAuto || seen(SESSION_KEY)) return;
    window.clearTimeout(enquiryTimer.current);
    enquiryTimer.current = window.setTimeout(() => {
      if (seen(SESSION_KEY)) return;
      markSeen(SESSION_KEY);
      setIsOpen(true);
    }, delay);
  }, [enquiryAuto]);

  // Opening sequence: never on the contact page itself.
  useEffect(() => {
    if (pathname.startsWith("/contact")) return;
    let t: number | undefined;
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      const list = batches.enabled && !seen(BATCHES_KEY) ? popupBatches(batches.items, Date.now()) : [];
      if (list.length) {
        t = window.setTimeout(() => { markSeen(BATCHES_KEY); setBatchList(list); }, 700);
      } else {
        scheduleEnquiry(enquiryDelay);
      }
    };
    window.addEventListener("sa:loaded", start, { once: true });
    // Fail-safe if the intro never reports back, but never while it still plays.
    const fallback = window.setTimeout(() => {
      if (!document.documentElement.classList.contains("sa-intro-running")) start();
    }, 2500);
    return () => {
      window.removeEventListener("sa:loaded", start);
      window.clearTimeout(fallback);
      window.clearTimeout(t);
      window.clearTimeout(enquiryTimer.current);
    };
    // Only on first mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeBatches = useCallback(() => {
    setBatchList(null);
    scheduleEnquiry(enquiryDelay);
  }, [scheduleEnquiry, enquiryDelay]);

  const enquireFromBatches = useCallback(() => {
    setBatchList(null);
    window.clearTimeout(enquiryTimer.current);
    markSeen(SESSION_KEY);
    open();
  }, [open]);

  // One scroll lock for both popups, so handing over from one to the other
  // never unlocks the page underneath. Only called on a real change, so it
  // never releases a lock the menu or the intro is holding.
  const anyOpen = isOpen || batchList !== null;
  const wasOpen = useRef(false);
  useEffect(() => {
    if (anyOpen === wasOpen.current) return;
    wasOpen.current = anyOpen;
    lock(anyOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anyOpen]);

  useEffect(() => {
    if (!isOpen) {
      lastFocus.current?.focus?.();
      return;
    }
    const reduce = prefersReducedMotion();
    if (card.current && backdrop.current && !reduce) {
      gsap.fromTo(backdrop.current, { opacity: 0 }, { opacity: 1, duration: 0.35 });
      gsap.fromTo(card.current, { opacity: 0, y: 40, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "expo.out" });
    }
    card.current?.querySelector<HTMLElement>("input, select, textarea")?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      // Keep Tab inside the dialog.
      if (e.key === "Tab" && card.current) {
        const f = card.current.querySelectorAll<HTMLElement>("button, a[href], input, select, textarea");
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <ModalContext.Provider value={{ open, close }}>
      {children}

      {batchList && !isOpen && <BatchesPopup batches={batchList} onClose={closeBatches} onEnquire={enquireFromBatches} />}

      {isOpen && (
        <div
          ref={backdrop}
          className="fixed inset-0 z-[70] flex items-end justify-center bg-brand-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          onMouseDown={(e) => e.target === e.currentTarget && close()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="enquiry-title"
        >
          <div
            ref={card}
            data-lenis-prevent
            className="relative max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-[24px] bg-paper shadow-[var(--shadow-lift)] sm:rounded-[24px]"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-surface text-ink shadow-[inset_0_0_0_1.5px_var(--color-line)] transition hover:bg-tint"
            >
              <XIcon size={18} weight="bold" />
            </button>

            <div className="p-5 sm:p-8">
              <div className="flex items-center gap-3 pr-12">
                <LogoMark className="h-11 w-11 shrink-0" />
                <div>
                  <p id="enquiry-title" className="font-display text-2xl font-extrabold leading-tight tracking-tight text-ink">
                    {popup.title}
                  </p>
                  <p className="text-sm text-muted">{popup.subtitle}</p>
                </div>
              </div>
              {popup.body && (
                <div className="rich-html mt-3 text-sm leading-snug text-ink-2 sm:text-[0.95rem] sm:leading-normal" data-i18n="html" dangerouslySetInnerHTML={{ __html: popup.body }} />
              )}
              <div className="mt-4 sm:mt-6">
                <ContactForm compact config={form} phone={phone} presetEntry={preset} />
              </div>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}
