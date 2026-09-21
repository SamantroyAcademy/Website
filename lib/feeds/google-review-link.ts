import "server-only";
import { createHash, randomBytes } from "node:crypto";
import type { GoogleReview } from "@/lib/homepage-defaults";
import { isR2Configured, putObject } from "@/lib/r2";
import { isGoogleMapsHost, monthYear, parseReviewRpc, reviewIdsFrom, reviewRpcUrl, sizedGoogleImage } from "@/lib/review-link";

/**
 * Paste a Google review's share link, get the whole review: reviewer, photo,
 * stars, words, date and any photos attached. Google's review API does not
 * look reviews up by link, so this asks Google Maps the same question its
 * own page asks when the link is opened. No key needed. Images are copied to
 * R2 so the site does not depend on Google's image links staying valid.
 */

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const MAX_PHOTOS = 3;

export type LinkFetch = { ok: true; review: GoogleReview } | { ok: false; error: string };

/** Follow a short link to the full Maps address, staying on Google hosts. */
async function expand(link: string): Promise<string> {
  let url = link;
  for (let hop = 0; hop < 6; hop++) {
    const u = new URL(url);
    if (u.protocol !== "https:" || !isGoogleMapsHost(u.hostname)) throw new Error("That is not a Google Maps link.");
    if (reviewIdsFrom(url)) return url;
    const res = await fetch(url, { redirect: "manual", headers: { "User-Agent": UA }, signal: AbortSignal.timeout(10_000), cache: "no-store" });
    const next = res.headers.get("location");
    if (!next) break;
    url = new URL(next, url).toString();
  }
  if (reviewIdsFrom(url)) return url;
  throw new Error("That link opens a place, not a single review. On Google Maps, open the review, tap Share and copy that link.");
}

/** Copy one Google image to R2; on any failure keep Google's link. */
async function keep(url: string, spec: string, key: string): Promise<string> {
  if (!url) return "";
  const sized = sizedGoogleImage(url, spec);
  if (!isR2Configured()) return sized;
  try {
    const res = await fetch(sized, { signal: AbortSignal.timeout(15_000), cache: "no-store" });
    const type = res.headers.get("content-type") || "";
    if (!res.ok || !type.startsWith("image/")) return sized;
    const bytes = new Uint8Array(await res.arrayBuffer());
    if (bytes.byteLength > 5_000_000) return sized;
    const ext = type.includes("webp") ? "webp" : type.includes("png") ? "png" : "jpg";
    const path = `${key}.${ext}`;
    return (await putObject(path, bytes, { "Content-Type": type })) ? path : sized;
  } catch {
    return sized;
  }
}

export async function fetchReviewFromLink(link: string): Promise<LinkFetch> {
  const raw = link.trim();
  if (!/^https?:\/\//i.test(raw)) return { ok: false, error: "Paste the full link, starting with https://" };
  try {
    const full = await expand(raw.replace(/^http:/i, "https:"));
    const ids = reviewIdsFrom(full)!;
    const res = await fetch(reviewRpcUrl(ids.placeId, ids.reviewId, randomBytes(16).toString("base64url").slice(0, 22)), {
      headers: { "User-Agent": UA, "Accept-Language": "en" },
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    });
    const parsed = res.ok ? parseReviewRpc(await res.text()) : null;
    if (!parsed) return { ok: false, error: "Google did not return this review. It may have been removed, or Google is busy: try again in a minute." };

    // Stable names: fetching the same review again overwrites, not duplicates.
    const tag = createHash("sha1").update(ids.reviewId).digest("hex").slice(0, 12);
    const [avatar, ...photos] = await Promise.all([
      keep(parsed.avatar, "s160-c-rw", `reviews/g-${tag}-avatar`),
      ...parsed.photos.slice(0, MAX_PHOTOS).map((p, i) => keep(p, "w800-h800-rw", `reviews/g-${tag}-${i + 1}`)),
    ]);
    return {
      ok: true,
      review: {
        url: raw,
        name: parsed.name,
        rating: parsed.rating,
        text: parsed.text,
        avatar,
        photos: photos.filter(Boolean),
        date: monthYear(parsed.publishedAt),
        publishedAt: parsed.publishedAt,
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not read that link." };
  }
}
