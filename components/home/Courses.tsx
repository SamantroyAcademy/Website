import { getPublished } from "@/lib/content";
import { COURSES, type CourseItem } from "@/lib/data";
import { COURSES_NOTE, COURSES_OPTIONS, type CoursesOptions } from "@/lib/homepage-defaults";
import { coerceShape, asArray } from "@/lib/shape";
import CmsSectionHeading from "@/components/ui/CmsSectionHeading";
import CourseStack from "./CourseStack";

/** Batch cards (CMS: courses_cards + courses_options + courses_note). */
export default async function Courses({ withHeading = true }: { withHeading?: boolean }) {
  const [doc, opts, note] = await Promise.all([
    getPublished<{ items: CourseItem[] }>("courses_cards", { items: COURSES }),
    getPublished<CoursesOptions>("courses_options", COURSES_OPTIONS),
    getPublished<{ text: string }>("courses_note", { text: COURSES_NOTE }),
  ]);
  const items = coerceShape(asArray<CourseItem>(doc.items), COURSES).filter((c) => c?.title);
  if (!items.length) return null;

  return (
    <section className="section-y" aria-label="Courses">
      {withHeading && (
        <div className="container-x">
          <CmsSectionHeading sectionKey="courses" />
        </div>
      )}
      <CourseStack items={items} showPrices={opts.showPrices !== "off"} />
      {note.text && (
        <div className="container-x">
          <div className="rich-html mt-8 max-w-2xl text-sm text-muted" data-reveal data-i18n="html" dangerouslySetInnerHTML={{ __html: note.text }} />
        </div>
      )}
    </section>
  );
}
