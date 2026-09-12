import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import CmsHero from "@/components/ui/CmsHero";
import SelectionWall from "@/components/home/SelectionWall";
import ToppersRail from "@/components/home/ToppersRail";
import OfficerBanners from "@/components/home/OfficerBanners";
import CampusGallery from "@/components/home/CampusGallery";
import CtaBanner from "@/components/site/CtaBanner";
import Reveals from "@/components/motion/Reveals";

// Cached for everyone; a CMS publish refreshes it at once (revalidateTag).
export const revalidate = 300;
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("gallery");
}

/** Gallery: every image list the admin manages, in one place. */
export default function GalleryPage() {
  return (
    <main>
      <CmsHero pageKey="gallery" />
      <CampusGallery limit={8} />
      <ToppersRail />
      <OfficerBanners limit={12} />
      <SelectionWall limit={12} />
      <CtaBanner />
      <Reveals />
    </main>
  );
}
