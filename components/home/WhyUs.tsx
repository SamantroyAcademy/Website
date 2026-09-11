import Image from "next/image";
import { getPublished } from "@/lib/content";
import { WHYUS, WHYUS_ITEMS } from "@/lib/section-defaults";
import { asArray } from "@/lib/shape";
import SectionHeading from "@/components/ui/SectionHeading";
import Icon from "@/components/Icon";

type Item = { icon: string; title: string; body: string };

/** Why Samantroy (CMS: whyus + whyus_items). Sticky split: the heading and
 *  photo hold still on the left while the reasons scroll past on the right. */
export default async function WhyUs() {
  const [head, doc] = await Promise.all([
    getPublished("whyus", WHYUS),
    getPublished<{ items: Item[] }>("whyus_items", { items: WHYUS_ITEMS }),
  ]);
  const items = asArray<Item>(doc.items).filter((i) => i?.title);

  return (
    <section className="section-y bg-surface" aria-label="Why Samantroy Academy">
      <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <SectionHeading kicker={head.kicker} kickerSize={(head as { kickerSize?: string }).kickerSize} title={head.title} subtitle={head.subtitle.replace(/<[^>]+>/g, "")} />
            <div data-reveal="clip" className="relative mt-10 hidden aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-tint lg:block">
              <div data-parallax="8" className="absolute -inset-y-[10%] inset-x-0">
                <Image src="/images/scenes/field-training.jpg" alt="Recruits training outdoors in field conditions" fill sizes="40vw" className="object-cover" />
              </div>
            </div>
          </div>
        </div>
        <ol className="grid gap-x-10 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-1">
          {items.map((it, i) => (
            <li key={it.title + i} data-reveal className="flex gap-5 border-t border-line py-7 first:border-t-0 sm:[&:nth-child(2)]:border-t-0 lg:[&:nth-child(2)]:border-t">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-brand-50 text-brand-700">
                <Icon name={it.icon} size={26} />
              </span>
              <div>
                <h3 className="font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">{it.title}</h3>
                <div className="rich-html mt-2 leading-relaxed text-ink-2" dangerouslySetInnerHTML={{ __html: it.body }} />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
