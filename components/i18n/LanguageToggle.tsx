"use client";

import { useLanguage } from "./LanguageProvider";

/** EN / ଓଡ଼ିଆ switch in the navbar (desktop and mobile). */
export default function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLanguage();
  const opt = (value: "en" | "or", label: string, aria: string) => (
    <button
      type="button"
      onClick={() => lang !== value && setLang(value)}
      aria-pressed={lang === value}
      aria-label={aria}
      className={`rounded-full px-3 py-2.5 text-[0.8rem] font-bold leading-none transition-colors sm:py-1.5 ${
        lang === value ? "bg-ink text-surface" : "text-ink-2 hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
  return (
    <div translate="no" role="group" aria-label="Language"
      className={`flex shrink-0 items-center rounded-full bg-surface p-1 shadow-[inset_0_0_0_1.5px_var(--color-line)] ${className}`}>
      {opt("en", "EN", "English")}
      {opt("or", "ଓଡ଼ିଆ", "Odia")}
    </div>
  );
}
