"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import AdminNotConfigured from "@/components/admin/AdminNotConfigured";
import { LogoMark } from "@/components/Logo";
import Turnstile, { waitForTurnstile } from "@/components/ui/Turnstile";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [tries, setTries] = useState(0);

  if (!isSupabaseConfigured()) return <AdminNotConfigured />;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    // Supabase Auth checks this Turnstile token (Auth, Bot and Abuse
    // Protection); it is single-use, so each attempt gets a fresh one.
    const captchaToken = await waitForTurnstile(e.currentTarget);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password, options: { captchaToken: captchaToken || undefined } });
    if (error) {
      setError(/captcha/i.test(error.message) ? "Security check not completed. If a check box appears below, tick it, then sign in again." : error.message);
      setTries((n) => n + 1);
      setBusy(false);
      return;
    }
    // Mark this tab as a live session — cleared when the tab/window closes so the
    // admin is auto-logged-out on close (see AdminSessionGuard).
    try { sessionStorage.setItem("sa-admin-live", "1"); } catch {}
    router.replace(params.get("next") || "/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <LogoMark className="h-14 w-14" />
          <h1 className="mt-3 text-xl font-bold text-slate-900">Samantroy Admin</h1>
          <p className="text-sm text-slate-500">Sign in to manage your website</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" placeholder="you@samantroyacademy.com" />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" placeholder="••••••••" />
          </div>

          {params.get("expired") && !error && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">For your security you were signed out when the tab was closed. Please sign in again.</p>
          )}
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <Turnstile resetKey={tries} />

          <button type="submit" disabled={busy}
            className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60">
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-400">Authorised personnel only. Samantroy Academy CMS</p>
      </div>
    </div>
  );
}
