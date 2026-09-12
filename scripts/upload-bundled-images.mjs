// Upload the compressed bundled photographs (.r2-upload/images, made by
// prepare-bundled-images.mjs) to the R2 bucket named in .env.local.
// Run once per bucket: node scripts/upload-bundled-images.mjs
import fs from "node:fs";
import path from "node:path";
import { AwsClient } from "aws4fetch";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/)
    .filter((l) => /^[A-Z0-9_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim()]),
);
for (const k of ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET"]) {
  if (!env[k]) throw new Error(`${k} missing from .env.local`);
}

const r2 = new AwsClient({ accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY, service: "s3", region: "auto" });
const base = `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${env.R2_BUCKET}`;
const ROOT = ".r2-upload";

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));

for (const file of walk(path.join(ROOT, "images"))) {
  const key = path.relative(ROOT, file).split(path.sep).join("/");
  const res = await r2.fetch(`${base}/${key}`, {
    method: "PUT",
    body: fs.readFileSync(file),
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=31536000, immutable" },
  });
  console.log(`${res.ok ? "ok " : "ERR"} ${key}${res.ok ? "" : ` (${res.status})`}`);
}
