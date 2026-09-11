import { getPublished } from "@/lib/content";
import { ENTRY_COUNTS, type EntryCount } from "@/lib/homepage-defaults";
import { asArray } from "@/lib/shape";
import MarqueeTrack from "./MarqueeTrack";

/** The page's single marquee (CMS: exam_counts). A count renders only when
 *  the admin has entered a real number for that exam. */
export default async function ExamsMarquee() {
  const doc = await getPublished<{ items: EntryCount[] }>("exam_counts", { items: ENTRY_COUNTS });
  const items = asArray<EntryCount>(doc.items)
    .filter((i) => i?.entry)
    .map((i) => ({ entry: i.entry, count: String(i.count ?? "").trim() }));
  if (!items.length) return null;
  return (
    <section aria-label="Exams we prepare for" className="border-y border-line bg-surface py-6 sm:py-8">
      <MarqueeTrack items={items} />
    </section>
  );
}
