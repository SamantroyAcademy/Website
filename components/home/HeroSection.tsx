import { getPublished } from "@/lib/content";
import { HERO } from "@/lib/section-defaults";
import { HERO_SLIDES, type HeroSlide } from "@/lib/hero-slides";
import { asArray } from "@/lib/shape";
import { mediaUrl } from "@/lib/supabase/media";
import Hero from "./Hero";

/** Server wrapper: reads the hero copy (CMS: hero) and showcase slides
 *  (CMS: hero_slides), then hands plain data to the animated client hero. */
export default async function HeroSection() {
  const [doc, slidesDoc] = await Promise.all([
    getPublished<typeof HERO>("hero", HERO),
    getPublished<{ items: HeroSlide[] }>("hero_slides", { items: HERO_SLIDES }),
  ]);
  const slides = asArray<HeroSlide>(slidesDoc.items).filter((s) => s?.image);
  return (
    <Hero
      doc={{ ...doc, typedWords: asArray<string>(doc.typedWords).filter(Boolean) }}
      slides={(slides.length ? slides : HERO_SLIDES).map((s) => ({ ...s, image: mediaUrl(s.image) }))}
    />
  );
}
