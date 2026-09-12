// Regenerate the favicon and app icons from the traced logo (lib/logo-art.ts):
//   node scripts/generate-brand-assets.mjs
// Writes app/icon.svg, app/apple-icon.png, public/brand/icon-{192,512}.png and
// .r2-upload/images/brand/logo-*.png (the full lockup, for R2: structured
// data and email). The share image is built separately:
//   node scripts/generate-og-image.mjs
import fs from "node:fs";
import sharp from "sharp";
import { iconSvg, logoSvg } from "../lib/logo-art.ts";

fs.mkdirSync("public/brand", { recursive: true });
fs.mkdirSync(".r2-upload/images/brand", { recursive: true });

fs.writeFileSync("app/icon.svg", iconSvg({ size: 64 }));

// iOS masks its own corners, so the touch icon is full-bleed.
await sharp(Buffer.from(iconSvg({ size: 180, radius: 0 }))).png().toFile("app/apple-icon.png");
for (const size of [192, 512]) {
  await sharp(Buffer.from(iconSvg({ size, radius: 0 }))).png().toFile(`public/brand/icon-${size}.png`);
}
await sharp(Buffer.from(logoSvg())).resize({ width: 1200 }).png({ compressionLevel: 9 }).toFile(".r2-upload/images/brand/logo-1200.png");
await sharp(Buffer.from(iconSvg({ size: 512, radius: 0 }))).png().toFile(".r2-upload/images/brand/logo-square-512.png");

console.log("brand assets written");
