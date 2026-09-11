"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ChangePasswordForm() {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (pw.length < 8) return setMsg({ ok: false, text: "Password must be at least 8 characters." });
    if (pw !== pw2) return setMsg({ ok: false, text: "Passwords do not match." });
    setBusy(true);
    const { error } = await createClient().auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return setMsg({ ok: false, text: error.message });
    setPw(""); setPw2("");
    setMsg({ ok: true, text: "Password updated successfully." });
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-4">
      <div>
        <label htmlFor="np" className="mb-1 block text-sm font-medium text-slate-700">New password</label>
        <input id="np" type="password" required value={pw} onChange={(e) => setPw(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
      </div>
      <div>
        <label htmlFor="np2" className="mb-1 block text-sm font-medium text-slate-700">Confirm new password</label>
        <input id="np2" type="password" required value={pw2} onChange={(e) => setPw2(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
      </div>
      {msg && <p className={`rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{msg.text}</p>}
      <button type="submit" disabled={busy} className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60">
        {busy ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
