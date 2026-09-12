// Render the 1200x630 share card (Open Graph / WhatsApp / X) with the site's
// own fonts and logo, into .r2-upload/images/brand/og-v2.png. Bump the
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
/* Logo centred on brand red: previews that crop to a square (WhatsApp,
   Telegram) still show the logo. Keep everything inside the middle 630px. */
body { width: 1200px; height: 630px; background: #ce0608; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: Switzer, sans-serif; color: #fff; }
.logo { width: 600px; }
.logo svg { width: 100%; height: auto; display: block; }
.name { font-family: Cabinet, sans-serif; font-weight: 800; font-size: 44px; letter-spacing: -.01em; margin-top: 34px; }
.sub { font-size: 24px; opacity: .85; margin-top: 10px; letter-spacing: .02em; }
</style></head><body>
<div class="logo">${logoSvg({ background: "" })}</div>
<p class="name">Samantroy Academy, Brahmapur</p>
<p class="sub">Defence, police, bank and SSC coaching since 2001</p>
</body></html>`;

fs.mkdirSync(".r2-upload/images/brand", { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: ".r2-upload/images/brand/og-v2.png" });
await browser.close();
console.log("wrote .r2-upload/images/brand/og-v2.png");
