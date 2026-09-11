"use client";

import { useCallback, useRef, useState } from "react";
import ImageCropper, { type CropOptions } from "./ImageCropper";

/** Aspect ratio of every frame an uploaded image can land in, so the admin
 *  crops to exactly what the site will show. Keep these in step with the
 *  public components — the name of each key says where it renders. */
export const FRAMES = {
  candidate: 4 / 5, // Wall of Selection tile (portrait)
  mentor: 4 / 5, // Faculty card photo (portrait)
  avatar: 1, // Testimonial & Google-review circles
  heroSlide: 4 / 5, // Hero showcase frame (portrait)
  officerBanner: 3, // "Now Serving" marquee cards
  air1: 5 / 7, // Top-rank result cards (portrait)
  campus: 4 / 3, // Campus gallery
  force: 3 / 4, // Six Verticals card photo
  blogCover: 16 / 9, // Blog cover image
  pageHero: 16 / 9, // Page hero background
} as const;

/**
 * Puts every admin image upload through a crop/rotate step.
 *
 * ```tsx
 * const { crop, cropperUi } = useImageCropper();
 * const cropped = await crop(file, { aspect: FRAMES.mentor, label: "Mentor card" });
 * if (!cropped) return;            // admin cancelled — skip this file
 * ...
 * return <>{cropperUi}...</>;
 * ```
 *
 * Resolves to the cropped file, or null if the dialog was cancelled.
 */
export function useImageCropper() {
  const [pending, setPending] = useState<(CropOptions & { file: File }) | null>(null);
  const resolver = useRef<((f: File | null) => void) | null>(null);

  const crop = useCallback(
    (file: File, options: CropOptions = {}) =>
      new Promise<File | null>((resolve) => {
        // Non-images (PDFs in the media library) pass straight through.
        if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
          resolve(file);
          return;
        }
        resolver.current = resolve;
        setPending({ file, ...options });
      }),
    [],
  );

  const finish = useCallback((result: File | null) => {
    resolver.current?.(result);
    resolver.current = null;
    setPending(null);
  }, []);

  const cropperUi = pending ? (
    <ImageCropper
      key={pending.file.name + pending.file.lastModified}
      file={pending.file}
      aspect={pending.aspect}
      label={pending.label}
      round={pending.round}
      onDone={finish}
    />
  ) : null;

  return { crop, cropperUi };
}
