"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/** Privacy-friendly aggregate page-view count (no cookies, no personal data)
 *  through the track_view RPC, once per public route change. */
export default function PageViewTracker() {
  const pathname = usePathname();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    if (!pathname || pathname.startsWith("/admin")) return;
    if (last.current === pathname) return;
    last.current = pathname;
    try {
      createClient().rpc("track_view", { p: pathname }).then(() => {}, () => {});
    } catch {
      /* analytics must never break the page */
    }
  }, [pathname]);

  return null;
}
