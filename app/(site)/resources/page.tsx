import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { getResources } from "@/lib/public-data";
import CmsHero from "@/components/ui/CmsHero";
import ResourceBrowser from "@/components/pages/ResourceBrowser";
import CtaBanner from "@/components/site/CtaBanner";
import Reveals from "@/components/motion/Reveals";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("resources");
}

export default async function ResourcesPage() {
  const { folders, resources } = await getResources();
  return (
    <main>
      <CmsHero pageKey="resources" compact />
      <section className="pb-24 pt-10 sm:pt-14">
        <div className="container-x" data-reveal>
          <ResourceBrowser folders={folders} resources={resources} />
        </div>
      </section>
      <CtaBanner />
      <Reveals />
    </main>
  );
}
