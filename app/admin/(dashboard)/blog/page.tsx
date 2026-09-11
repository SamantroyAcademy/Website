import { createClient } from "@/lib/supabase/server";
import BlogManager, { type Post } from "@/components/admin/BlogManager";

export const dynamic = "force-dynamic";

export default async function BlogAdmin() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("id, slug, title, excerpt, cover_path, body, tag, author, published, published_at")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900">Blog &amp; Current Affairs</h1>
      <p className="mt-1 text-sm text-slate-500">Write articles with rich text and a cover image. Save as draft or publish live to /blog.</p>
      <BlogManager initial={(data ?? []) as Post[]} />
    </div>
  );
}
