import type { StandardRow } from "@/lib/standards";

const cm = (n: number | null) => (n == null ? "" : `${n} cm`);
const or = (s: string | number | null | undefined, fallback = "-") => (s === "" || s == null ? fallback : String(s));

/** Standards rows for one exam, as a readable card per row (not a hairline
 *  spreadsheet): who it applies to, the PST numbers, then the PET events. */
export default function StandardsTable({ rows }: { rows: StandardRow[] }) {
  if (!rows.length) {
    return <p className="rounded-[var(--radius-card)] bg-surface p-6 text-ink-2 shadow-[inset_0_0_0_1px_var(--color-line)]">Physical standards for this exam are set in each notification. Check the official notification, or ask us.</p>;
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {rows.map((r, i) => {
        const pet = [
          r.run_distance_m ? { k: `${r.run_distance_m >= 1000 ? r.run_distance_m / 1000 + " km" : r.run_distance_m + " m"} run`, v: r.run_time || "See notification" } : null,
          r.long_jump ? { k: "Long jump", v: r.long_jump } : null,
          r.high_jump ? { k: "High jump", v: r.high_jump } : null,
          r.beam_pullups ? { k: "Other events", v: r.beam_pullups } : null,
          r.ditch ? { k: "Ditch", v: r.ditch } : null,
          r.zigzag ? { k: "Zig-zag balance", v: r.zigzag } : null,
        ].filter(Boolean) as { k: string; v: string }[];
        return (
          <article key={(r.id ?? "") + i} className="card p-6">
            <p className="text-sm font-semibold text-ink">
              <span className="capitalize">{r.gender === "male" ? "Men" : "Women"}</span>
              {r.category !== "All" && <>, {r.category}</>}
              {r.region && <span className="font-normal text-muted">, {r.region}</span>}
              {r.label && <span className="font-normal text-muted">, {r.label}</span>}
            </p>
            <dl className="mt-4 grid grid-cols-3 gap-3">
              <div>
                <dt className="text-xs text-muted">Height</dt>
                <dd className="numeral mt-1 text-2xl text-ink">{or(cm(r.height_cm))}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Chest</dt>
                <dd className="numeral mt-1 text-2xl text-ink">{r.chest_cm ? `${r.chest_cm}` : "-"}</dd>
                {r.chest_expanded_cm ? <dd className="text-xs text-muted">{r.chest_expanded_cm} expanded</dd> : null}
              </div>
              <div>
                <dt className="text-xs text-muted">Weight</dt>
                <dd className="mt-1 text-sm font-semibold leading-tight text-ink">{or(r.weight_kg)}</dd>
              </div>
            </dl>
            {pet.length > 0 && (
              <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
                {pet.map((p) => (
                  <div key={p.k} className="flex justify-between gap-4">
                    <dt className="text-ink-2">{p.k}</dt>
                    <dd className="text-right font-semibold text-ink">{p.v}</dd>
                  </div>
                ))}
              </dl>
            )}
            {r.notes && <p className="mt-4 text-xs leading-relaxed text-muted">{r.notes}</p>}
          </article>
        );
      })}
    </div>
  );
}
