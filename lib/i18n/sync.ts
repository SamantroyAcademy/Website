import "server-only";
import { gzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { parse, type HTMLElement as PElement, type Node as PNode } from "node-html-parser";
import { createAdminClient, hasServiceRole } from "@/lib/supabase/admin";
import { isR2Configured, putObject } from "@/lib/r2";
import { EXAMS } from "@/lib/exams";
import { I18N_ATTRS, SKIP_TAGS, hasOdia, norm, worthTranslating, type Dictionary } from "./text";

/**
 * Odia translation sync.
 *
 *   1. collect  every English string the site shows (crawl of the public
 *               pages, plus strings browsers reported as missing),
 *   2. queue    new ones as `pending` rows in public.translations,
 *   3. translate pending rows in large batches through OpenRouter's FREE
 *               models (with fallbacks, inside a time budget),
 *   4. publish  every finished row as one gzipped dictionary on R2 and store
 *               its version in site_content "i18n" for the layout to read.
 *
 * Runs after every admin save (/api/admin/revalidate), daily by cron, and on
 * demand. Only new or changed text costs a request; the rest is cached.
 */

/** Free models, tried in order. Free models are often rate-limited or slow,
 *  so a failure just moves on to the next one. */
export const FREE_MODELS = [
  "inclusionai/ling-3.0-flash-vl:free",
  "google/gemma-4-31b-it:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "google/gemma-4-26b-a4b-it:free",
  "nvidia/nemotron-3.5-lightning:free",
];

const PAGES = [
  "/", "/about", "/recruitment-process", "/exams", "/standards", "/training-centres", "/courses",
  "/eligibility", "/mock-tests", "/resources", "/gallery", "/selected", "/blog", "/testimonials", "/contact",
];

type Kind = "text" | "html";
type Row = { source: string; source_html: string | null; kind: Kind; attempts?: number };

const SYSTEM = `You translate website text from English into Odia (ଓଡ଼ିଆ) for Samantroy Academy, a defence and government-job coaching institute in Brahmapur, Odisha. Write natural, simple, correct Odia that students use. Keep these exactly as written in English: the name "Samantroy Academy", exam and force names and acronyms (NDA, NA, TES, CDS, AFCAT, NCC, SSC, GD, CGL, CHSL, MTS, BSF, CRPF, CISF, ITBP, SSB, SSR, MR, AA, OSSC, OSSSC, OPSC, OCS, ASO, IBPS, SBI, RRB, NTPC, ALP, RPF, PO, SI, Agniveer, PST, PET, CBT, CAPF), URLs, email addresses and phone numbers. Always write numbers with Western digits 0-9, never Odia digits. Address the reader respectfully (ଆପଣ, ଆପଣଙ୍କ), never ତୁମ. Use these words: batch = ବ୍ୟାଚ୍, coaching = କୋଚିଂ, selection = ଚୟନ, exam = ପରୀକ୍ଷା, relaxation (age or height) = ରିହାତି, notification = ବିଜ୍ଞପ୍ତି, eligibility = ଯୋଗ୍ୟତା, physical test = ଶାରୀରିକ ପରୀକ୍ଷା, admissions are open = ଭର୍ତ୍ତି ଚାଲିଛି. Keep every HTML tag and attribute exactly as in the input. The input is a JSON array of strings. Reply with ONLY a JSON array of the same length with the translations in the same order: no notes, no code fences.`;

/* ── 1. Collect ─────────────────────────────────────────────────────── */

function walk(node: PNode, out: Map<string, Row>) {
  if (node.nodeType === 3) {
    const t = norm(node.text);
    if (worthTranslating(t) && !out.has(t)) out.set(t, { source: t, source_html: null, kind: "text" });
    return;
  }
  if (node.nodeType !== 1) return;
  const el = node as PElement;
  const tag = el.rawTagName?.toLowerCase() ?? "";
  if (SKIP_TAGS.has(tag)) return;
  if (el.getAttribute("translate") === "no" || el.hasAttribute("data-no-translate")) return;
  for (const a of I18N_ATTRS) {
    const v = norm(el.getAttribute(a) ?? "");
    if (worthTranslating(v) && !out.has(v)) out.set(v, { source: v, source_html: null, kind: "text" });
  }
  // Rich text from the CMS: translated as one block so the grammar holds.
  if (el.getAttribute("data-i18n") === "html") {
    const key = norm(el.text);
    if (worthTranslating(key) && !out.has(key)) out.set(key, { source: key, source_html: el.innerHTML.trim(), kind: "html" });
    return;
  }
  for (const c of el.childNodes) walk(c, out);
}

async function crawl(base: string): Promise<Map<string, Row>> {
  const out = new Map<string, Row>();
  const paths = [...PAGES, ...EXAMS.map((e) => `/exams/${e.slug}`)];
  const queue = [...paths];
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (queue.length) {
      const p = queue.shift()!;
      try {
        const res = await fetch(base + p, { headers: { "x-i18n-crawl": "1" }, signal: AbortSignal.timeout(20_000), cache: "no-store" });
        if (!res.ok) continue;
        const root = parse(await res.text(), { comment: false, blockTextElements: { script: false, style: false, noscript: false, pre: false } });
        const body = root.querySelector("body");
        if (body) walk(body, out);
      } catch { /* skip page */ }
    }
  }));
  return out;
}

/* ── 3. Translate ───────────────────────────────────────────────────── */

async function callModel(model: string, items: string[], html: boolean): Promise<string[] | null> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://www.samantroyacademy.com",
      "X-Title": "Samantroy Academy",
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      messages: [
        { role: "system", content: SYSTEM + (html ? " Each item is an HTML fragment." : "") },
        { role: "user", content: JSON.stringify(items) },
      ],
    }),
    signal: AbortSignal.timeout(180_000),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content ?? "";
  const start = text.indexOf("["), end = text.lastIndexOf("]");
  if (start < 0 || end <= start) return null;
  try {
    const arr = JSON.parse(text.slice(start, end + 1)) as unknown;
    return Array.isArray(arr) && arr.length === items.length && arr.every((x) => typeof x === "string") ? (arr as string[]) : null;
  } catch {
    return null;
  }
}

/** Odia digits (୦-୯) to 0-9: the site writes numbers the same in both languages. */
const westernDigits = (s: string) => s.replace(/[୦-୯]/g, (d) => String(d.charCodeAt(0) - 0x0b66));

/** An output is accepted when it is Odia, or when the source has no ordinary
 *  words to translate (e.g. "NDA / CDS / AFCAT"). */
const acceptable = (src: string, out: string) => out.trim() !== "" && (hasOdia(out) || !/[a-z]{3,}/.test(src));

function batches(rows: Row[]): Row[][] {
  const out: Row[][] = [];
  let cur: Row[] = [], size = 0;
  for (const r of rows) {
    const len = (r.source_html ?? r.source).length;
    if (cur.length && (cur.length >= 60 || size + len > 9000)) { out.push(cur); cur = []; size = 0; }
    cur.push(r); size += len;
  }
  if (cur.length) out.push(cur);
  return out;
}

/* ── 4. Publish ─────────────────────────────────────────────────────── */

async function publish(): Promise<{ version: string; count: number } | null> {
  const db = createAdminClient();
  const dict: Dictionary = { v: "", t: {}, h: {} };
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from("translations").select("source, odia, kind").eq("status", "done").order("source").range(from, from + 999);
    if (error || !data) break;
    for (const r of data as { source: string; odia: string; kind: Kind }[]) (r.kind === "html" ? dict.h : dict.t)[r.source] = r.odia;
    if (data.length < 1000) break;
  }
  const count = Object.keys(dict.t).length + Object.keys(dict.h).length;
  const json = JSON.stringify({ t: dict.t, h: dict.h });
  const version = createHash("sha256").update(json).digest("hex").slice(0, 10);
  dict.v = version;
  const body = gzipSync(JSON.stringify(dict), { level: 9 });
  const headers = { "Content-Type": "application/json; charset=utf-8", "Content-Encoding": "gzip" };
  // One retry: a large upload occasionally drops on a slow connection.
  let ok = await putObject(`i18n/or-${version}.json`, body, headers).catch(() => false);
  if (!ok) ok = await putObject(`i18n/or-${version}.json`, body, headers).catch(() => false);
  if (!ok) { console.error("i18n publish: R2 upload failed"); return null; }
  const doc = { version, count, updatedAt: new Date().toISOString() };
  await db.from("site_content").upsert({ key: "i18n", label: "Odia translations (automatic)", draft: doc, published: doc }, { onConflict: "key" });
  return { version, count };
}

/* ── Orchestration ──────────────────────────────────────────────────── */

export type SyncResult = { found: number; queued: number; translated: number; failed: number; pending: number; published: { version: string; count: number } | null; skipped?: string };

export async function syncTranslations({ base, budgetMs = 45_000, crawlSite = true, forcePublish = false }: { base: string; budgetMs?: number; crawlSite?: boolean; forcePublish?: boolean }): Promise<SyncResult> {
  const empty: SyncResult = { found: 0, queued: 0, translated: 0, failed: 0, pending: 0, published: null };
  if (!process.env.OPENROUTER_API_KEY) return { ...empty, skipped: "OPENROUTER_API_KEY not set" };
  if (!hasServiceRole() || !isR2Configured()) return { ...empty, skipped: "Supabase service role or R2 not configured" };
  const started = Date.now();
  const db = createAdminClient();

  // 1-2. Collect and queue new strings.
  let found = 0, queued = 0;
  if (crawlSite) {
    const strings = await crawl(base);
    found = strings.size;
    const rows = [...strings.values()];
    for (let i = 0; i < rows.length; i += 500) {
      const { count } = await db.from("translations")
        .upsert(rows.slice(i, i + 500), { onConflict: "source", ignoreDuplicates: true, count: "exact" });
      queued += count ?? 0;
    }
  }

  // 3. Translate pending rows while time allows.
  let translated = 0, failed = 0;
  const { data: pendingRows } = await db.from("translations").select("source, source_html, kind, attempts")
    .eq("status", "pending").lt("attempts", 4).order("created_at").limit(600);
  const pending = (pendingRows ?? []) as Row[];
  const texts = batches(pending.filter((r) => r.kind === "text"));
  const htmls = batches(pending.filter((r) => r.kind === "html"));
  let modelIndex = 0;
  for (const batch of [...texts, ...htmls]) {
    if (Date.now() - started > budgetMs) break;
    const html = batch[0].kind === "html";
    const items = batch.map((r) => (html ? r.source_html ?? r.source : r.source));
    let out: string[] | null = null, used = "";
    for (let tries = 0; tries < FREE_MODELS.length && !out && Date.now() - started < budgetMs; tries++) {
      const model = FREE_MODELS[(modelIndex + tries) % FREE_MODELS.length];
      out = await callModel(model, items, html).catch(() => null);
      if (out) { used = model; modelIndex = (modelIndex + tries) % FREE_MODELS.length; }
    }
    const now = new Date().toISOString();
    const updates = batch.map((r, i) => {
      const t = out?.[i];
      // Every row carries the same columns: a bulk upsert fills missing ones
      // with NULL, and one NULL in a NOT NULL column would sink the batch.
      if (t && acceptable(r.source, t)) {
        translated++;
        return { source: r.source, source_html: r.source_html, kind: r.kind, odia: westernDigits(t.trim()), status: "done", attempts: r.attempts ?? 0, model: used, updated_at: now };
      }
      const attempts = (r.attempts ?? 0) + 1;
      if (attempts >= 4) failed++;
      return { source: r.source, source_html: r.source_html, kind: r.kind, odia: null, status: attempts >= 4 ? "failed" : "pending", attempts, model: null, updated_at: now };
    });
    const { error: saveError } = await db.from("translations").upsert(updates, { onConflict: "source" });
    if (saveError) translated -= updates.filter((u) => u.status === "done").length;
  }

  const { count: left } = await db.from("translations").select("source", { count: "exact", head: true }).eq("status", "pending");
  // 4. Publish whenever something new was translated (or no dictionary exists yet).
  const { data: current } = await db.from("site_content").select("published").eq("key", "i18n").maybeSingle();
  const published = translated > 0 || forcePublish || !current ? await publish() : null;
  return { found, queued, translated, failed, pending: left ?? 0, published };
}

/** Strings a browser in Odia mode saw without a translation (rate-limited
 *  public endpoint). Queued only: translation happens in the next sync. */
export async function queueMissing(items: string[]): Promise<number> {
  if (!hasServiceRole()) return 0;
  const rows = [...new Set(items.map(norm).filter(worthTranslating))].slice(0, 40).map((source) => ({ source, kind: "text" as const, source_html: null }));
  if (!rows.length) return 0;
  const db = createAdminClient();
  const { count: backlog } = await db.from("translations").select("source", { count: "exact", head: true }).eq("status", "pending");
  if ((backlog ?? 0) > 3000) return 0;
  const { count } = await db.from("translations").upsert(rows, { onConflict: "source", ignoreDuplicates: true, count: "exact" });
  return count ?? 0;
}
