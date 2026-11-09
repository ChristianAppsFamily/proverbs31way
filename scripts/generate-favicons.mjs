/**
 * Direction 2 favicons: ink circle + serif italic "w." (rose period).
 * Colors match landing-d2 / sunday-journal tokens (--ink, --pale, --rose).
 */
import sharp from "sharp";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { writeFileSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "public");

const INK = "#242027";
const PALE = "#f9f7f8";
const ROSE = "#75475b";

/** Circular mark with transparent corners (browser tab icons). */
function markSvg() {
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="32" fill="${INK}"/>
  <text
    x="30.5"
    y="42.5"
    text-anchor="middle"
    font-family="Georgia, 'Times New Roman', 'Iowan Old Style', serif"
    font-style="italic"
    font-weight="400"
    font-size="34"
    fill="${PALE}"
  >w</text>
  <circle cx="45.8" cy="41.4" r="2.85" fill="${ROSE}"/>
</svg>`);
}

/** Full-bleed square for Apple touch icon (no transparency). */
function appleSvg() {
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="180" height="180" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" fill="${INK}"/>
  <text
    x="30.5"
    y="42.5"
    text-anchor="middle"
    font-family="Georgia, 'Times New Roman', 'Iowan Old Style', serif"
    font-style="italic"
    font-weight="400"
    font-size="34"
    fill="${PALE}"
  >w</text>
  <circle cx="45.8" cy="41.4" r="2.85" fill="${ROSE}"/>
</svg>`);
}

const svgFavicon = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="32" fill="${INK}"/>
  <text
    x="30.5"
    y="42.5"
    text-anchor="middle"
    font-family="Georgia, 'Times New Roman', 'Iowan Old Style', serif"
    font-style="italic"
    font-weight="400"
    font-size="34"
    fill="${PALE}"
  >w</text>
  <circle cx="45.8" cy="41.4" r="2.85" fill="${ROSE}"/>
</svg>
`;

writeFileSync(join(outDir, "favicon.svg"), svgFavicon);

await sharp(markSvg()).png().toFile(join(outDir, "favicon.png"));
await sharp(markSvg()).resize(32, 32).png().toFile(join(outDir, "favicon-32.png"));
await sharp(appleSvg()).png().toFile(join(outDir, "apple-touch-icon.png"));

console.log(
  "Generated public/favicon.svg, favicon.png, favicon-32.png, apple-touch-icon.png",
);
