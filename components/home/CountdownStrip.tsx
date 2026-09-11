import { getPublished } from "@/lib/content";
import { COUNTDOWN, type CountdownDoc, type CountdownItem } from "@/lib/countdown-defaults";
import { asArray } from "@/lib/shape";
import CountdownTicker from "./CountdownTicker";

/** Batch and exam countdown (CMS: countdown). Section and card colours come
 *  from the admin's colour pickers; defaults keep it on the light palette. */
export default async function CountdownStrip() {
  const doc = await getPublished<CountdownDoc>("countdown", COUNTDOWN);
  const items = asArray<CountdownItem>(doc.items).filter((i) => i?.label && i?.date);
  if (!items.length) return null;

  const bg = doc.bg || COUNTDOWN.bg!;
  const text = doc.textColor || COUNTDOWN.textColor!;
  const kicker = doc.kickerColor || COUNTDOWN.kickerColor!;

  return (
    <section className="py-14 sm:py-20" style={{ background: bg, color: text }} aria-label="Upcoming dates">
      <div className="container-x grid gap-10 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-4">
          {doc.kicker && <p className="text-sm font-semibold" style={{ color: kicker }} data-reveal="fade">{doc.kicker}</p>}
          <h2 data-split className="display-md mt-2" style={{ color: text }}>{doc.heading}</h2>
        </div>
        <div className="lg:col-span-8">
          <CountdownTicker items={items} textColor={text} />
        </div>
      </div>
    </section>
  );
}
