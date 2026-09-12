import "server-only";
import { AwsClient } from "aws4fetch";
import { UPLOAD_CACHE_CONTROL } from "./r2-keys";

/** Cloudflare R2 over its S3 API. Server only: the secret key never reaches
 *  the browser. The browser gets a short-lived signed URL and sends the file
 *  straight to R2, so no upload or image bytes pass through Vercel. */

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID ?? "";
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID ?? "";
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY ?? "";
const BUCKET = process.env.R2_BUCKET ?? "";

export const isR2Configured = () => Boolean(ACCOUNT_ID && ACCESS_KEY_ID && SECRET_ACCESS_KEY && BUCKET);

let client: AwsClient | null = null;
const r2 = () =>
  (client ??= new AwsClient({ accessKeyId: ACCESS_KEY_ID, secretAccessKey: SECRET_ACCESS_KEY, service: "s3", region: "auto" }));

const bucketUrl = () => `https://${ACCOUNT_ID}.r2.cloudflarestorage.com/${BUCKET}`;
const objectUrl = (key: string) => `${bucketUrl()}/${key.split("/").map(encodeURIComponent).join("/")}`;

/** Signed PUT URL valid for five minutes. Content type, length and cache
 *  headers are part of the signature, so the browser cannot swap the file
 *  type or upload more bytes than it declared. */
export async function presignUpload(key: string, contentType: string, size: number) {
  const url = new URL(objectUrl(key));
  url.searchParams.set("X-Amz-Expires", "300");
  const headers = {
    "Content-Type": contentType,
    "Content-Length": String(size),
    "Cache-Control": UPLOAD_CACHE_CONTROL,
  };
  const signed = await r2().sign(new Request(url, { method: "PUT", headers }), {
    aws: { signQuery: true, allHeaders: true },
  });
  // Content-Length is set by the browser itself; it must not be sent by hand.
  return { url: signed.url, headers: { "Content-Type": contentType, "Cache-Control": UPLOAD_CACHE_CONTROL } };
}

/** Newest-first keys under a folder (at most 1000). */
export async function listFolder(folder: string): Promise<string[]> {
  const url = new URL(bucketUrl());
  url.searchParams.set("list-type", "2");
  url.searchParams.set("prefix", `${folder}/`);
  url.searchParams.set("max-keys", "1000");
  const res = await r2().fetch(url.toString());
  if (!res.ok) throw new Error(`R2 list failed (${res.status})`);
  const xml = await res.text();
  const items = [...xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)].map((m) => ({
    key: decodeXml(m[1].match(/<Key>([\s\S]*?)<\/Key>/)?.[1] ?? ""),
    at: m[1].match(/<LastModified>([\s\S]*?)<\/LastModified>/)?.[1] ?? "",
  }));
  return items.filter((i) => i.key && !i.key.endsWith("/")).sort((a, b) => b.at.localeCompare(a.at)).map((i) => i.key);
}

const decodeXml = (s: string) =>
  s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");

/** Server-side upload (small generated files such as the translation
 *  dictionary). Object keys are versioned by the caller, so a year of
 *  browser caching is safe. */
export async function putObject(key: string, body: Uint8Array | string, headers: Record<string, string>): Promise<boolean> {
  // R2 rejects streamed uploads (411), so send plain bytes with their length.
  const bytes = typeof body === "string" ? new TextEncoder().encode(body) : body;
  const res = await r2().fetch(objectUrl(key), {
    method: "PUT",
    body: bytes as BodyInit,
    headers: { "Cache-Control": UPLOAD_CACHE_CONTROL, "Content-Length": String(bytes.byteLength), ...headers },
  });
  if (!res.ok) console.error(`R2 PUT ${key}: ${res.status} ${(await res.text().catch(() => "")).slice(0, 300)}`);
  return res.ok;
}
