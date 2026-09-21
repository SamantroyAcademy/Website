import type { GoogleReview } from "@/lib/homepage-defaults";

/** Same person and same opening words = same review. */
const sig = (r: Pick<GoogleReview, "name" | "text">) => `${(r.name ?? "").trim().toLowerCase()}|${(r.text ?? "").trim().slice(0, 60).toLowerCase()}`;

/** New reviews first, then the existing list; nothing already there twice. */
export function mergeReviews(existing: GoogleReview[], incoming: GoogleReview[], cap = 30): { items: GoogleReview[]; added: number } {
  const seen = new Set(existing.map(sig));
  const fresh = incoming.filter((r) => r.name && r.text && !seen.has(sig(r)));
  return { items: [...fresh, ...existing].slice(0, cap), added: fresh.length };
}

/** Cards the website cannot show: a link or photo but no reviewer or words.
 *  Returns their positions (1-based) so the admin can be told, instead of the
 *  card vanishing silently on save. Wholly empty cards are simply dropped. */
export function incompleteReviews(items: GoogleReview[]): number[] {
  return items.flatMap((r, i) => {
    const has = (v?: string) => Boolean(v && v.trim());
    const any = has(r.name) || has(r.text) || has(r.url) || has(r.avatar);
    return any && !(has(r.name) && has(r.text)) ? [i + 1] : [];
  });
}
