// Bulk-load reviewed Odia translations, then publish the dictionary.
//
//   node scripts/i18n-import.mjs <file.json> [--model=manual] [--base=http://localhost:3000]
//   node scripts/i18n-import.mjs --publish-only [--base=...]
//
// <file.json> is an array of { source, odia, html? }; html: true marks a rich
// block whose Odia keeps the markup (e.g. "<p>...</p>"). `source` must match an existing
// row in public.translations (the normalized English text). Rows are marked done
// so the free models leave them alone; later site changes still go to the models.
// Env comes from .env.local the same way Next loads it.
import { readFileSync } from "node:fs";
import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

nextEnv.loadEnvConfig(process.cwd());
const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
const opt = (name, fallback) => args.find((a) => a.startsWith(`--${name}=`))?.split("=").slice(1).join("=") ?? fallback;
const publishOnly = args.includes("--publish-only");
if (!file && !publishOnly) throw new Error("Usage: node scripts/i18n-import.mjs <file.json> [--model=manual] [--base=URL]");
const base = opt("base", "http://localhost:3000");

async function publish() {
  const secret = process.env.CRON_SECRET;
  if (!secret) return console.log("CRON_SECRET not set; publish from the admin Translations screen.");
  const res = await fetch(`${base}/api/cron/i18n?budget=0&crawl=0&publish=1`, { headers: { Authorization: `Bearer ${secret}` } });
  console.log("publish:", res.status, (await res.text()).slice(0, 300));
}
if (publishOnly) {
  await publish();
  process.exit(0);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
const db = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

const rows = JSON.parse(readFileSync(file, "utf8"));
const model = opt("model", "manual");

const known = new Set();
for (let from = 0; ; from += 1000) {
  const { data, error } = await db.from("translations").select("source").order("source").range(from, from + 999);
  if (error) throw error;
  data.forEach((r) => known.add(r.source));
  if (data.length < 1000) break;
}
let updated = 0;
const now = new Date().toISOString();
for (const r of rows.filter((r) => known.has(r.source))) {
  const { error: e } = await db.from("translations")
    .update({ odia: r.odia.trim(), status: "done", attempts: 0, model, updated_at: now })
    .eq("source", r.source);
  if (e) throw e;
  updated++;
}
// Strings the crawl has not seen yet (text that only appears after a click, say).
const fresh = rows.filter((r) => !known.has(r.source))
  .map((r) => ({ source: r.source, source_html: null, kind: r.html ? "html" : "text", odia: r.odia.trim(), status: "done", attempts: 0, model, updated_at: now }));
if (fresh.length) {
  const { error: e } = await db.from("translations").insert(fresh);
  if (e) throw e;
}
console.log(`updated ${updated}, added ${fresh.length}`);
await publish();
