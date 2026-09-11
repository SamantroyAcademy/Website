/** Parser-backed HTML sanitizer for admin-authored rich text.
 *
 *  Uses `sanitize-html` (an HTML parser + strict allowlist) rather than regex
 *  string-stripping, so it is not fooled by malformed markup, solidus-separated
 *  event handlers (`<a/onclick=…>`), encoded URL schemes (`java&#115;cript:`),
 *  or oddly-cased/whitespaced attributes. Only the formatting tags/attributes
 *  the CMS rich-text editor emits survive; everything else (scripts, iframes,
 *  event handlers, dangerous URL schemes) is dropped.
 *
 *  Server-intended (the parser is a Node module). Current callers are all
 *  server components / server-only modules.
 */
import sanitizeHtmlLib from "sanitize-html";

const OPTIONS: sanitizeHtmlLib.IOptions = {
  allowedTags: [
    "p", "div", "span", "br", "hr",
    "b", "strong", "i", "em", "u", "s", "strike", "sub", "sup", "mark", "small",
    "a", "ul", "ol", "li", "blockquote",
    "h1", "h2", "h3", "h4", "h5", "h6", "font",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    font: ["color", "face", "size"],
    "*": ["style", "class", "align"],
  },
  // Only safe link schemes; blocks javascript:/vbscript:/data: (encoded too —
  // the parser decodes entities before this check).
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesAppliedToAttributes: ["href"],
  allowProtocolRelative: false,
  // Harden any surviving target=_blank links against reverse-tabnabbing.
  transformTags: {
    a: sanitizeHtmlLib.simpleTransform("a", { rel: "noopener noreferrer nofollow" }, true),
  },
  // Drop disallowed tags entirely (don't keep their text as raw markup).
  disallowedTagsMode: "discard",
};

export function sanitizeHtml(input: string | null | undefined): string {
  if (!input) return "";
  const clean = sanitizeHtmlLib(String(input), OPTIONS);
  // sanitize-html escapes bare "&" to "&amp;". Many CMS fields are rendered as
  // plain text (not via innerHTML), where that shows literally as "&amp;" —
  // so put the ampersand back. Safe: an entity in text position cannot create
  // an element, and a bare "&" is valid in HTML text.
  return clean.replace(/&amp;(?!(?:[a-zA-Z][a-zA-Z0-9]{1,8}|#\d{1,6}|#x[0-9a-fA-F]{1,6});)/g, "&");
}
