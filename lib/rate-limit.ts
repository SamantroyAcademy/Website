import "server-only";

/** Best-effort in-memory rate limiter (per warm serverless instance).
 *  Not a substitute for an edge WAF, but stops trivial floods & scripted
 *  abuse against a single instance. Keyed by IP + bucket name. */
type Hit = { count: number; resetAt: number };
const store = new Map<string, Hit>();

// Bounds so the map can't grow without limit on a long-lived warm instance.
const MAX_KEYS = 10_000;
const SWEEP_INTERVAL_MS = 60_000;
let lastSweep = 0;

/** Drop expired entries; if still over the cap, evict the entries that expire
 *  soonest (closest to being reclaimed anyway) until back under MAX_KEYS. */
function sweep(now: number) {
  for (const [key, hit] of store) {
    if (now > hit.resetAt) store.delete(key);
  }
  if (store.size > MAX_KEYS) {
    const byExpiry = [...store.entries()].sort((a, b) => a[1].resetAt - b[1].resetAt);
    for (let i = 0; i < byExpiry.length && store.size > MAX_KEYS; i++) {
      store.delete(byExpiry[i][0]);
    }
  }
}

export function rateLimit(
  key: string,
  { limit = 5, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {},
): { ok: boolean; retryAfter: number } {
  const now = Date.now();

  // Prune on a timer regardless of whether these keys are seen again, and as a
  // hard safety net whenever the map gets large.
  if (now - lastSweep > SWEEP_INTERVAL_MS || store.size > MAX_KEYS) {
    lastSweep = now;
    sweep(now);
  }

  const hit = store.get(key);
  if (!hit || now > hit.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  hit.count += 1;
  if (hit.count > limit) {
    return { ok: false, retryAfter: Math.ceil((hit.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfter: 0 };
}

/** Client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}
