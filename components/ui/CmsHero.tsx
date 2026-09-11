import type { ReactNode } from "react";
import { getPublished } from "@/lib/content";
import { pageHero, type PageHeroDoc } from "@/lib/pagehero-defaults";
import PageHero from "./PageHero";

/** CMS-driven page hero (`pagehero.<pageKey>`), falling back to the bundled
 *  default. Every interior page renders this so its hero is editable. */
export default async function CmsHero({ pageKey, aside, compact }: { pageKey: string; aside?: ReactNode; compact?: boolean }) {
  const doc = await getPublished<PageHeroDoc>(`pagehero.${pageKey}`, pageHero(pageKey));
  return (
    <PageHero
      kicker={doc.kicker}
      kickerSize={doc.kickerSize}
      title={doc.title}
      subtitle={doc.subtitle}
      image={doc.image}
      crumb={doc.crumb}
      aside={aside}
      compact={compact}
    />
  );
}
