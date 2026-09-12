import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { getMockQuestions } from "@/lib/public-data";
import CmsHero from "@/components/ui/CmsHero";
import MockQuiz from "@/components/pages/MockQuiz";
import CtaBanner from "@/components/site/CtaBanner";
import Reveals from "@/components/motion/Reveals";

// Cached for everyone; a CMS publish refreshes it at once (revalidateTag).
export const revalidate = 300;
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("mock-tests");
}

export default async function MockTestsPage() {
  // Public shape only: the answer and explanation never reach the browser.
  const { items } = await getMockQuestions();
  return (
    <main>
      <CmsHero pageKey="mock-tests" compact />
      <section className="pb-24 pt-10 sm:pt-14">
        <div className="container-x">
          <MockQuiz questions={items} />
        </div>
      </section>
      <CtaBanner />
      <Reveals />
    </main>
  );
}
