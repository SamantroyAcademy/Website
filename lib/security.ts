import "server-only";

/** Read a JSON body with a hard size cap, so a huge payload can't tie up a
 *  function. Returns null for oversized or malformed bodies. */
export async function readJson<T>(req: Request, maxBytes = 16_384): Promise<T | null> {
  if (Number(req.headers.get("content-length") || 0) > maxBytes) return null;
  try {
    const text = await req.text();
    if (text.length > maxBytes) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/** Server-side Cloudflare Turnstile check for public forms. Skipped when no
 *  secret is configured (so forms keep working before the key is added), and
 *  fails open on a Cloudflare outage: rate limits still apply either way. */
export async function verifyTurnstile(token: unknown, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (typeof token !== "string" || !token || token.length > 2048) return false;
  const form = new URLSearchParams({ secret, response: token });
  if (ip && ip !== "unknown") form.set("remoteip", ip);
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(8_000),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return true;
  }
}

export const BOT_CHECK_FAILED = "Security check failed. Please refresh the page and try again.";
