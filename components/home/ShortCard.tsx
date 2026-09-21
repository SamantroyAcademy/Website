"use client";

import { useState } from "react";
import Image from "next/image";
import { PlayIcon } from "@phosphor-icons/react";

/** One vertical story. A still until tapped, then the YouTube player in the
 *  same frame (privacy-enhanced domain, no autoplay before the tap). A regular
 *  (landscape) video is shown whole, centred on a blurred copy of itself,
 *  rather than cropped to the tall frame. */
/** `original`: a live YouTube title, left untranslated in Odia mode. */
export default function ShortCard({ id, title, wide = false, original = false }: { id: string; title: string; wide?: boolean; original?: boolean }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="relative aspect-[9/16] overflow-hidden rounded-[var(--radius-card)] bg-brand-950">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0&modestbranding=1`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0 text-left" aria-label={`Play: ${title}`}>
          {/* hqdefault is 4:3 and letterboxes 16:9 videos (black bars top and
              bottom). Scaling by 360/270 crops the bars; the 9:16 cover crop
              then shows the middle of the frame, where vertical clips sit. */}
          {wide ? (
            <>
              <Image src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" aria-hidden fill sizes="14rem" className="scale-150 object-cover opacity-60 blur-xl" />
              <span className="absolute inset-x-0 top-[26%] aspect-video overflow-hidden">
                <Image src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" fill sizes="(min-width: 640px) 14rem, 46vw"
                  className="scale-[1.34] object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.4]" />
              </span>
            </>
          ) : (
            <Image src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" fill sizes="(min-width: 640px) 14rem, 46vw"
              className="scale-[1.34] object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.4]" />
          )}
          <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-brand-950/95 via-brand-950/20 to-transparent" />
          <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-white shadow-lg transition-transform group-hover:scale-110">
            <PlayIcon size={22} weight="fill" />
          </span>
          <span className="absolute inset-x-0 bottom-0 p-4">
            <span translate={original ? "no" : undefined} className="line-clamp-3 text-[0.92rem] font-semibold leading-snug text-white">{title}</span>
          </span>
        </button>
      )}
    </div>
  );
}
