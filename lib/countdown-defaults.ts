export type CountdownItem = { label: string; date: string; kind?: "batch" | "exam"; bg?: string; fg?: string };
export type CountdownDoc = {
  kicker: string;
  heading: string;
  /** Section background colour. */
  bg?: string;
  /** Colour for ALL text in the section. A card's own `fg` overrides it. */
  textColor?: string;
  /** Kicker colour. */
  kickerColor?: string;
  /** "off" hides the batches popup shown when the site opens. */
  popup?: "on" | "off";
  items: CountdownItem[];
};

export type PopupBatch = CountdownItem & { ts: number; days: number; status: "upcoming" | "current" };

const DAY = 86_400_000;
const IST = 5.5 * 3_600_000;

/** What the opening popup lists: every upcoming date, plus batches that
 *  started within the last `recentDays` (still "current"). Past exams are
 *  dropped. Days are whole calendar days in India time; 0 means today. */
export function popupBatches(items: CountdownItem[], now: number, recentDays = 45, max = 4): PopupBatch[] {
  const today = Math.floor((now + IST) / DAY) * DAY - IST;
  return items
    .filter((it) => it?.label && it?.date)
    .map((it) => {
      const ts = new Date(it.date + "T00:00:00+05:30").getTime();
      const days = Math.round((ts - today) / DAY);
      return { ...it, ts, days, status: days >= 0 ? ("upcoming" as const) : ("current" as const) };
    })
    .filter((it) => !Number.isNaN(it.ts) && (it.days >= 0 || (it.kind === "batch" && -it.days <= recentDays)))
    .sort((a, b) => a.ts - b.ts)
    .slice(0, max);
}

/** Fallback shown before the CMS is populated. Dates are ISO (YYYY-MM-DD).
 *  The two batch dates are from the academy's "New batch starts" poster.
 *  Exam dates must come from official notifications, so the admin adds those
 *  in Admin -> Countdown rather than us guessing them here. */
export const COUNTDOWN: CountdownDoc = {
  kicker: "",
  heading: "Next batches start in",
  bg: "#e9eaee",
  textColor: "#12151f",
  kickerColor: "#b30508",
  popup: "on",
  items: [
    { label: "NDA and other competitive exams", date: "2026-09-21", kind: "batch" },
    { label: "CDS and other competitive exams", date: "2026-10-14", kind: "batch" },
  ],
};
