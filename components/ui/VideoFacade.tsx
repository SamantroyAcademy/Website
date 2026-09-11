"use client";

import { useState } from "react";
import Image from "next/image";
import { PlayIcon } from "@phosphor-icons/react";

/** YouTube facade: a thumbnail until clicked, then the privacy-enhanced
 *  embed. Keeps the heavy iframe (and its trackers) off the page until the
 *  visitor actually asks for the video. */
export default function VideoFacade({ id, title }: { id: string; title: string }) {
  const [play, setPlay] = useState(false);
  return (
    <div className="relative aspect-video overflow-hidden rounded-[var(--radius-card)] bg-brand-950">
      {play ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button type="button" onClick={() => setPlay(true)} className="group absolute inset-0" aria-label={`Play video: ${title}`}>
          <Image src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-105" />
          <span className="absolute inset-0 bg-gradient-to-t from-brand-950/70 to-transparent" aria-hidden />
          <span className="absolute left-5 top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-ink shadow-lg transition-transform group-hover:scale-110 sm:left-1/2 sm:-translate-x-1/2">
            <PlayIcon size={22} weight="fill" />
          </span>
          <span className="absolute inset-x-0 bottom-0 line-clamp-2 p-4 text-left text-sm font-semibold text-surface">{title}</span>
        </button>
      )}
    </div>
  );
}
