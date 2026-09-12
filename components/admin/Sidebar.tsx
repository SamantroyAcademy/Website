"use client";

import { useEffect, useState } from "react";
import Link from "@/components/ui/Link";
import { usePathname } from "next/navigation";
import type { AdminRole } from "@/lib/auth";
import { LogoMark } from "@/components/Logo";
import SignOutButton from "./SignOutButton";

type Item = { href: string; label: string; superOnly?: boolean };
type Group = { label: string; items: Item[] };

/** Same destinations as the reference CMS, grouped so 31 screens stay
 *  scannable. Items marked superOnly are hidden from plain admins. */
const GROUPS: Group[] = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/enquiries", label: "Enquiries" },
      { href: "/admin/analytics", label: "Analytics" },
    ],
  },
  {
    label: "Results and people",
    items: [
      { href: "/admin/candidates", label: "Selected Candidates" },
      { href: "/admin/selections", label: "Selection Tracker" },
      { href: "/admin/testimonials", label: "Testimonials" },
      { href: "/admin/mentors", label: "Faculty and Trainers" },
      { href: "/admin/google-reviews", label: "Google Reviews" },
    ],
  },
  {
    label: "Exams and learning",
    items: [
      { href: "/admin/exams", label: "Exams Catalogue" },
      { href: "/admin/standards", label: "Physical Standards" },
      { href: "/admin/courses", label: "Courses and Batches" },
      { href: "/admin/mock-tests", label: "Mock Tests" },
      { href: "/admin/resources", label: "Resources" },
      { href: "/admin/blog", label: "Blog" },
      { href: "/admin/faqs", label: "FAQs" },
    ],
  },
  {
    label: "Homepage",
    items: [
      { href: "/admin/homepage", label: "Section Order" },
      { href: "/admin/hero-showcase", label: "Hero Posters" },
      { href: "/admin/shorts", label: "Student Shorts" },
      { href: "/admin/verticals", label: "Six Verticals" },
      { href: "/admin/campus", label: "Campus Gallery" },
      { href: "/admin/toppers", label: "Result Posters" },
      { href: "/admin/officer-banners", label: "Now Serving" },
      { href: "/admin/stats", label: "Scoreboard" },
      { href: "/admin/countdown", label: "Countdown" },
    ],
  },
  {
    label: "Site",
    items: [
      { href: "/admin/sections", label: "Pages and Sections" },
      { href: "/admin/sections/enquiry_popup", label: "Enquiry Popup" },
      { href: "/admin/contact-form", label: "Enquiry Form" },
      { href: "/admin/settings", label: "Footer and Contact" },
      { href: "/admin/translations", label: "Odia Translations" },
      { href: "/admin/seo", label: "SEO" },
      { href: "/admin/media", label: "Media Library" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/activity", label: "Activity Log" },
      { href: "/admin/users", label: "Users", superOnly: true },
      { href: "/admin/account", label: "My Account" },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  if (href === "/admin/sections") return pathname === "/admin/sections" || (pathname.startsWith("/admin/sections/") && !pathname.endsWith("enquiry_popup"));
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Sidebar({ role, email }: { role: AdminRole; email: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile drawer on navigation.
  useEffect(() => setOpen(false), [pathname]);

  const nav = (
    <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4" aria-label="CMS">
      {GROUPS.map((g) => {
        const items = g.items.filter((i) => !i.superOnly || role === "super_admin");
        if (!items.length) return null;
        return (
          <div key={g.label}>
            <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{g.label}</p>
            <ul className="space-y-0.5">
              {items.map((i) => {
                const active = isActive(pathname, i.href);
                return (
                  <li key={i.href}>
                    <Link
                      href={i.href}
                      aria-current={active ? "page" : undefined}
                      className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
                        active ? "bg-brand-50 text-brand-800" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      {i.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );

  const header = (
    <div className="flex items-center gap-2.5 border-b border-slate-200 px-5 py-4">
      <LogoMark className="h-8 w-8" />
      <div className="leading-tight">
        <p className="text-sm font-bold text-slate-900">Samantroy Academy</p>
        <p className="text-[11px] font-medium text-slate-500">Content Manager</p>
      </div>
    </div>
  );

  const footer = (
    <div className="border-t border-slate-200 p-3">
      <div className="mb-2 px-3">
        <p className="truncate text-xs font-medium text-slate-700">{email}</p>
        <p className="text-[11px] capitalize text-slate-400">{role.replace("_", " ")}</p>
      </div>
      <SignOutButton className="w-full justify-start" />
      <Link href="/" target="_blank" className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100">
        View live site
      </Link>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <LogoMark className="h-7 w-7" />
          <span className="text-sm font-bold text-slate-900">Samantroy CMS</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="admin-drawer"
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
          <aside id="admin-drawer" className="relative flex h-full w-72 flex-col bg-white shadow-xl">
            {header}
            {nav}
            {footer}
          </aside>
        </div>
      )}

      {/* Desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col self-start border-r border-slate-200 bg-white lg:flex">
        {header}
        {nav}
        {footer}
      </aside>
    </>
  );
}
