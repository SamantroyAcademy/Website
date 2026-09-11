import { getMentors } from "@/lib/public-data";
import CmsSectionHeading from "@/components/ui/CmsSectionHeading";
import Portrait from "@/components/ui/Portrait";
import SampleNote from "@/components/ui/SampleNote";

/** Faculty and physical trainers (CMS: mentors). */
export default async function Mentors() {
  const { items, sample } = await getMentors();
  if (!items.length) return null;

  return (
    <section className="section-y bg-surface" aria-label="Faculty">
      <div className="container-x">
        <CmsSectionHeading sectionKey="mentors" />
        {sample && <SampleNote className="mt-6" />}
        <ul className={`mt-12 grid gap-8 sm:grid-cols-2 ${items.length >= 3 ? "lg:grid-cols-3" : ""}`} data-reveal="stagger">
          {items.map((m, i) => (
            <li key={(m.id ?? m.name) + i}>
              <article className="group">
                <Portrait src={m.image_path} name={m.name} className="aspect-[4/5]" sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" />
                <div className="mt-5">
                  <h3 className="font-display text-2xl font-bold tracking-tight text-ink">{m.name}</h3>
                  {m.role && <p className="mt-1 font-medium text-brand-600">{m.role}</p>}
                  {m.specialty && <p className="mt-3 text-sm font-semibold text-ink-2">{m.specialty}</p>}
                  {m.bio && <div className="rich-html mt-2 leading-relaxed text-ink-2" dangerouslySetInnerHTML={{ __html: m.bio }} />}
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
