import { getTestimonials } from "@/lib/public-data";
import CmsSectionHeading from "@/components/ui/CmsSectionHeading";
import SampleNote from "@/components/ui/SampleNote";
import TestimonialSlider from "./TestimonialSlider";

/** Testimonials (CMS: testimonials). One large quote at a time. */
export default async function Testimonials() {
  const { items, sample } = await getTestimonials();
  if (!items.length) return null;
  return (
    <section className="section-y bg-surface" aria-label="Testimonials">
      <div className="container-x">
        <CmsSectionHeading sectionKey="testimonials" />
        {sample && <SampleNote className="mt-6" />}
        <TestimonialSlider items={items} />
      </div>
    </section>
  );
}
