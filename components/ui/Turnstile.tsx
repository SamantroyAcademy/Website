"use client";

import { useEffect, useRef } from "react";

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id: string) => void;
};
declare global {
  interface Window { turnstile?: TurnstileApi }
}

/** Public site key (not a secret). */
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAAExfjPm9mCeuZFkR";

let loader: Promise<void> | null = null;
function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  loader ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => { loader = null; reject(new Error("turnstile")); };
    document.head.appendChild(s);
  });
  return loader;
}

/** Cloudflare Turnstile bot check. Invisible for real visitors; only shows a
 *  small challenge when Cloudflare is unsure. The script loads only where a
 *  form is actually shown. Inside a <form>, the token is submitted as the
 *  `cf-turnstile-response` field; `onToken` exposes it for JSON submits.
 *  Change `resetKey` after each submit: tokens are single-use. */
export default function Turnstile({ onToken, resetKey = 0 }: { onToken?: (token: string) => void; resetKey?: number }) {
  const box = useRef<HTMLDivElement>(null);
  const cb = useRef(onToken);
  cb.current = onToken;

  useEffect(() => {
    let id: string | undefined;
    let alive = true;
    loadScript()
      .then(() => {
        if (!alive || !box.current || !window.turnstile) return;
        id = window.turnstile.render(box.current, {
          sitekey: SITE_KEY,
          appearance: "interaction-only",
          size: "flexible",
          callback: (t: string) => cb.current?.(t),
          "expired-callback": () => { cb.current?.(""); if (id) window.turnstile?.reset(id); },
          "error-callback": () => cb.current?.(""),
        });
      })
      .catch(() => {});
    return () => {
      alive = false;
      if (id) window.turnstile?.remove(id);
    };
  }, [resetKey]);

  return <div ref={box} className="empty:hidden" />;
}

/** Before submitting, give Turnstile a moment to finish: a visitor who taps
 *  submit within a second of opening the form would otherwise send no token.
 *  Stops early if the script never loaded, and lets the server decide. */
export async function waitForTurnstile(form: HTMLFormElement, timeoutMs = 6000): Promise<string> {
  const read = () => form.querySelector<HTMLInputElement>('input[name="cf-turnstile-response"]')?.value ?? "";
  const start = Date.now();
  while (!read() && Date.now() - start < timeoutMs) {
    if (!window.turnstile && Date.now() - start > 2500) break;
    await new Promise((r) => setTimeout(r, 150));
  }
  return read();
}
