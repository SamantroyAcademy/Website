/** The two YouTube sections on the homepage. Plain data, safe for server and
 *  client.
 *
 *  Success stories (CMS: shorts): Prasanta Nayak's channel, which is mostly
 *  selection and result videos. Educational videos (CMS: edu_videos): the
 *  Samantroy Academy channel (classes, current affairs, information).
 *
 *  Both default to "auto": the channel's newest uploads, straight from its
 *  public feed, minus any the admin hid. "manual" shows a hand-picked list
 *  instead (Success stories: its own list; Educational: the Resources videos). */

export type ShortItem = { id: string; title: string; url: string };
export type FeedMode = "auto" | "manual";
export type ShortsDoc = {
  channelUrl: string;
  items: ShortItem[];
  mode?: FeedMode;
  /** How many videos the section shows. */
  limit?: number;
  /** Video ids never to show. */
  hidden?: string[];
};

export type EduVideosDoc = {
  channelUrl: string;
  mode?: FeedMode;
  /** Full videos in the grid. */
  limit?: number;
  /** Shorts in the strip under the grid (0 hides the strip). */
  shortsLimit?: number;
  hidden?: string[];
};

/** Success stories: Prasanta Nayak's channel. */
export const SHORTS_CHANNEL = "https://www.youtube.com/@prasantanayakmotivation1873";
/** Educational videos: the Samantroy Academy channel. */
export const EDU_CHANNEL = "https://www.youtube.com/@samantroyacademy5722";

export const EDU_DOC: EduVideosDoc = { channelUrl: EDU_CHANNEL, mode: "auto", limit: 6, shortsLimit: 10, hidden: [] };

/** Keep a number inside sensible bounds. */
export const clampCount = (v: unknown, fallback: number, max = 24) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n >= 0 ? Math.min(n, max) : fallback;
};

/** Result announcements and class clips picked from the channel (September 2026). */
const PICKS: [string, string][] = [
  ["b2-EPiJv4ZQ", "Airforce Final Result 2026: Congratulations Barsharani Sahu"],
  ["j58ijG8IYLI", "Indian Airforce Final Result 2026: Aditya Priyadarshan Barik from Jajpur"],
  ["BUJVcLetZBI", "Airforce Medical Assistant Final Result 2026: Ashirbad Sahu"],
  ["MSxTxOFmME4", "Indian Airforce Final Result 2026: Diptimayee Sarangi"],
  ["qiHf6zTmTDc", "Indian Navy Final Result 2026: Congratulations Chandrabhanu Paikaray"],
  ["LkJ9PmvIh7g", "Ansita Priyadarshini (Air Force) felicitated by SP, Berhampur"],
  ["TRYQGG06D1A", "Airforce Final Result 2026"],
  ["GChnz6ITr78", "Effort never dies: Agniveer final result"],
  ["yfUxT4vwLJs", "Ground regular, result spectacular"],
  ["ttQwePLXezA", "Running regular, result spectacular"],
  ["70mcgb9Zuhs", "NDA VST-2 at Samantroy Academy"],
  ["uUvzB5nFJxU", "Maths special class by Debesh Sir, from 5.30 am"],
  ["k6p2wt6RoDI", "Self introduction practice"],
  ["q8Qntxky91c", "Group discussion practice"],
];

export const SHORTS_DOC: ShortsDoc = {
  channelUrl: SHORTS_CHANNEL,
  items: PICKS.map(([id, title]) => ({ id, title, url: `https://www.youtube.com/shorts/${id}` })),
  mode: "auto",
  limit: 12,
  hidden: [],
};

/** YouTube titles on this channel carry hashtags, handles and "||" dividers:
 *  keep the words, drop the noise. */
export function cleanTitle(raw: string): string {
  return raw
    .replace(/[#@][\p{L}\p{N}_.଀-୿シ-]+/gu, " ")
    .replace(/\s*\|\|\s*/g, ": ")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{2066}-\u{2069}]/gu, "")
    .replace(/\s{2,}/g, " ")
    .replace(/(:\s*)+$/g, "")
    .replace(/^\s*:\s*/, "")
    .trim();
}
