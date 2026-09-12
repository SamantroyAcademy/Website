import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { getCandidates } from "@/lib/public-data";
import CmsHero from "@/components/ui/CmsHero";
import SelectedWall from "@/components/pages/SelectedWall";
import SampleNote from "@/components/ui/SampleNote";
import SelectionTracker from "@/components/home/SelectionTracker";
import CtaBanner from "@/components/site/CtaBanner";
import Reveals from "@/components/motion/Reveals";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("selected");
}

export default async function SelectedPage() {
  const { items, sample } = await getCandidates(24);
  return (
    <main>
      <CmsHero pageKey="selected" compact />
      <section className="pb-20 pt-10 sm:pt-14">
        <div className="container-x">
          {sample && <SampleNote className="mb-8" />}
          <SelectedWall initial={items} sample={sample} />
        </div>
      </section>
      <SelectionTracker />
      <CtaBanner />
      <Reveals />
    </main>
  );
}
