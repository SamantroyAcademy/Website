import Link from "@/components/ui/Link";
import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import { getPublished } from "@/lib/content";
import { DAYS, type JourneyStage } from "@/lib/data";
import { JOURNEY_INTRO } from "@/lib/section-defaults";
import { coerceShape, asArray } from "@/lib/shape";
import JourneyPan from "./JourneyPan";

/** The seven-stage recruitment journey (CMS: journey + journey_intro).
 *  Desktop: pinned horizontal pan. Mobile: vertical timeline. */
export default async function JourneySection({ heading = true }: { heading?: boolean }) {
  const [doc, intro] = await Promise.all([
    getPublished<{ items: JourneyStage[] }>("journey", { items: DAYS }),
    getPublished<{ text: string }>("journey_intro", JOURNEY_INTRO),
  ]);
  const stages = coerceShape(asArray<JourneyStage>(doc.items), DAYS).filter((s) => s?.title);
  if (!stages.length) return null;

  return (
    <JourneyPan
      stages={stages}
      intro={
        heading ? (
          <div className="flex h-full flex-col justify-between">
            <div>
              <h2 className="display-lg text-ink">
                Seven stages between you and <span className="hl">the uniform.</span>
              </h2>
              <div className="rich-html lede mt-6" data-i18n="html" dangerouslySetInnerHTML={{ __html: intro.text }} />
            </div>
            <Link href="/recruitment-process" className="btn btn-ghost group mt-8 self-start">
              The full process
              <ArrowRightIcon size={18} weight="bold" className="arrow" />
            </Link>
          </div>
        ) : null
      }
    />
  );
}
