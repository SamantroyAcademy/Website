import { getSiteVideos } from "@/lib/videos";
import CmsSectionHeading from "@/components/ui/CmsSectionHeading";
import VideoFacade from "@/components/ui/VideoFacade";

/** YouTube videos. Reads the SAME rows as the Resources centre, so the admin
 *  maintains one list. Hidden when there are none. */
export default async function VideosSection({ limit = 3 }: { limit?: number }) {
  const videos = await getSiteVideos(limit);
  if (!videos.length) return null;
  return (
    <section className="section-y" aria-label="Videos">
      <div className="container-x">
        <CmsSectionHeading sectionKey="videos" />
        <ul className={`mt-10 grid gap-5 ${videos.length > 1 ? "md:grid-cols-2" : ""} ${videos.length > 2 ? "lg:grid-cols-3" : ""}`} data-reveal="stagger">
          {videos.map((v) => (
            <li key={v.id}><VideoFacade id={v.id} title={v.title} /></li>
          ))}
        </ul>
      </div>
    </section>
  );
}
