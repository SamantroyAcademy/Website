"use client";

import { useEffect, useState } from "react";
import type { CountdownItem } from "@/lib/countdown-defaults";

function parts(target: number, now: number) {
  const diff = Math.max(0, target - now);
  return {
    d: Math.floor(diff / 86_400_000),
    h: Math.floor((diff % 86_400_000) / 3_600_000),
    m: Math.floor((diff % 3_600_000) / 60_000),
    s: Math.floor((diff % 60_000) / 1000),
    done: diff === 0,
  };
}

/** Live timers, ticking once a second. The server render shows the date so
 *  nothing jumps; the numbers appear after hydration. */
export default function CountdownTicker({ items, textColor }: { items: CountdownItem[]; textColor: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const upcoming = items
    .map((it) => ({ ...it, ts: new Date(it.date + "T00:00:00+05:30").getTime() }))
    .filter((it) => !Number.isNaN(it.ts))
    .sort((a, b) => a.ts - b.ts);

  const dateLabel = (ts: number) => new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });

  return (
    <ul className={`grid gap-3 ${upcoming.length > 1 ? "sm:grid-cols-2" : ""}`} data-reveal="stagger">
      {upcoming.map((it) => {
        const p = now === null ? null : parts(it.ts, now);
        const fg = it.fg || textColor;
        return (
          <li
            key={it.label + it.date}
            className="rounded-[var(--radius-card)] p-5 sm:p-6"
            style={{ background: it.bg || "rgb(255 255 255 / 0.6)", color: fg, boxShadow: it.bg ? undefined : "inset 0 0 0 1px rgb(20 26 23 / 0.08)" }}
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-semibold">{it.label}</p>
              <p className="text-xs font-semibold opacity-70">{it.kind === "exam" ? "Exam" : "Batch"}</p>
            </div>
            {p?.done ? (
              <p className="mt-4 text-sm font-semibold opacity-80">Started on {dateLabel(it.ts)}</p>
            ) : (
              <div className="mt-4 grid grid-cols-4 gap-2" aria-label={`${it.label}: ${dateLabel(it.ts)}`}>
                {([["d", "days"], ["h", "hrs"], ["m", "min"], ["s", "sec"]] as const).map(([k, label]) => (
                  <div key={k}>
                    <p className="numeral text-[clamp(1.9rem,4vw,2.8rem)] tabular-nums" aria-hidden>
                      {p ? String(p[k]).padStart(2, "0") : "--"}
                    </p>
                    <p className="mt-1 text-xs font-medium opacity-70" aria-hidden>{label}</p>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-3 text-xs opacity-70">{dateLabel(it.ts)}</p>
          </li>
        );
      })}
    </ul>
  );
}
