import type { Metadata } from "next";
import { CalendarCheckIcon, BroadcastIcon } from "@phosphor-icons/react/ssr";
import { pageMetadata } from "@/lib/seo";
import { BATCH_INFO } from "@/lib/data";
import CmsHero from "@/components/ui/CmsHero";
import Courses from "@/components/home/Courses";
import CountdownStrip from "@/components/home/CountdownStrip";
import FaqSection from "@/components/home/FaqSection";
import CtaBanner from "@/components/site/CtaBanner";
import Reveals from "@/components/motion/Reveals";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("courses");
}

export default function CoursesPage() {
  return (
    <main>
      <CmsHero pageKey="courses" />
      <Courses withHeading={false} />
      <section className="pb-20">
        <div className="container-x grid gap-4 md:grid-cols-2" data-reveal="stagger">
          <div className="rounded-[var(--radius-card)] bg-brand-50 p-7">
            <CalendarCheckIcon size={30} weight="duotone" className="text-brand-700" />
            <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-ink">Offline batches</h2>
            <p className="mt-2 leading-relaxed text-ink-2">{BATCH_INFO.offline}</p>
          </div>
          <div className="rounded-[var(--radius-card)] bg-surface p-7 shadow-[inset_0_0_0_1px_var(--color-line)]">
            <BroadcastIcon size={30} weight="duotone" className="text-brand-700" />
            <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-ink">Online batches</h2>
            <p className="mt-2 leading-relaxed text-ink-2">{BATCH_INFO.online}</p>
          </div>
        </div>
      </section>
      <CountdownStrip />
      <FaqSection />
      <CtaBanner />
      <Reveals />
    </main>
  );
}
