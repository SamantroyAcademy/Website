"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export const ADMIN_LIVE_KEY = "sa-admin-live";

/** Auto sign-out when the tab/window is closed.
 *  A logged-in tab sets a sessionStorage marker at login. sessionStorage is
 *  wiped when the tab/window closes, but the auth cookie can survive — so if we
 *  load an admin page with no marker, the tab was reopened after a close and we
 *  sign the user out. */
export default function AdminSessionGuard() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(ADMIN_LIVE_KEY) === "1") return; // live, active tab

    const supabase = createClient();
    supabase.auth.signOut().finally(() => {
      try { sessionStorage.removeItem(ADMIN_LIVE_KEY); } catch {}
      window.location.replace("/admin/login?expired=1");
    });
  }, []);

  return null;
}
