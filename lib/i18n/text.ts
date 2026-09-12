/** Rules shared by the server extractor and the browser translator, so both
 *  agree on which strings exist and how they are keyed. Plain functions. */

/** Collapse whitespace: the key for any string. */
export const norm = (s: string): string => s.replace(/\s+/g, " ").trim();

/** Worth translating: has real words, and is not a URL, email or number. */
export function worthTranslating(s: string): boolean {
  if (s.length < 2 || s.length > 4000) return false;
  if (!/[A-Za-z]{2,}/.test(s)) return false;
  if (/^(https?:\/\/|www\.|mailto:|tel:)/i.test(s)) return false;
  if (/^[\w.+-]+@[\w-]+\.[\w.]+$/.test(s)) return false;
  if (/^[+\d\s()./:-]+$/.test(s)) return false;
  return true;
}

/** Attributes whose text is shown to people. */
export const I18N_ATTRS = ["placeholder", "aria-label", "title", "alt"] as const;

/** Elements whose content is never translated. */
export const SKIP_TAGS = new Set(["script", "style", "noscript", "svg", "code", "pre", "template", "iframe"]);
/** Form fields: their placeholder and label are translated, what people type is not. */
export const FIELD_TAGS = new Set(["input", "textarea"]);

/** Dictionary as published to R2: plain strings and rich-text blocks. */
export type Dictionary = { v: string; t: Record<string, string>; h: Record<string, string> };

/** Has Odia script in it. */
export const hasOdia = (s: string): boolean => /[଀-୿]/.test(s);
