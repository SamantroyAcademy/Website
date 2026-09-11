"use client";

import { useEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { gsap } from "gsap";
import { useMotion } from "@/components/motion/MotionProvider";

gsap.registerPlugin(ScrollTrigger);

/** Sticky stage index: highlights the stage being read and jumps on click. */
export default function StageIndex({ stages }: { stages: { id: string; code: string; title: string }[] }) {
  const [active, setActive] = useState(stages[0]?.id);
  const { scrollTo } = useMotion();

  useEffect(() => {
    const triggers = stages.map((s) =>
      ScrollTrigger.create({
        trigger: `#${s.id}`,
        start: "top 45%",
        end: "bottom 45%",
        onToggle: (self) => self.isActive && setActive(s.id),
      }),
    );
    return () => triggers.forEach((t) => t.kill());
  }, [stages]);

  return (
    <nav aria-label="Stages" className="lg:sticky lg:top-28">
      <ol className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0 rail" data-lenis-prevent>
        {stages.map((s) => {
          const on = s.id === active;
          return (
            <li key={s.id} className="shrink-0">
              <a
                href={`#${s.id}`}
                onClick={(e) => { e.preventDefault(); scrollTo(`#${s.id}`, { offset: -110 }); }}
                aria-current={on ? "step" : undefined}
                className={`flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors lg:rounded-[14px] ${
                  on ? "bg-ink text-surface" : "bg-surface text-ink-2 shadow-[inset_0_0_0_1px_var(--color-line)] hover:text-ink lg:bg-transparent lg:shadow-none"
                }`}
              >
                <span className={`font-stencil text-base ${on ? "text-accent" : "text-muted"}`}>{s.code}</span>
                <span className="whitespace-nowrap lg:whitespace-normal">{s.title}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
