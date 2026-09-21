"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import Portrait from "@/components/ui/Portrait";
import type { Candidate } from "@/lib/public-data";

const PAGE = 24;

/** Full Wall of Selection with force / exam filters and paged loading from
 *  the published view (a "Show more" button rather than infinite scroll,
 *  so the footer stays reachable). */
export default function SelectedWall({ initial, sample }: { initial: Candidate[]; sample: boolean }) {
  const [items, setItems] = useState<Candidate[]>(initial);
  const [done, setDone] = useState(sample || initial.length < PAGE);
  const [busy, setBusy] = useState(false);
  const [force, setForce] = useState("all");

  const forces = useMemo(() => ["all", ...new Set(items.map((c) => c.force).filter(Boolean) as string[])], [items]);
  const shown = force === "all" ? items : items.filter((c) => c.force === force);

  async function more() {
    if (busy || done || !isSupabaseConfigured()) return;
    setBusy(true);
    const { data, error } = await createClient()
      .from("published_selected_candidates")
      .select("id, name, exam, post, force, year, image_path, selected_on, hometown")
      .order("sort_order", { ascending: true })
      .order("selected_on", { ascending: false, nullsFirst: false })
      .range(items.length, items.length + PAGE - 1);
    if (error || !data) setDone(true);
    else {
      setItems((p) => [...p, ...(data as Candidate[])]);
      if (data.length < PAGE) setDone(true);
    }
    setBusy(false);
  }

  return (
    <div>
      {forces.length > 2 && (
        <div className="rail -mx-5 mb-8 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
          {forces.map((f) => (
            <button key={f} type="button" onClick={() => setForce(f)} aria-pressed={force === f}
              className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold ${force === f ? "bg-ink text-surface" : "bg-surface text-ink-2 shadow-[inset_0_0_0_1.5px_var(--color-line)]"}`}>
              {f === "all" ? "Everyone" : f}
            </button>
          ))}
        </div>
      )}
      <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
        {shown.map((c, i) => (
          <li key={(c.id ?? c.name) + i}>
            <Portrait src={c.image_path} name={c.name} className="aspect-[4/5]" sizes="(min-width: 1024px) 16vw, 50vw" />
            <p translate="no" className="mt-3 font-display text-lg font-bold leading-tight tracking-tight text-ink">{c.name}</p>
            <p className="mt-0.5 text-sm font-medium text-ink-2">{[c.post || c.exam, c.year].filter(Boolean).join(", ")}</p>
            {c.hometown && <p translate="no" className="mt-0.5 text-[0.8rem] text-muted">{c.hometown}</p>}
          </li>
        ))}
      </ul>
      {!done && (
        <div className="mt-12 text-center">
          <button type="button" onClick={more} disabled={busy} className="btn btn-ghost">{busy ? "Loading" : "Show more"}</button>
        </div>
      )}
    </div>
  );
}
