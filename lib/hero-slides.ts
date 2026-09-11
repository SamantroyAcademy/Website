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

export const HERO_SLIDES: HeroSlide[] = [
  { image: "/images/scenes/army-parade.jpg", academy: "Indian Army", term: "Republic Day contingent" },
  { image: "/images/forces/crpf-contingent.jpg", academy: "CRPF", term: "Republic Day contingent" },
  { image: "/images/forces/navy-contingent.jpg", academy: "Indian Navy", term: "Republic Day contingent" },
  { image: "/images/forces/bsf-contingent.jpg", academy: "BSF", term: "Republic Day contingent" },
];
