import type { GoogleReview } from "@/lib/homepage-defaults";

/** Enough to show: a reviewer, and words or photos. */
export const showable = (r: Pick<GoogleReview, "name" | "text" | "photos">) =>
  Boolean(r.name?.trim() && (r.text?.trim() || r.photos?.length));

/** Same person and same opening words = same review. */
const sig = (r: Pick<GoogleReview, "name" | "text">) => `${(r.name ?? "").trim().toLowerCase()}|${(r.text ?? "").trim().slice(0, 60).toLowerCase()}`;

/** Put one fetched review on top, replacing an older copy of it (same link,
 *  or same person and words). */
export function upsertReview(list: GoogleReview[], r: GoogleReview): GoogleReview[] {
  const same = (x: GoogleReview) => (x.url && x.url.trim() === r.url.trim()) || sig(x) === sig(r);
  return [r, ...list.filter((x) => !same(x))];
}

/** New reviews first, then the existing list; nothing already there twice. */
export function mergeReviews(existing: GoogleReview[], incoming: GoogleReview[], cap = 30): { items: GoogleReview[]; added: number } {
  const seen = new Set(existing.map(sig));
  const fresh = incoming.filter((r) => showable(r) && !seen.has(sig(r)));
  return { items: [...fresh, ...existing].slice(0, cap), added: fresh.length };
}

/** Cards the website cannot show: a link or photo but no reviewer, or no
 *  words and no photos.
 *  Returns their positions (1-based) so the admin can be told, instead of the
 *  card vanishing silently on save. Wholly empty cards are simply dropped. */
export function incompleteReviews(items: GoogleReview[]): number[] {
  return items.flatMap((r, i) => {
    const has = (v?: string) => Boolean(v && v.trim());
    const any = has(r.name) || has(r.text) || has(r.url) || has(r.avatar) || Boolean(r.photos?.length);
    return any && !showable(r) ? [i + 1] : [];
  });
}
