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
 *  The two batch dates are from the academy's "New batch starts" poster.
 *  Exam dates must come from official notifications, so the admin adds those
 *  in Admin -> Countdown rather than us guessing them here. */
export const COUNTDOWN: CountdownDoc = {
  kicker: "",
  heading: "Next batches start in",
  bg: "#e9eaee",
  textColor: "#12151f",
  kickerColor: "#b30508",
  items: [
    { label: "NDA and other competitive exams", date: "2026-09-21", kind: "batch" },
    { label: "CDS and other competitive exams", date: "2026-10-14", kind: "batch" },
  ],
};
