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
  items: CountdownItem[];
};

/** Fallback shown before the CMS is populated. Dates are ISO (YYYY-MM-DD).
 *  Only the academy's own batch dates ship as defaults (placeholders). Exam
 *  dates must come from official notifications, so the admin adds those in
 *  Admin -> Countdown rather than us guessing them here. */
export const COUNTDOWN: CountdownDoc = {
  kicker: "",
  heading: "Next batches start in",
  bg: "#e8ebe4",
  textColor: "#141a17",
  kickerColor: "#2d553c",
  items: [
    { label: "Next offline batch", date: "2026-10-01", kind: "batch" },
    { label: "Next online batch", date: "2026-10-05", kind: "batch" },
  ],
};
