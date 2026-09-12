import type { Metadata } from "next";
import { NewspaperIcon } from "@phosphor-icons/react/ssr";
import { pageMetadata } from "@/lib/seo";
import { getPosts } from "@/lib/public-data";
import CmsHero from "@/components/ui/CmsHero";
import PostCard from "@/components/pages/PostCard";
import CtaBanner from "@/components/site/CtaBanner";
import Reveals from "@/components/motion/Reveals";

// Cached for everyone; a CMS publish refreshes it at once (revalidateTag).
export const revalidate = 300;
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("blog");
}

export default async function BlogPage() {
  const posts = await getPosts();
  const [lead, ...rest] = posts;
  return (
    <main>
      <CmsHero pageKey="blog" compact />
      <section className="pb-24 pt-10 sm:pt-14">
        <div className="container-x">
          {lead ? (
            <>
              <div data-reveal><PostCard post={lead} large /></div>
              {rest.length > 0 && (
                <ul className="mt-16 grid gap-x-6 gap-y-12 border-t border-line pt-12 sm:grid-cols-2 lg:grid-cols-3" data-reveal="stagger">
                  {rest.map((p) => <li key={p.id}><PostCard post={p} /></li>)}
                </ul>
              )}
            </>
          ) : (
            <div className="card p-10 text-center">
              <NewspaperIcon size={40} weight="duotone" className="mx-auto text-brand-600" />
              <p className="mt-4 font-display text-2xl font-bold text-ink">First articles coming soon</p>
              <p className="mx-auto mt-2 max-w-md text-ink-2">Notification alerts, preparation plans and physical training advice will be published here.</p>
            </div>
          )}
        </div>
      </section>
      <CtaBanner />
      <Reveals />
    </main>
  );
}
