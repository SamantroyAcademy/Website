import type { Metadata } from "next";
import Image from "next/image";
import credits from "@/lib/image-credits.json";
import { mediaUrl } from "@/lib/supabase/media";
import Reveals from "@/components/motion/Reveals";

export const metadata: Metadata = {
  title: "Image credits",
  description: "Sources and licences for the photographs used on this website.",
};

type Credit = { file: string; title?: string; license?: string; artist?: string; source?: string };

/** Attribution for every third-party photograph (GODL-India and Creative
 *  Commons licences require it). */
export default function CreditsPage() {
  return (
    <main className="pb-24 pt-24 sm:pt-28 lg:pt-32">
      <div className="container-x">
        <h1 data-split className="display-lg text-ink">Image credits</h1>
        <p className="lede mt-5" data-reveal>
          Photographs of the Armed Forces, CAPF and Railways on this site come from the Government Open Data Licence (India) and Wikimedia Commons.
          Photos uploaded by the academy through the CMS are its own.
        </p>
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" data-reveal="stagger">
          {(credits as Credit[]).map((c) => (
            <li key={c.file} className="card overflow-hidden">
              <div className="relative aspect-[16/10] bg-tint">
                <Image src={mediaUrl(c.file)} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
              </div>
              <div className="p-5 text-sm">
                <p className="line-clamp-2 font-semibold text-ink">{c.title?.replace(/^File:/, "").replace(/\.\w+$/, "") || c.file.split("/").pop()}</p>
                <p className="mt-1 text-muted">{[c.artist, c.license].filter(Boolean).join(", ")}</p>
                {c.source?.startsWith("http") ? (
                  <a href={c.source} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-semibold text-accent-ink underline underline-offset-4">Source</a>
                ) : c.source ? (
                  <p className="mt-2 text-xs text-muted">{c.source}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <Reveals />
    </main>
  );
}
