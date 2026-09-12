// Compress the bundled photographs in assets/images into .r2-upload/images,
// ready to be copied to the R2 bucket under the same "images/..." keys:
//   node scripts/prepare-bundled-images.mjs
//   node scripts/upload-bundled-images.mjs     (uses the R2_* keys in .env.local)
// The site never serves these from Vercel: mediaUrl("/images/...") resolves to
// NEXT_PUBLIC_R2_PUBLIC_URL/images/...
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = "assets/images";
const OUT = ".r2-upload/images";
let before = 0, after = 0;

for (const dir of fs.readdirSync(SRC, { withFileTypes: true }).filter((d) => d.isDirectory())) {
  fs.mkdirSync(path.join(OUT, dir.name), { recursive: true });
  for (const file of fs.readdirSync(path.join(SRC, dir.name)).filter((f) => /\.jpe?g$/i.test(f))) {
    const src = path.join(SRC, dir.name, file);
    const dest = path.join(OUT, dir.name, file);
    await sharp(src).rotate().resize({ width: 1920, withoutEnlargement: true }).jpeg({ quality: 74, mozjpeg: true, progressive: true }).toFile(dest);
    before += fs.statSync(src).size;
    after += fs.statSync(dest).size;
    console.log(`${dir.name}/${file}  ${(fs.statSync(dest).size / 1024).toFixed(0)} KB`);
  }
}
console.log(`\n${(before / 1048576).toFixed(1)} MB -> ${(after / 1048576).toFixed(1)} MB`);
