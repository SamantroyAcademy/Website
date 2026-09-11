"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PhoneIcon, WhatsappLogoIcon, ChatCircleDotsIcon, ArrowUpIcon, PaperPlaneTiltIcon } from "@phosphor-icons/react";
import { useContactModal } from "./ModalProvider";
import { useMotion } from "@/components/motion/MotionProvider";

gsap.registerPlugin(ScrollTrigger);

export const openChat = () => window.dispatchEvent(new Event("sa:chat"));

/** Mobile: a thumb-reach action bar (Call, WhatsApp, Ask, Enquire).
 *  Desktop: a WhatsApp button plus back-to-top once the visitor scrolls. */
export default function FloatingActions({ phoneHref, whatsapp }: { phoneHref: string; whatsapp: string }) {
  const { open } = useContactModal();
  const { scrollTo } = useMotion();
  const [scrolled, setScrolled] = useState(false);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const st = ScrollTrigger.create({ start: 600, end: "max", onToggle: (self) => setScrolled(self.isActive) });
    return () => st.kill();
  }, []);

  // Slide the mobile bar up once the intro is done.
  useEffect(() => {
    const show = () => bar.current && gsap.fromTo(bar.current, { yPercent: 100 }, { yPercent: 0, duration: 0.7, ease: "expo.out" });
    if (document.documentElement.classList.contains("sa-intro-done")) show();
    else window.addEventListener("sa:loaded", show, { once: true });
    return () => window.removeEventListener("sa:loaded", show);
  }, []);

  const item = "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[0.72rem] font-semibold text-ink-2 active:scale-95 transition-transform";

  return (
    <>
      {/* Mobile action bar */}
      <div ref={bar} className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
        <nav className="flex items-stretch" aria-label="Quick actions">
          <a href={phoneHref} className={item}>
            <PhoneIcon size={22} weight="duotone" className="text-brand-600" /> Call
          </a>
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={item}>
            <WhatsappLogoIcon size={22} weight="duotone" className="text-brand-600" /> WhatsApp
          </a>
          <button type="button" onClick={openChat} className={item}>
            <ChatCircleDotsIcon size={22} weight="duotone" className="text-brand-600" /> Ask
          </button>
          <button type="button" onClick={() => open()} className="m-1.5 flex flex-[1.3] items-center justify-center gap-1.5 rounded-full bg-accent text-[0.8rem] font-semibold text-ink active:scale-95 transition-transform">
            <PaperPlaneTiltIcon size={18} weight="bold" /> Enquire
          </button>
        </nav>
      </div>

      {/* Desktop floats */}
      <div className="fixed bottom-6 right-6 z-40 hidden flex-col items-end gap-3 md:flex">
        <button
          type="button"
          onClick={() => scrollTo(0, { offset: 0 })}
          aria-label="Back to top"
          className={`flex h-11 w-11 items-center justify-center rounded-full bg-surface text-ink shadow-[var(--shadow-card),inset_0_0_0_1.5px_var(--color-line)] transition-all duration-500 hover:bg-tint ${
            scrolled ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
          }`}
        >
          <ArrowUpIcon size={18} weight="bold" />
        </button>
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
          className="group flex h-14 items-center gap-2 rounded-full bg-brand-700 pl-4 pr-5 text-sm font-semibold text-surface shadow-[0_14px_30px_-12px_rgb(18_39_27/0.7)] transition-transform hover:-translate-y-0.5 hover:bg-brand-600"
        >
          <WhatsappLogoIcon size={24} weight="fill" /> WhatsApp
        </a>
      </div>
    </>
  );
}
