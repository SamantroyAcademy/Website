/** Browser side of the Odia switch: swaps the page's English text for the
 *  dictionary's Odia, and keeps doing so as React renders new content. Runs
 *  only after hydration. Text inside [translate="no"] (names, phone numbers,
 *  the logo) is left alone. Rich text blocks (data-i18n="html") are swapped
 *  whole so their grammar and formatting hold. */
import { I18N_ATTRS, hasOdia, norm, worthTranslating, type Dictionary } from "./text";

const SKIP = '[translate="no"],[data-no-translate],script,style,noscript,svg,code,pre,textarea,input';
const missing = new Set<string>();

function textNode(node: Text, dict: Dictionary) {
  const raw = node.nodeValue;
  if (!raw || !raw.trim()) return;
  const parent = node.parentElement;
  if (!parent || parent.closest(SKIP) || parent.closest('[data-i18n="html"]')) return;
  const key = norm(raw);
  const odia = dict.t[key];
  if (odia) {
    const next = (raw.match(/^\s*/)?.[0] ?? "") + odia + (raw.match(/\s*$/)?.[0] ?? "");
    if (node.nodeValue !== next) node.nodeValue = next;
  } else if (!hasOdia(key) && worthTranslating(key)) {
    missing.add(key);
  }
}

function attributes(el: Element, dict: Dictionary) {
  for (const a of I18N_ATTRS) {
    const v = el.getAttribute(a);
    if (!v) continue;
    const odia = dict.t[norm(v)];
    if (odia && v !== odia) el.setAttribute(a, odia);
  }
}

function richBlock(el: Element, dict: Dictionary) {
  const key = norm(el.textContent ?? "");
  const odia = dict.h[key];
  if (odia && el.innerHTML !== odia) el.innerHTML = odia;
}

export function translateTree(root: Node, dict: Dictionary) {
  if (root.nodeType === Node.TEXT_NODE) return textNode(root as Text, dict);
  if (root.nodeType !== Node.ELEMENT_NODE) return;
  const start = root as Element;
  if (start.closest(SKIP)) return;
  const walker = document.createTreeWalker(start, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      if (n.nodeType === Node.ELEMENT_NODE) {
        const el = n as Element;
        if (el.matches(SKIP)) return NodeFilter.FILTER_REJECT;
        attributes(el, dict);
        if (el.getAttribute("data-i18n") === "html") { richBlock(el, dict); return NodeFilter.FILTER_REJECT; }
        return NodeFilter.FILTER_SKIP;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  if (start.getAttribute("data-i18n") === "html") return richBlock(start, dict);
  attributes(start, dict);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) textNode(n as Text, dict);
}

/** Keep translating whatever React adds or changes. Returns a stop function. */
export function observe(dict: Dictionary): () => void {
  let queued: Node[] = [];
  let raf = 0;
  const flush = () => { raf = 0; const nodes = queued; queued = []; for (const n of nodes) if (n.isConnected) translateTree(n, dict); };
  const mo = new MutationObserver((records) => {
    for (const r of records) {
      if (r.type === "childList") r.addedNodes.forEach((n) => queued.push(n));
      else queued.push(r.target);
    }
    if (!raf) raf = requestAnimationFrame(flush);
  });
  mo.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: [...I18N_ATTRS] });
  return () => { mo.disconnect(); if (raf) cancelAnimationFrame(raf); };
}

/** Strings seen on screen with no translation yet (then cleared). */
export function takeMissing(max = 40): string[] {
  const out = [...missing].slice(0, max);
  for (const s of out) missing.delete(s);
  return out;
}
