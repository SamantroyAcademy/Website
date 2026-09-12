import { createClient } from "@/lib/supabase/server";
import TranslationsManager, { type TRow } from "@/components/admin/TranslationsManager";

export const dynamic = "force-dynamic";

export default async function TranslationsAdmin({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { status = "all", q = "" } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("translations").select("source, odia, kind, status, model, updated_at").order("updated_at", { ascending: false }).limit(300);
  if (["pending", "done", "failed"].includes(status)) query = query.eq("status", status);
  if (q.trim()) query = query.ilike("source", `%${q.trim().replace(/[%_]/g, "")}%`);
  const [{ data }, counts] = await Promise.all([
    query,
    Promise.all(["done", "pending", "failed"].map(async (s) => {
      const { count } = await supabase.from("translations").select("source", { count: "exact", head: true }).eq("status", s);
      return [s, count ?? 0] as const;
    })),
  ]);

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-slate-900">Odia Translations</h1>
      <p className="mt-1 text-sm text-slate-500">
        Every text on the website is translated into Odia automatically (free AI models) whenever you save anything in the
        admin. Check and correct the Odia here; your corrections are kept and published straight away.
      </p>
      <TranslationsManager rows={(data ?? []) as TRow[]} counts={Object.fromEntries(counts)} status={status} q={q} />
    </div>
  );
}
