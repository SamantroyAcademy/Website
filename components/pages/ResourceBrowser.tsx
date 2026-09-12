"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { FolderSimpleIcon, FilePdfIcon, FileTextIcon, PlayIcon, XIcon, DownloadSimpleIcon, CaretRightIcon, HouseIcon } from "@phosphor-icons/react";
import { mediaUrl } from "@/lib/supabase/media";
import { youtubeId } from "@/lib/youtube";
import type { Resource, ResourceFolder } from "@/lib/public-data";

/** Folder browser for the resources centre (CMS: resource_folders +
 *  resources). Data is loaded on the server; this only navigates it. */
export default function ResourceBrowser({ folders, resources }: { folders: ResourceFolder[]; resources: Resource[] }) {
  const [current, setCurrent] = useState<string | null>(null);
  const [preview, setPreview] = useState<Resource | null>(null);

  const subfolders = useMemo(() => folders.filter((f) => f.parent_id === current), [folders, current]);
  const items = useMemo(() => resources.filter((r) => r.folder_id === current), [resources, current]);
  const crumbs = useMemo(() => {
    const path: ResourceFolder[] = [];
    let id = current;
    while (id) {
      const f = folders.find((x) => x.id === id);
      if (!f) break;
      path.unshift(f);
      id = f.parent_id;
    }
    return path;
  }, [current, folders]);
  const countIn = (id: string) => resources.filter((r) => r.folder_id === id).length + folders.filter((f) => f.parent_id === id).length;

  if (!folders.length && !resources.length) {
    return (
      <div className="card p-10 text-center">
        <FolderSimpleIcon size={40} weight="duotone" className="mx-auto text-brand-600" />
        <p className="mt-4 font-display text-2xl font-bold text-ink">Notes and papers are on their way</p>
        <p className="mx-auto mt-2 max-w-md text-ink-2">Syllabus PDFs, previous papers and video lessons will appear here as the academy adds them.</p>
      </div>
    );
  }

  return (
    <div>
      <nav aria-label="Folder path" className="mb-6 flex flex-wrap items-center gap-1 text-sm font-semibold">
        <button type="button" onClick={() => setCurrent(null)} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-ink-2 hover:bg-tint hover:text-ink">
          <HouseIcon size={16} weight="bold" /> All resources
        </button>
        {crumbs.map((f) => (
          <span key={f.id} className="flex items-center gap-1">
            <CaretRightIcon size={12} weight="bold" className="text-muted" />
            <button type="button" onClick={() => setCurrent(f.id)} className="rounded-full px-3 py-1.5 text-ink-2 hover:bg-tint hover:text-ink">{f.name}</button>
          </span>
        ))}
      </nav>

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {subfolders.map((f) => (
          <li key={f.id}>
            <button type="button" onClick={() => setCurrent(f.id)} className="card flex h-full w-full flex-col items-start gap-4 p-5 text-left transition-shadow hover:shadow-[var(--shadow-lift)]">
              <FolderSimpleIcon size={36} weight="duotone" className="text-accent-ink" />
              <span>
                <span className="block font-display text-lg font-bold leading-tight text-ink">{f.name}</span>
                <span className="text-sm text-muted">{countIn(f.id)} items</span>
              </span>
            </button>
          </li>
        ))}
        {items.map((r) => {
          const isPdf = r.mime === "application/pdf";
          const isImg = r.mime?.startsWith("image/");
          return (
            <li key={r.id}>
              <button type="button" onClick={() => setPreview(r)} className="card flex h-full w-full flex-col overflow-hidden text-left transition-shadow hover:shadow-[var(--shadow-lift)]">
                <span className="relative flex aspect-video w-full items-center justify-center bg-tint">
                  {r.kind === "youtube" && r.thumbnail ? (
                    <Image src={r.thumbnail} alt="" fill sizes="300px" className="object-cover" />
                  ) : isImg && r.path ? (
                    <Image src={mediaUrl(r.path)} alt="" fill sizes="300px" className="object-cover" />
                  ) : isPdf ? (
                    <FilePdfIcon size={44} weight="duotone" className="text-accent-ink" />
                  ) : (
                    <FileTextIcon size={44} weight="duotone" className="text-brand-600" />
                  )}
                  {r.kind === "youtube" && (
                    <span className="absolute flex h-11 w-11 items-center justify-center rounded-full bg-accent text-white"><PlayIcon size={18} weight="fill" /></span>
                  )}
                </span>
                <span className="line-clamp-2 p-4 text-sm font-semibold text-ink" title={r.title}>{r.title}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {!subfolders.length && !items.length && <p className="card mt-4 p-8 text-center text-ink-2">This folder is empty.</p>}

      {preview && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-brand-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={preview.title}
          onMouseDown={(e) => e.target === e.currentTarget && setPreview(null)}>
          <div className="relative w-full max-w-3xl overflow-hidden rounded-[22px] bg-paper shadow-[var(--shadow-lift)]" data-lenis-prevent>
            <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3">
              <p className="truncate font-semibold text-ink">{preview.title}</p>
              <button type="button" onClick={() => setPreview(null)} aria-label="Close" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-tint"><XIcon size={18} weight="bold" /></button>
            </div>
            {preview.kind === "youtube" && preview.url && youtubeId(preview.url) ? (
              <div className="relative aspect-video">
                <iframe src={`https://www.youtube-nocookie.com/embed/${youtubeId(preview.url)}?autoplay=1&rel=0`} title={preview.title}
                  allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen className="absolute inset-0 h-full w-full" />
              </div>
            ) : preview.mime?.startsWith("image/") && preview.path ? (
              <div className="relative aspect-[4/3] bg-tint"><Image src={mediaUrl(preview.path)} alt={preview.title} fill sizes="768px" className="object-contain" /></div>
            ) : preview.mime === "application/pdf" && preview.path ? (
              <iframe src={mediaUrl(preview.path)} title={preview.title} className="h-[70dvh] w-full" />
            ) : (
              <p className="p-8 text-ink-2">Preview is not available for this file. Download it below.</p>
            )}
            {preview.path && (
              <div className="border-t border-line p-4">
                <a href={mediaUrl(preview.path)} target="_blank" rel="noopener noreferrer" download className="btn btn-primary btn-sm">
                  <DownloadSimpleIcon size={16} weight="bold" /> Download
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
