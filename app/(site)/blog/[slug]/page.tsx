import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/ui/Link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "@phosphor-icons/react/ssr";
import { getPost, getPosts } from "@/lib/public-data";
import { getSettings } from "@/lib/content";
import { mediaUrl } from "@/lib/supabase/media";
import { ogImages } from "@/lib/seo";
import PostCard, { postDate } from "@/components/pages/PostCard";
import OpenEnquiry from "@/components/site/OpenEnquiry";
import CtaBanner from "@/components/site/CtaBanner";
import Reveals from "@/components/motion/Reveals";

// Cached for everyone; a CMS publish refreshes it at once (revalidateTag).
export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  // Called here (before streaming starts) so an unknown slug gets a real 404.
  if (!post) notFound();
  const description = post.excerpt || post.body.replace(/<[^>]+>/g, " ").slice(0, 155);
  return {
    title: post.title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", locale: "en_IN", siteName: "Samantroy Academy", url: `/blog/${post.slug}`, title: post.title, description, images: post.cover_path ? [mediaUrl(post.cover_path)] : ogImages() },
    twitter: { card: "summary_large_image", title: post.title, description },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, all, s] = await Promise.all([getPost(slug), getPosts(12), getSettings()]);
  if (!post) notFound();
  const related = all.filter((p) => p.slug !== post.slug && (!post.tag || p.tag === post.tag)).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    datePublished: post.published_at ?? undefined,
    author: { "@type": "Person", name: post.author || s.name },
    publisher: { "@type": "Organization", name: s.name },
    ...(post.cover_path ? { image: mediaUrl(post.cover_path) } : {}),
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="pt-24 sm:pt-28 lg:pt-32">
        <header className="container-x max-w-4xl">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-2 hover:text-ink" data-reveal="fade">
            <ArrowLeftIcon size={16} weight="bold" /> All articles
          </Link>
          <p className="mt-8 text-sm text-muted" data-reveal="fade">{[post.tag, postDate(post.published_at), post.author].filter(Boolean).join(", ")}</p>
          <h1 data-split className="display-lg mt-3 text-ink">{post.title}</h1>
          {post.excerpt && <p className="lede mt-5" data-reveal>{post.excerpt}</p>}
        </header>
        {post.cover_path && (
          <div className="container-x mt-10 max-w-5xl">
            <div data-reveal="clip" className="relative aspect-[16/9] overflow-hidden rounded-[var(--radius-card)] bg-tint">
              <Image src={mediaUrl(post.cover_path)} alt="" fill priority sizes="(min-width: 1024px) 1000px, 100vw" className="object-cover" />
            </div>
          </div>
        )}
        <div className="container-x mt-12 max-w-3xl">
          <div className="rich-html prose-article" dangerouslySetInnerHTML={{ __html: post.body }} />
          <div className="mt-14 flex flex-col gap-4 rounded-[var(--radius-card)] bg-brand-50 p-7 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-display text-xl font-bold text-ink">Preparing for this exam?</p>
            <OpenEnquiry />
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="section-y">
          <div className="container-x">
            <h2 data-split className="display-md text-ink">Keep reading</h2>
            <ul className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3" data-reveal="stagger">
              {related.map((p) => <li key={p.id}><PostCard post={p} /></li>)}
            </ul>
          </div>
        </section>
      )}
      <CtaBanner />
      <Reveals />
    </main>
  );
}
