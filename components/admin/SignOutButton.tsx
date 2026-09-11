"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton({ className = "" }: { className?: string }) {
  const [busy, setBusy] = useState(false);
  const signOut = async () => {
    setBusy(true);
    try {
      await createClient().auth.signOut();
    } finally {
      try { sessionStorage.removeItem("sa-admin-live"); } catch {}
      window.location.href = "/admin/login";
    }
  };
  return (
    <button
      onClick={signOut}
      disabled={busy}
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-60 ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
        <path d="M15 12H3m0 0 4-4m-4 4 4 4M13 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
