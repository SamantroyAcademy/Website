// Render the 1200x630 share card (Open Graph / WhatsApp / X) with the site's
// own fonts and logo, into .r2-upload/images/brand/og-v1.png. Bump the
// version in the file name (and OG_IMAGE in lib/structured-data.ts) when the
// design changes: R2 objects are cached for a year.
//   PLAYWRIGHT=<path to playwright package> node scripts/generate-og-image.mjs
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { logoSvg } from "../lib/logo-art.ts";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT || "playwright");
// Fonts are inlined: a page set from a string cannot read file:// URLs.
const font = (f) => `url(data:font/woff2;base64,${fs.readFileSync(path.join("app/fonts", f)).toString("base64")}) format("woff2")`;

const html = `<!doctype html><html><head><style>
@font-face { font-family: Cabinet; src: ${font("cabinet-grotesk-800.woff2")}; font-weight: 800; }
@font-face { font-family: Switzer; src: ${font("switzer-600.woff2")}; font-weight: 600; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; display: flex; font-family: Switzer, sans-serif; background: #f4f4f1; }
.left { width: 500px; background: #ce0608; display: flex; align-items: center; justify-content: center; padding: 48px; }
.left svg { width: 100%; height: auto; }
.right { flex: 1; padding: 64px 64px 56px; display: flex; flex-direction: column; }
.kicker { color: #b30508; font-weight: 600; font-size: 22px; letter-spacing: .12em; }
h1 { font-family: Cabinet, sans-serif; font-weight: 800; font-size: 60px; line-height: 1.02; letter-spacing: -.02em; color: #12151f; margin-top: 22px; }
.sub { margin-top: 22px; font-size: 25px; color: #343a4b; line-height: 1.35; }
.foot { margin-top: auto; display: flex; justify-content: space-between; font-size: 22px; color: #12151f; font-weight: 600; border-top: 2px solid #d3d6df; padding-top: 22px; }
</style></head><body>
<div class="left">${logoSvg({ background: "" })}</div>
<div class="right">
  <p class="kicker">SINCE 2001 &middot; 4000+ RECRUITMENTS</p>
  <h1>Defence, police, bank and SSC coaching in Brahmapur</h1>
  <p class="sub">Army, Navy, Air Force, CAPF, Odisha Police, OSSC, OPSC, Railway and NDA. Join after +2 or graduation.</p>
  <div class="foot"><span>Samantroy Academy, Ganjam</span><span>98610 77371</span></div>
</div>
</body></html>`;

fs.mkdirSync(".r2-upload/images/brand", { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: ".r2-upload/images/brand/og-v1.png" });
await browser.close();
console.log("wrote .r2-upload/images/brand/og-v1.png");
