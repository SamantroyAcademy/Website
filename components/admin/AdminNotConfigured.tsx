export default function AdminNotConfigured() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-2xl">🔧</div>
        <h1 className="text-xl font-bold text-slate-900">CMS not connected yet</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          The admin panel needs a Supabase project. To finish setup:
        </p>
        <ol className="mt-4 space-y-2 text-sm text-slate-700">
          <li className="flex gap-2"><span className="font-bold text-brand-600">1.</span> Create a free project at supabase.com.</li>
          <li className="flex gap-2"><span className="font-bold text-brand-600">2.</span> Run <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">supabase/migrations/0001_cms_init.sql</code> in the SQL Editor.</li>
          <li className="flex gap-2"><span className="font-bold text-brand-600">3.</span> Copy the API keys into <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">.env.local</code> (see <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">.env.example</code>).</li>
          <li className="flex gap-2"><span className="font-bold text-brand-600">4.</span> Add your first admin under Authentication → Add user (becomes super-admin).</li>
        </ol>
        <p className="mt-5 text-xs text-slate-500">Full instructions are in the project README.</p>
      </div>
    </div>
  );
}
