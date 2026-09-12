/** Hero showcase slides. Plain data, importable from BOTH server and client.
 *  (Values exported from a "use client" module become client references on the
 *  server, so this must live outside the component file.) */
export type HeroSlide = {
  image: string;
  /** Person's name, if the photo is of a specific alumnus (optional). */
  name?: string;
  /** Force or centre shown in the caption, e.g. "CRPF". */
  academy?: string;
  /** Second caption line, e.g. "Republic Day contingent". */
  term?: string;
};

/** The academy's result posters (stored in R2 under hero/), newest first.
 *  Only posters of selected students: info cards and flyers stay out. */
export const HERO_SLIDES: HeroSlide[] = [
  { image: "hero/navy-selections-july-2026.webp", academy: "Indian Navy selections", term: "July 2026" },
  { image: "hero/air-force-army-selections-june-2026.webp", academy: "Air Force and Army selections", term: "June 2026" },
  { image: "hero/selections-january-2026.webp", academy: "Bank, Army, Navy and CAPF selections", term: "January 2026" },
  { image: "hero/air-force-selections-2025.webp", academy: "Indian Air Force selections", term: "2025" },
  { image: "hero/army-selections-2025.webp", academy: "Indian Army selections", term: "2025" },
  { image: "hero/final-result-april-2025.webp", academy: "Bank, Army, Navy, SSC CGL and OSSC results", term: "April 2025" },
  { image: "hero/results-2024.webp", academy: "ASO, OSSSC, Army and Navy results", term: "2024" },
];

const EXTRA_ALT: Record<string, string> = {
  "hero/result-collage-2025-26.webp": "Samantroy Academy results 2025-26: Air Force, Army, Navy, CAPF and Bank selections",
  "hero/result-collage-2024-25.webp": "Samantroy Academy results 2024-25: AFCAT AIR 183, Army ACC AIR 26, Navy, Army and fire service selections",
};

/** Descriptive alt text for a poster, from its hero caption when it has one. */
export function posterAlt(src: string, i = 0): string {
  const slide = HERO_SLIDES.find((s) => s.image === src);
  if (slide) return `Samantroy Academy poster: ${[slide.academy, slide.term].filter(Boolean).join(", ")}`;
  return EXTRA_ALT[src] ?? `Samantroy Academy results poster ${i + 1}`;
}

/** Result posters for the results rail and the gallery. */
export const RESULT_POSTERS: string[] = [
  "hero/navy-selections-july-2026.webp",
  "hero/air-force-army-selections-june-2026.webp",
  "hero/selections-january-2026.webp",
  "hero/army-selections-2025.webp",
  "hero/air-force-selections-2025.webp",
  "hero/final-result-april-2025.webp",
  "hero/results-2024.webp",
];
