import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16 "proxy" convention (replaces the deprecated "middleware" file).
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Run on admin routes + admin API; skip the public site & static assets.
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
