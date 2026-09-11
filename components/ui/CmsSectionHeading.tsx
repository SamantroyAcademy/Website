import { getPublished } from "@/lib/content";
import { headingDefault, type HeadingDoc } from "@/lib/heading-defaults";
import SectionHeading from "./SectionHeading";

/** A section heading stored in the CMS under `heading.<key>`. Defaults come
 *  from lib/heading-defaults.ts, the same values the admin editor starts
 *  from, so the editor always shows what the site shows. */
export default async function CmsSectionHeading({
  sectionKey,
  align,
  tone,
  className,
}: {
  sectionKey: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
}) {
  const h = await getPublished<HeadingDoc>(`heading.${sectionKey}`, headingDefault(sectionKey));
  return (
    <SectionHeading
      kicker={h.kicker}
      kickerSize={h.kickerSize}
      title={h.title}
      subtitle={h.subtitle}
      align={align}
      tone={tone}
      className={className}
    />
  );
}
