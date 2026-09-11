import MediaLibrary from "@/components/admin/MediaLibrary";

export const dynamic = "force-dynamic";

export default function MediaAdmin() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Media Library</h1>
      <p className="mt-1 text-sm text-slate-500">Upload images and browse everything stored in your media bucket.</p>
      <MediaLibrary />
    </div>
  );
}
