"use client";

import { useEffect, useRef, useState } from "react";
import Link from "@/components/ui/Link";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CaretDownIcon, ListIcon, XIcon, PhoneIcon, WhatsappLogoIcon, ArrowRightIcon } from "@phosphor-icons/react";
import Logo from "@/components/Logo";
import LanguageToggle from "@/components/i18n/LanguageToggle";
import { NAV, isNavGroup, type NavGroup } from "@/lib/data";
import { useContactModal } from "./ModalProvider";
import { useMotion, prefersReducedMotion } from "@/components/motion/MotionProvider";

gsap.registerPlugin(ScrollTrigger);

const CTA_LABEL = "Book free counselling";

function isActiveHref(pathname: string, href: string) {
  const path = href.split("?")[0];
  return path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(path + "/");
}

function Dropdown({ group, pathname }: { group: NavGroup; pathname: string }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const active = group.items.some((i) => isActiveHref(pathname, i.href));

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!panel.current) return;
    if (open) {
      gsap.fromTo(panel.current, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: prefersReducedMotion() ? 0 : 0.35, ease: "expo.out" });
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) {
      document.addEventListener("keydown", onKey);
      document.addEventListener("mousedown", onDown);
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  const enter = () => { window.clearTimeout(timer.current); setOpen(true); };
  const leave = () => { timer.current = window.setTimeout(() => setOpen(false), 140); };

  return (
    <div ref={wrap} className="relative" onMouseEnter={enter} onMouseLeave={leave}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 rounded-full px-3.5 py-2 text-[0.94rem] font-medium transition-colors ${
          active ? "text-ink" : "text-ink-2 hover:text-ink"
        }`}
      >
        {group.label}
        <CaretDownIcon size={13} weight="bold" className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div ref={panel} className="absolute left-1/2 top-full z-10 w-[23rem] -translate-x-1/2 pt-3">
          <ul className="card grid gap-0.5 p-2">
            {group.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`group flex items-start justify-between gap-4 rounded-[14px] px-4 py-3 transition-colors hover:bg-tint ${
                    isActiveHref(pathname, item.href) && !item.href.includes("?") ? "bg-tint" : ""
                  }`}
                >
                  <span>
                    <span className="block text-[0.95rem] font-semibold text-ink">{item.label}</span>
                    {item.desc && <span className="mt-0.5 block text-sm text-muted">{item.desc}</span>}
                  </span>
                  <ArrowRightIcon size={16} className="arrow mt-1 shrink-0 text-brand-500 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function Navbar({ phone, phoneHref, whatsapp }: { phone: string; phoneHref: string; whatsapp: string }) {
  const pathname = usePathname();
  const { open: openModal } = useContactModal();
  const { lock } = useMotion();
  const bar = useRef<HTMLElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pill = scrolled && !menu;

  // Always visible (sticky); turns into a floating glass pill once the page
  // scrolls; progress hairline across the top.
  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        if (progress.current) gsap.set(progress.current, { scaleX: self.progress });
        setScrolled(self.scroll() > 24);
      },
    });
    return () => st.kill();
  }, []);

  // Route change: close menu, reveal bar.
  useEffect(() => {
    setMenu(false);
    if (bar.current) gsap.set(bar.current, { yPercent: 0 });
  }, [pathname]);

  // Mobile sheet: lock scroll + stagger the links in.
  useEffect(() => {
    lock(menu);
    if (menu && sheet.current && !prefersReducedMotion()) {
      gsap.fromTo(sheet.current.querySelectorAll("[data-menu-item]"), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: "expo.out", stagger: 0.04 });
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    if (menu) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menu]);

  return (
    <>
      <header
        ref={bar}
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,padding] duration-500 ${
          menu ? "bg-paper" : pill ? "px-3 pt-2.5 sm:px-5 sm:pt-3" : "bg-transparent"
        }`}
      >
        <div ref={progress} aria-hidden className="absolute inset-x-0 top-0 z-10 h-[2px] origin-left scale-x-0 bg-accent" />
        <nav
          className={`mx-auto flex items-center justify-between gap-3 transition-[max-width,height,padding,border-radius,background-color,box-shadow] duration-500 ease-[var(--ease-out-expo)] ${
            pill
              ? "h-14 max-w-[1320px] rounded-full bg-paper/70 px-2.5 pl-3 shadow-[0_10px_34px_-14px_rgb(12_18_38/0.45),inset_0_0_0_1px_rgb(255_255_255/0.7),0_0_0_1px_rgb(12_18_38/0.06)] backdrop-blur-xl backdrop-saturate-150 sm:px-3 sm:pl-4"
              : "h-16 max-w-[1320px] px-5 sm:px-8 lg:h-[68px]"
          }`}
          aria-label="Primary"
        >
          <Logo />

          <div className="hidden items-center gap-0.5 whitespace-nowrap navwide:flex">
            {NAV.map((entry) =>
              isNavGroup(entry) ? (
                <Dropdown key={entry.label} group={entry} pathname={pathname} />
              ) : (
                <Link
                  key={entry.href}
                  href={entry.href}
                  aria-current={isActiveHref(pathname, entry.href) ? "page" : undefined}
                  className={`relative rounded-full px-3.5 py-2 text-[0.94rem] font-medium transition-colors ${
                    isActiveHref(pathname, entry.href) ? "text-ink" : "text-ink-2 hover:text-ink"
                  }`}
                >
                  {entry.label}
                  {isActiveHref(pathname, entry.href) && <span aria-hidden className="absolute inset-x-3.5 -bottom-0.5 h-[2px] rounded-full bg-accent" />}
                </Link>
              ),
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5 whitespace-nowrap sm:gap-2">
            <LanguageToggle />
            <a href={phoneHref} translate="no" className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-ink-2 hover:text-ink navphone:flex">
              <PhoneIcon size={17} weight="duotone" className="text-brand-600" />
              {phone}
            </a>
            <button type="button" onClick={() => openModal()} className="btn btn-primary btn-sm hidden sm:inline-flex">
              {CTA_LABEL}
            </button>
            <button
              type="button"
              onClick={() => setMenu((v) => !v)}
              aria-expanded={menu}
              aria-controls="mobile-menu"
              aria-label={menu ? "Close menu" : "Open menu"}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-ink shadow-[inset_0_0_0_1.5px_var(--color-line)] navwide:hidden"
            >
              {menu ? <XIcon size={20} weight="bold" /> : <ListIcon size={20} weight="bold" />}
            </button>
          </div>
        </nav>
      </header>

      {menu && (
        <div
          id="mobile-menu"
          ref={sheet}
          data-lenis-prevent
          className="fixed inset-0 z-40 overflow-y-auto bg-paper pt-20 navwide:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div className="container-x pb-32">
            <ul className="divide-y divide-line border-y border-line">
              {NAV.map((entry) =>
                isNavGroup(entry) ? (
                  <li key={entry.label} data-menu-item className="py-4">
                    <p className="text-xs font-semibold tracking-wide text-muted">{entry.label}</p>
                    <ul className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
                      {entry.items.map((i) => (
                        <li key={i.href}>
                          <Link href={i.href} className="block py-1.5 font-display text-2xl font-bold tracking-tight text-ink">
                            {i.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                ) : (
                  <li key={entry.href} data-menu-item>
                    <Link href={entry.href} className="flex items-center justify-between py-4 font-display text-3xl font-bold tracking-tight text-ink">
                      {entry.label}
                      <ArrowRightIcon size={22} className="text-brand-500" />
                    </Link>
                  </li>
                ),
              )}
              <li data-menu-item>
                <Link href="/contact" className="flex items-center justify-between py-4 font-display text-3xl font-bold tracking-tight text-ink">
                  Contact
                  <ArrowRightIcon size={22} className="text-brand-500" />
                </Link>
              </li>
            </ul>
            <div data-menu-item className="mt-8 grid gap-3">
              <button type="button" onClick={() => { setMenu(false); openModal(); }} className="btn btn-primary w-full">
                {CTA_LABEL}
              </button>
              <div className="grid grid-cols-2 gap-3">
                <a href={phoneHref} className="btn btn-ghost">
                  <PhoneIcon size={18} /> Call
                </a>
                <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                  <WhatsappLogoIcon size={18} /> WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
