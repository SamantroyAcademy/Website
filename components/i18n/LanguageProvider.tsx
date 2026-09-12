"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { observe, takeMissing, translateTree } from "@/lib/i18n/dom";
import type { Dictionary } from "@/lib/i18n/text";

export type Lang = "en" | "or";
const STORAGE_KEY = "sa-lang";
const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: "en", setLang: () => {} });
export const useLanguage = () => useContext(Ctx);

let dictPromise: Promise<Dictionary | null> | null = null;
function loadDict(url: string): Promise<Dictionary | null> {
  dictPromise ??= fetch(url, { cache: "force-cache" })
    .then((r) => (r.ok ? (r.json() as Promise<Dictionary>) : null))
    .catch(() => null);
  return dictPromise;
}

/** English / Odia for the public site. The Odia dictionary (every translated
 *  string, built by the sync job) is a versioned file on R2: fetched in the
 *  background on every visit so switching is instant, then cached for good.
 *  Switching reloads the page so animations that split text start clean. */
export default function LanguageProvider({ children, dictUrl }: { children: ReactNode; dictUrl: string | null }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const html = document.documentElement;
    const wanted: Lang = html.classList.contains("i18n-or") ? "or" : "en";
    setLangState(wanted);
    const ready = () => html.classList.add("i18n-ready");
    if (!dictUrl) { html.classList.remove("i18n-or"); ready(); return; }

    if (wanted === "en") {
      // Odia comes along with the English page, quietly, once the page is idle.
      const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 2500));
      idle(() => { void loadDict(dictUrl); });
      ready();
      return;
    }

    let stop = () => {};
    let timer = 0;
    loadDict(dictUrl).then((dict) => {
      if (!dict) { html.classList.remove("i18n-or"); html.lang = "en"; ready(); return; }
      html.lang = "or";
      translateTree(document.body, dict);
      stop = observe(dict);
      ready();
      // Report text that had no translation yet; the next sync fills it in.
      let posts = 0;
      timer = window.setInterval(() => {
        const items = takeMissing(40);
        if (!items.length || posts >= 5) return;
        posts++;
        void fetch("/api/i18n/missing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items }), keepalive: true }).catch(() => {});
      }, 8000);
    });
    return () => { stop(); window.clearInterval(timer); };
  }, [dictUrl]);

  const setLang = (l: Lang) => {
    try { localStorage.setItem(STORAGE_KEY, l); } catch { /* private mode */ }
    window.location.reload();
  };

  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}
