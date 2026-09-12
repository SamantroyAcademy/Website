import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";
import { getPublished } from "@/lib/content";
import { resolveHomeOrder, type HomeSectionKey } from "@/lib/homepage-order";

import HeroSection from "@/components/home/HeroSection";
import ExamsMarquee from "@/components/home/ExamsMarquee";
import ToppersRail from "@/components/home/ToppersRail";
import SelectionWall from "@/components/home/SelectionWall";
import ShortsSection from "@/components/home/ShortsSection";
import Courses from "@/components/home/Courses";
import CampusGallery from "@/components/home/CampusGallery";
import BooksSection from "@/components/home/BooksSection";
import Mentors from "@/components/home/Mentors";
import VerticalsStrip from "@/components/home/VerticalsStrip";
import WhyUs from "@/components/home/WhyUs";
import CountdownStrip from "@/components/home/CountdownStrip";
import StatsStrip from "@/components/home/StatsStrip";
import SelectionTracker from "@/components/home/SelectionTracker";
import JourneySection from "@/components/home/JourneySection";
import OfficerBanners from "@/components/home/OfficerBanners";
import VideosSection from "@/components/home/VideosSection";
import GoogleReviews from "@/components/home/GoogleReviews";
import Testimonials from "@/components/home/Testimonials";
import SocialBand from "@/components/home/SocialBand";
import FaqSection from "@/components/home/FaqSection";
import CtaBanner from "@/components/site/CtaBanner";
import Reveals from "@/components/motion/Reveals";

// Cached for everyone; a CMS publish refreshes it at once (revalidateTag).
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("home");
}

/** Every movable homepage section, keyed exactly as in lib/homepage-order.ts.
 *  Order and visibility come from the CMS (Admin -> Homepage -> Section Order). */
const SECTION_VIEWS: Record<HomeSectionKey, ReactNode> = {
  entries_marquee: <ExamsMarquee />,
  air1_marquee: <ToppersRail />,
  wall: <SelectionWall />,
  shorts: <ShortsSection />,
  courses: <Courses />,
  campus: <CampusGallery />,
  books: <BooksSection />,
  mentors: <Mentors />,
  four_forces: <VerticalsStrip />,
  whyus: <WhyUs />,
  countdown: <CountdownStrip />,
  stats: <StatsStrip />,
  selection_tracker: <SelectionTracker />,
  journey: <JourneySection />,
  officer_banners: <OfficerBanners />,
  videos: <VideosSection />,
  google_reviews: <GoogleReviews />,
  testimonials: <Testimonials />,
  instagram: <SocialBand />,
  faq: <FaqSection />,
  cta: <CtaBanner />,
};

export default async function Home() {
  const doc = await getPublished<{ items: unknown }>("homepage_order", { items: [] });
  const order = resolveHomeOrder(doc.items);

  return (
    <main>
      {/* The hero is always first and is not reorderable. */}
      <HeroSection />
      {order
        .filter((s) => s.enabled)
        .map((s) => <div key={s.key}>{SECTION_VIEWS[s.key]}</div>)}
      <Reveals />
    </main>
  );
}
