/**
 * Direction 2 favicons: white circle + serif italic "w." in brand ink (#242027).
 * Ink is the dark navy-charcoal used across the landing and journal.
 */
import sharp from "sharp";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { writeFileSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "public");

const INK = "#242027";
const WHITE = "#ffffff";

/** Circular mark with transparent corners (browser tab icons). */
function markSvg() {
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="32" fill="${WHITE}"/>
  <circle cx="32" cy="32" r="30.5" fill="none" stroke="${INK}" stroke-width="1.25" opacity="0.18"/>
  <text
    x="30.5"
    y="42.5"
    text-anchor="middle"
    font-family="Georgia, 'Times New Roman', 'Iowan Old Style', serif"
    font-style="italic"
    font-weight="400"
    font-size="34"
    fill="${INK}"
  >w</text>
  <circle cx="45.8" cy="41.4" r="2.85" fill="${INK}"/>
</svg>`);
}

/** Full-bleed square for Apple touch icon (no transparency). */
function appleSvg() {
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="180" height="180" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" fill="${WHITE}"/>
  <text
    x="30.5"
    y="42.5"
    text-anchor="middle"
    font-family="Georgia, 'Times New Roman', 'Iowan Old Style', serif"
    font-style="italic"
    font-weight="400"
    font-size="34"
    fill="${INK}"
  >w</text>
  <circle cx="45.8" cy="41.4" r="2.85" fill="${INK}"/>
</svg>`);
}

const svgFavicon = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="32" fill="${WHITE}"/>
  <circle cx="32" cy="32" r="30.5" fill="none" stroke="${INK}" stroke-width="1.25" opacity="0.18"/>
  <text
    x="30.5"
    y="42.5"
    text-anchor="middle"
    font-family="Georgia, 'Times New Roman', 'Iowan Old Style', serif"
    font-style="italic"
    font-weight="400"
    font-size="34"
    fill="${INK}"
  >w</text>
  <circle cx="45.8" cy="41.4" r="2.85" fill="${INK}"/>
</svg>
`;

writeFileSync(join(outDir, "favicon.svg"), svgFavicon);

await sharp(markSvg()).png().toFile(join(outDir, "favicon.png"));
await sharp(markSvg()).resize(32, 32).png().toFile(join(outDir, "favicon-32.png"));
await sharp(appleSvg()).png().toFile(join(outDir, "apple-touch-icon.png"));

console.log(
  "Generated public/favicon.svg, favicon.png, favicon-32.png, apple-touch-icon.png",
);
