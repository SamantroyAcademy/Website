"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ChatCircleDotsIcon, XIcon, PaperPlaneRightIcon } from "@phosphor-icons/react";
import { LogoMark } from "@/components/Logo";
import { useContactModal } from "./ModalProvider";
import { prefersReducedMotion } from "@/components/motion/MotionProvider";

type LinkItem = { label: string; href: string; download?: boolean; action?: "enquire" };
type Msg = { from: "bot" | "user"; text: string; links?: LinkItem[] };
type Entry = { id: string; keys: string[]; a: string; links?: LinkItem[] };

export type ChatSettings = {
  whatsapp: string;
  phone: string;
  contactName?: string;
  address: string;
  email: string;
  brochure: string;
  brochureOn: boolean;
  batchOffline: string;
  batchOnline: string;
};

/** Keyword-scored answers. Plain text only (no emoji), links go to the pages
 *  that actually hold the answer so the bot never has to invent numbers. */
function knowledge(s: ChatSettings): Entry[] {
  return [
    {
      id: "greeting",
      keys: ["hi", "hello", "hey", "namaste", "jai hind", "namaskar"],
      a: "Jai Hind. I can help with exams you can apply for, height and running standards, batches, fees and free mock tests. Pick a question below or type your own.",
    },
    {
      id: "eligible",
      keys: ["eligible", "eligibility", "can i apply", "qualify", "age limit", "which exam", "after 10th", "after 12th"],
      a: "The Eligibility Finder checks your age, education, height, chest and category against every exam we coach for, and shows the ones you are close to as well.",
      links: [{ label: "Open the Eligibility Finder", href: "/eligibility" }],
    },
    {
      id: "height",
      keys: ["height", "chest", "short", "cm", "weight", "pst", "physical standard"],
      a: "Height and chest standards depend on the exam, your category and sometimes your region. ST candidates get relaxation in most forces. The Standards page has the tables and a calculator.",
      links: [{ label: "Check physical standards", href: "/standards" }],
    },
    {
      id: "running",
      keys: ["run", "running", "1600", "1.6", "5 km", "pet", "race", "timing", "beam", "pull up", "long jump", "high jump", "ditch"],
      a: "Run distance and cut-off time change by exam: 1.6 km for Army and Navy, 5 km for SSC GD men, 1000 m for RRB Group D. Our ground batch times every run against your exam's cut-off.",
      links: [{ label: "See run timings by exam", href: "/standards" }, { label: "Physical Training Batch", href: "/courses" }],
    },
    {
      id: "exams",
      keys: ["exam", "agniveer", "ssc gd", "navy", "ssr", "mr", "air force", "airman", "x group", "y group", "odisha police", "constable", "railway", "rrb", "group d", "rpf", "bsf", "crpf", "cisf", "bank", "ibps", "sbi", "clerk", "ossc", "osssc", "opsc", "aso", "cgl", "nda", "cds", "afcat", "tes", "ncc"],
      a: "Army (Agniveer GD, Technical, Clerk), Navy SSR and MR, Air Force X and Y, SSC GD for BSF, CRPF, CISF, ITBP and SSB, Odisha Police Constable and SI, OSSC, OSSSC, OPSC and ASO, Bank PO and Clerk, Railway (RRB) and SSC CGL. Officer entries too: NDA, TES, CDS, AFCAT and NCC. Each exam has its own page with eligibility and pattern.",
      links: [{ label: "Browse all exams", href: "/exams" }],
    },
    {
      id: "process",
      keys: ["process", "stages", "selection process", "how selection", "steps", "document", "medical", "merit"],
      a: "Every recruitment follows seven stages: application, written exam, physical standard test, physical efficiency test, document verification, medical and merit list.",
      links: [{ label: "See all seven stages", href: "/recruitment-process" }],
    },
    {
      id: "streams",
      keys: ["arts", "commerce", "science", "stream", "+2", "graduation", "graduate"],
      a: "Arts and Commerce students can apply for Air Force Y group, Navy MR, Army GD and SSC GD. Science students add Navy SSR, Air Force X and Army Technical. Graduates add Bank, SSC CGL, OSSC, OPSC, SI, CDS and AFCAT. You can join after +2 or after graduation.",
      links: [{ label: "Check my eligibility", href: "/eligibility" }],
    },
    {
      id: "about",
      keys: ["about", "since", "how old", "who", "samantroy", "director", "debesh"],
      a: `Samantroy Academy for Defence Career Studies has trained aspirants in Brahmapur (Ganjam) since 2001, with 4000+ recruitments. Call ${s.contactName || "the academy"} on ${s.phone}.`,
      links: [{ label: "About the academy", href: "/about" }],
    },
    {
      id: "batches",
      keys: ["batch", "date", "when", "start", "next batch", "timing", "schedule", "join"],
      a: `${s.batchOffline}\n\n${s.batchOnline}`,
      links: [{ label: "View courses", href: "/courses" }, { label: "Ask on WhatsApp", href: s.whatsapp }],
    },
    {
      id: "fees",
      keys: ["fee", "fees", "price", "cost", "charge", "how much", "payment", "rupee", "discount"],
      a: "Fees depend on the batch (complete selection, written only or physical only) and on hostel. A trainer confirms the current fee on a free counselling call.",
      links: [{ label: "Book free counselling", href: "#", action: "enquire" }, { label: "Ask on WhatsApp", href: s.whatsapp }],
    },
    {
      id: "hostel",
      keys: ["hostel", "stay", "room", "food", "mess", "accommodation", "outstation"],
      a: "Many aspirants join from outside Brahmapur. Call or WhatsApp the academy and we will help you find accommodation near the centre.",
      links: [{ label: "Ask on WhatsApp", href: s.whatsapp }],
    },
    {
      id: "mock",
      keys: ["mock", "test", "practice", "question", "quiz", "cbt"],
      a: "Take a free timed mock with negative marking and instant score. No sign-up needed.",
      links: [{ label: "Start a free mock test", href: "/mock-tests" }],
    },
    {
      id: "notes",
      keys: ["notes", "pdf", "syllabus", "previous paper", "study material", "download", "resources"],
      a: "Syllabus PDFs, previous papers and video lessons are free in the Resources section.",
      links: [{ label: "Open Resources", href: "/resources" }],
    },
    {
      id: "brochure",
      keys: ["brochure", "prospectus"],
      a: s.brochureOn ? "Here is our brochure with courses, batches and facilities." : "We will share the brochure on a quick call.",
      links: [s.brochureOn ? { label: "Download the brochure", href: s.brochure, download: true } : { label: "Book free counselling", href: "#", action: "enquire" }],
    },
    {
      id: "results",
      keys: ["result", "selected", "selection", "success", "topper", "how many"],
      a: "4000+ recruitments since 2001, across the Army, Navy, Air Force, CAPF, Odisha Police, Bank, Railway, SSC and OSSC/OSSSC. Recent names and photos are on the Wall of Selection.",
      links: [{ label: "See the Wall of Selection", href: "/selected" }],
    },
    {
      id: "contact",
      keys: ["contact", "address", "location", "where", "phone", "call", "email", "reach", "visit"],
      a: `${s.address}\nPhone: ${s.phone}${s.email ? `\nEmail: ${s.email}` : ""}`,
      links: [{ label: "Chat on WhatsApp", href: s.whatsapp }, { label: "Contact page", href: "/contact" }],
    },
  ];
}

const QUICK: { label: string; id: string }[] = [
  { label: "Which exams can I apply for?", id: "eligible" },
  { label: "Height and chest standards", id: "height" },
  { label: "Run timings", id: "running" },
  { label: "Next batch", id: "batches" },
  { label: "Fees", id: "fees" },
  { label: "Free mock test", id: "mock" },
];

export default function ChatBot({ settings }: { settings: ChatSettings }) {
  const KB = knowledge(settings);
  const byId = (id: string) => KB.find((e) => e.id === id)!;
  const toMsg = (e: Entry): Msg => ({ from: "bot", text: e.a, links: e.links });

  const { open: openEnquiry } = useContactModal();
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const body = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  function answer(text: string): Msg {
    const q = ` ${text.toLowerCase()} `;
    let best: Entry | null = null;
    let score = 0;
    for (const e of KB) {
      let s = 0;
      for (const k of e.keys) if (q.includes(k)) s = Math.max(s, k.length);
      if (s > score) { score = s; best = e; }
    }
    if (best) return toMsg(best);
    return {
      from: "bot",
      text: "I did not catch that. I can help with eligibility, physical standards, batches, fees and mock tests. For anything else, a trainer can answer on WhatsApp.",
      links: [{ label: "Chat on WhatsApp", href: settings.whatsapp }, { label: "Book free counselling", href: "#", action: "enquire" }],
    };
  }

  useEffect(() => {
    const t = window.setTimeout(() => setShow(true), 3000);
    const onOpen = () => setOpen(true);
    window.addEventListener("sa:chat", onOpen);
    return () => { window.clearTimeout(t); window.removeEventListener("sa:chat", onOpen); };
  }, []);

  useEffect(() => {
    if (open && msgs.length === 0) setMsgs([toMsg(byId("greeting"))]);
    if (open && panel.current && !prefersReducedMotion()) {
      gsap.fromTo(panel.current, { opacity: 0, y: 20, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "expo.out" });
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    body.current?.scrollTo({ top: body.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  const push = (label: string, reply: Msg) => {
    setMsgs((m) => [...m, { from: "user", text: label }]);
    window.setTimeout(() => setMsgs((m) => [...m, reply]), 320);
  };

  const linkCls = "rounded-full bg-accent px-3.5 py-1.5 text-center text-xs font-semibold text-white transition hover:bg-accent-600";

  return (
    <>
      {/* Desktop launcher (mobile opens from the action bar) */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close assistant" : "Open assistant"}
        aria-expanded={open}
        className={`fixed bottom-6 left-6 z-40 hidden h-14 w-14 items-center justify-center rounded-full bg-surface text-brand-700 shadow-[var(--shadow-lift),inset_0_0_0_1.5px_var(--color-line)] transition-all duration-500 hover:bg-tint md:flex ${
          show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
        }`}
      >
        {open ? <XIcon size={22} weight="bold" /> : <ChatCircleDotsIcon size={26} weight="duotone" />}
      </button>

      {open && (
        <div
          ref={panel}
          role="dialog"
          aria-label="Samantroy Academy assistant"
          className="fixed inset-x-3 bottom-[4.75rem] z-[60] flex h-[min(34rem,72dvh)] flex-col overflow-hidden rounded-[22px] bg-paper shadow-[var(--shadow-lift),inset_0_0_0_1px_var(--color-line)] md:inset-x-auto md:bottom-24 md:left-6 md:w-[24rem]"
        >
          <div className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3">
            <LogoMark className="h-9 w-9" />
            <div className="flex-1 leading-tight">
              <p className="font-display text-base font-bold text-ink">Samantroy assistant</p>
              <p className="text-xs text-muted">Instant answers, or a trainer on WhatsApp</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full text-ink-2 hover:bg-tint">
              <XIcon size={18} weight="bold" />
            </button>
          </div>

          <div ref={body} data-lenis-prevent className="flex-1 space-y-3 overflow-y-auto px-3 py-4" aria-live="polite">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[86%] rounded-[18px] px-3.5 py-2.5 text-[0.9rem] leading-relaxed ${
                  m.from === "user" ? "rounded-br-md bg-brand-800 text-surface" : "rounded-bl-md bg-surface text-ink shadow-[inset_0_0_0_1px_var(--color-line)]"
                }`}>
                  <p className="whitespace-pre-line">{m.text}</p>
                  {m.links && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {m.links.map((l) => {
                        if (l.action === "enquire") {
                          return <button key={l.label} type="button" onClick={() => { setOpen(false); openEnquiry(); }} className={linkCls}>{l.label}</button>;
                        }
                        const external = /^https?:/.test(l.href);
                        if (!external && !l.download) {
                          return <Link key={l.label} href={l.href} onClick={() => setOpen(false)} className={linkCls}>{l.label}</Link>;
                        }
                        return (
                          <a key={l.label} href={l.href} className={linkCls}
                            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                            {...(l.download ? { download: true } : {})}>
                            {l.label}
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div data-lenis-prevent className="rail flex gap-2 overflow-x-auto border-t border-line px-3 py-2">
            {QUICK.map((q) => (
              <button key={q.id} type="button" onClick={() => push(q.label, toMsg(byId(q.id)))}
                className="shrink-0 rounded-full bg-surface px-3 py-1.5 text-xs font-semibold text-ink-2 shadow-[inset_0_0_0_1px_var(--color-line)] transition hover:text-ink">
                {q.label}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); const t = input.trim(); if (!t) return; setInput(""); push(t, answer(t)); }}
            className="flex items-center gap-2 border-t border-line bg-surface px-3 py-2.5"
          >
            <label htmlFor="chat-input" className="sr-only">Type your question</label>
            <input id="chat-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about height, batches, fees"
              className="field min-h-0 py-2.5 text-sm" />
            <button type="submit" aria-label="Send" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-white transition hover:bg-accent-600">
              <PaperPlaneRightIcon size={18} weight="bold" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
