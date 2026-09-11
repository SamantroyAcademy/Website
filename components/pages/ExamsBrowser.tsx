"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { VERTICALS, type Vertical } from "@/lib/exams";

type Item = { slug: string; name: string; short: string; force: string; vertical: Vertical; card: ReactNode };

/** Filter chips (synced to ?vertical= so nav links and shared URLs work) and
 *  an instant search over name, short name and force. Cards are rendered on
 *  the server and passed in, so this only decides which ones show. */
export default function ExamsBrowser({ items }: { items: Item[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initial = params.get("vertical") as Vertical | null;
  const [vertical, setVertical] = useState<Vertical | "all">(initial && VERTICALS.some((v) => v.key === initial) ? initial : "all");
  const [q, setQ] = useState("");

  const choose = (v: Vertical | "all") => {
    setVertical(v);
    const next = new URLSearchParams(params.toString());
    if (v === "all") next.delete("vertical"); else next.set("vertical", v);
    router.replace(`${pathname}${next.toString() ? `?${next}` : ""}`, { scroll: false });
  };

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((i) =>
      (vertical === "all" || i.vertical === vertical) &&
      (!needle || `${i.name} ${i.short} ${i.force}`.toLowerCase().includes(needle)));
  }, [items, vertical, q]);

  const counts = useMemo(() => Object.fromEntries(VERTICALS.map((v) => [v.key, items.filter((i) => i.vertical === v.key).length])), [items]);

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="rail -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="Filter exams" data-lenis-prevent>
          {[{ key: "all" as const, short: "All exams" }, ...VERTICALS].map((v) => {
            const on = vertical === v.key;
            const n = v.key === "all" ? items.length : counts[v.key] ?? 0;
            if (v.key !== "all" && n === 0) return null;
            return (
              <button key={v.key} type="button" role="tab" aria-selected={on} onClick={() => choose(v.key)}
                className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${on ? "bg-ink text-surface" : "bg-surface text-ink-2 shadow-[inset_0_0_0_1.5px_var(--color-line)] hover:text-ink"}`}>
                {v.short} <span className={on ? "text-brand-200" : "text-muted"}>{n}</span>
              </button>
            );
          })}
        </div>
        <label className="relative block lg:w-80">
          <span className="sr-only">Search exams</span>
          <MagnifyingGlassIcon size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search, e.g. SSC GD, Navy" className="field rounded-full pl-11" />
        </label>
      </div>

      {shown.length ? (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
          {shown.map((i) => <li key={i.slug}>{i.card}</li>)}
        </ul>
      ) : (
        <div className="mt-8 rounded-[var(--radius-card)] bg-surface p-10 text-center shadow-[inset_0_0_0_1px_var(--color-line)]">
          <p className="font-display text-xl font-bold text-ink">No exam matches &ldquo;{q}&rdquo;</p>
          <p className="mt-2 text-ink-2">Try a force or short name, or clear the filter.</p>
          <button type="button" onClick={() => { setQ(""); choose("all"); }} className="btn btn-ghost btn-sm mt-5">Show all exams</button>
        </div>
      )}
    </div>
  );
}
