/**
 * Builds PNG favicons with a circular mask so corners stay transparent.
 * Source: public/p31-favicon-source.jpg (committed JPEG from brand asset).
 */
import sharp from "sharp";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const input = join(root, "public/p31-favicon-source.jpg");
const outDir = join(root, "public");

function circleMask(size) {
  const r = size / 2;
  return Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><circle cx="${r}" cy="${r}" r="${r}" fill="#ffffff"/></svg>`,
  );
}

function renderCirclePng(size) {
  const mask = circleMask(size);
  return sharp(input)
    .resize(size, size, { fit: "cover", position: "centre" })
    .ensureAlpha()
    .composite([{ input: mask, blend: "dest-in" }])
    .png();
}

await renderCirclePng(512).toFile(join(outDir, "favicon.png"));
await renderCirclePng(32).toFile(join(outDir, "favicon-32.png"));
await renderCirclePng(180).toFile(join(outDir, "apple-touch-icon.png"));

console.log("Generated public/favicon.png, favicon-32.png, apple-touch-icon.png");
