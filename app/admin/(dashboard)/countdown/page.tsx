import { createClient } from "@/lib/supabase/server";
import { COUNTDOWN, type CountdownDoc } from "@/lib/countdown-defaults";
import CountdownEditor from "@/components/admin/CountdownEditor";

export const dynamic = "force-dynamic";

export default async function CountdownAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_content").select("draft").eq("key", "countdown").maybeSingle();
  const initial = (data?.draft && Object.keys(data.draft).length ? data.draft : COUNTDOWN) as CountdownDoc;
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900">Batch &amp; Exam Countdown</h1>
      <p className="mt-1 text-sm text-slate-500">Live countdown timers for your next batch and upcoming defence exams.</p>
      <CountdownEditor initial={initial} />
    </div>
  );
}
