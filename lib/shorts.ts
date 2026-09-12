/** Student stories: YouTube Shorts and short clips (CMS: shorts). Plain data,
 *  safe for server and client. The admin adds or removes links, or imports
 *  from a channel; titles and thumbnails come from YouTube automatically. */

export type ShortItem = { id: string; title: string; url: string };
export type ShortsDoc = { channelUrl: string; items: ShortItem[] };

/** The academy's second channel, where student results and class clips go. */
export const SHORTS_CHANNEL = "https://www.youtube.com/@prasantanayakmotivation1873";

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
