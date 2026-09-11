import Link from "next/link";
import { getCurrentAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function countOf(table: string, filter?: { column: string; value: string }) {
  try {
    const supabase = await createClient();
    let q = supabase.from(table).select("id", { count: "exact", head: true });
    if (filter) q = q.eq(filter.column, filter.value);
    const { count } = await q;
    return count ?? 0;
  } catch {
    return 0;
  }
}

async function hasDoc(key: string) {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("site_content").select("published").eq("key", key).maybeSingle();
    return Boolean(data?.published && Object.keys(data.published).length);
  } catch {
    return false;
  }
}

export default async function AdminDashboard() {
  const admin = await getCurrentAdmin();
  const [newLeads, candidates, testimonials, mentors, exams, standards, questions, settingsSaved] = await Promise.all([
    countOf("enquiries", { column: "status", value: "new" }),
    countOf("selected_candidates"),
    countOf("testimonials"),
    countOf("mentors"),
    countOf("exams"),
    countOf("physical_standards"),
    countOf("mock_questions"),
    hasDoc("settings"),
  ]);

  const cards = [
    { label: "New enquiries", value: newLeads, hint: "Waiting for a call back", href: "/admin/enquiries" },
    { label: "Selected candidates", value: candidates, hint: "Wall of Selection", href: "/admin/candidates" },
    { label: "Exams", value: exams, hint: "Catalogue and exam pages", href: "/admin/exams" },
    { label: "Standards rows", value: standards, hint: "Height, chest, run times", href: "/admin/standards" },
    { label: "Testimonials", value: testimonials, hint: "Stories on the site", href: "/admin/testimonials" },
    { label: "Faculty", value: mentors, hint: "Trainers and teachers", href: "/admin/mentors" },
    { label: "Mock questions", value: questions, hint: "Free test bank", href: "/admin/mock-tests" },
  ];

  /** Anything the public site is still filling from built-in samples or
   *  placeholders. Must be empty before launch. */
  const todo: { text: string; href: string }[] = [];
  if (!settingsSaved) todo.push({ text: "Phone, WhatsApp, email and address are placeholders. Publish real contact details.", href: "/admin/settings" });
  if (candidates === 0) todo.push({ text: "Wall of Selection is showing labelled sample tiles. Add real selected candidates.", href: "/admin/candidates" });
  if (testimonials === 0) todo.push({ text: "Testimonials are showing sample quotes. Add real ones, or switch the section off.", href: "/admin/testimonials" });
  if (mentors === 0) todo.push({ text: "Faculty section is showing sample role cards. Add your trainers.", href: "/admin/mentors" });
  if (exams === 0) todo.push({ text: "Exams are coming from the built-in catalogue. Import it to edit each exam.", href: "/admin/exams" });
  if (standards === 0) todo.push({ text: "Physical standards are coming from built-in rows. Import and verify them.", href: "/admin/standards" });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">
        Welcome back{admin?.full_name ? `, ${admin.full_name}` : ""}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Manage the Samantroy Academy website from here. You are signed in as{" "}
        <span className="font-medium capitalize text-slate-700">{admin?.role.replace("_", " ")}</span>.
      </p>

      {todo.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-sm font-bold text-amber-900">Before launch ({todo.length})</h2>
          <ul className="mt-2 space-y-1.5">
            {todo.map((t) => (
              <li key={t.href} className="flex items-start justify-between gap-3 text-sm text-amber-900">
                <span>{t.text}</span>
                <Link href={t.href} className="shrink-0 font-semibold underline">Fix</Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-sm">
            <p className="text-sm font-medium text-slate-500">{c.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{c.value}</p>
            <p className="text-xs text-slate-400">{c.hint}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {[
          { title: "Edit the homepage", desc: "Reorder sections, switch them on or off, and jump to each editor.", href: "/admin/homepage" },
          { title: "Pages and sections", desc: "Every page's text and images, with draft preview, publish and rollback.", href: "/admin/sections" },
          { title: "Follow up leads", desc: "Move each enquiry through the pipeline, add notes, export CSV.", href: "/admin/enquiries" },
        ].map((q) => (
          <Link key={q.href} href={q.href} className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-brand-300">
            <p className="text-sm font-semibold text-slate-900">{q.title}</p>
            <p className="mt-1 text-xs text-slate-500">{q.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
