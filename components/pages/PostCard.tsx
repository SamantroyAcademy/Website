import Image from "next/image";
import Link from "next/link";
import { mediaUrl } from "@/lib/supabase/media";
import type { Post } from "@/lib/public-data";

export const postDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" }) : "";

/** Blog card. `large` is the lead story treatment on the index page. */
export default function PostCard({ post, large = false }: { post: Post; large?: boolean }) {
  return (
    <Link href={`/blog/${post.slug}`} className={`group grid gap-5 ${large ? "md:grid-cols-12 md:items-center md:gap-10" : ""}`}>
      <div className={`relative overflow-hidden rounded-[var(--radius-card)] bg-tint ${large ? "aspect-[16/10] md:col-span-7" : "aspect-[16/10]"}`}>
        {post.cover_path && (
          <Image src={mediaUrl(post.cover_path)} alt="" fill sizes={large ? "(min-width: 768px) 60vw, 100vw" : "(min-width: 1024px) 33vw, 100vw"}
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
        )}
      </div>
      <div className={large ? "md:col-span-5" : ""}>
        <p className="text-sm text-muted">{[post.tag, postDate(post.published_at)].filter(Boolean).join(", ")}</p>
        <h3 className={`mt-2 font-display font-extrabold leading-tight tracking-tight text-ink group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4 ${large ? "text-[clamp(1.8rem,3.2vw,2.6rem)]" : "text-xl"}`}>
          {post.title}
        </h3>
        {post.excerpt && <p className={`mt-3 leading-relaxed text-ink-2 ${large ? "text-lg" : "line-clamp-3"}`}>{post.excerpt}</p>}
      </div>
    </Link>
  );
}
