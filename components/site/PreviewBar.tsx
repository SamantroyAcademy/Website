"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/** Shown on the live site ONLY while an admin has draft preview on (the
 *  sa-preview cookie, set by the section editor). One click jumps to the CMS
 *  screen for the page being viewed, or exits preview. */
export default function PreviewBar() {
  const pathname = usePathname();
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(document.cookie.split("; ").some((c) => c.startsWith("sa-preview=1")));
  }, [pathname]);

  if (!on) return null;

  function exit() {
    document.cookie = "sa-preview=; path=/; Max-Age=0; SameSite=Lax";
    setOn(false);
    window.location.reload();
  }

  const editHref =
    pathname === "/" ? "/admin/homepage"
      : pathname.startsWith("/blog") ? "/admin/blog"
      : pathname.startsWith("/testimonials") ? "/admin/testimonials"
      : pathname.startsWith("/selected") || pathname.startsWith("/gallery") ? "/admin/candidates"
      : pathname.startsWith("/exams") ? "/admin/exams"
      : pathname.startsWith("/standards") ? "/admin/standards"
      : pathname.startsWith("/courses") ? "/admin/courses"
      : pathname.startsWith("/mock-tests") ? "/admin/mock-tests"
      : pathname.startsWith("/resources") ? "/admin/resources"
      : "/admin/sections";

  return (
    <div className="fixed inset-x-0 top-0 z-[90] flex flex-wrap items-center justify-center gap-2 bg-accent px-4 py-2 text-sm text-ink shadow-lg">
      <span className="font-semibold">Draft preview: you are seeing unpublished changes</span>
      <Link href={editHref} className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-surface">Edit this page</Link>
      <Link href="/admin" className="rounded-full px-3 py-1 text-xs font-semibold shadow-[inset_0_0_0_1.5px_var(--color-ink)]">Open CMS</Link>
      <button type="button" onClick={exit} className="rounded-full px-3 py-1 text-xs font-semibold shadow-[inset_0_0_0_1.5px_var(--color-ink)]">Exit preview</button>
    </div>
  );
}
