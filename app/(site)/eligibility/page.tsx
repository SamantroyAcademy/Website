import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { getExams, getStandards } from "@/lib/public-data";
import CmsHero from "@/components/ui/CmsHero";
import EligibilityFinder from "@/components/pages/EligibilityFinder";
import CtaBanner from "@/components/site/CtaBanner";
import Reveals from "@/components/motion/Reveals";

// Cached for everyone; a CMS publish refreshes it at once (revalidateTag).
export const revalidate = 300;
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("eligibility");
}

export default async function EligibilityPage() {
  const [exams, standards] = await Promise.all([getExams(), getStandards()]);
  return (
    <main>
      <CmsHero pageKey="eligibility" compact />
      <section className="pb-24 pt-10 sm:pt-14">
        <div className="container-x">
          <EligibilityFinder exams={exams} standards={standards} />
        </div>
      </section>
      <CtaBanner />
      <Reveals />
    </main>
  );
}
