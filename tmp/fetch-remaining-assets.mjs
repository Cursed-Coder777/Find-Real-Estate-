// One-off: download the one remaining remote content image (elliman webp) and
// add the origin `/_next/image` proxied URLs for services/features images to
// content-asset-map.json so `scripts/gen-data.mjs` resolves them to the local
// copies that already exist under public/sites/<site-key>/<page-key>/images/.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const RES =
  "docs/research/www-findrealestate-com-715c1bfa/root-8a5edab2";
const CONTENT_DIR = `public/sites/www-findrealestate-com-715c1bfa/root-8a5edab2/content`;
const DPL = "dpl_E86Ds6cCHMp9Avt5yexnuT17gnnP";

const mapPath = path.join(RES, "content-asset-map.json");
const map = JSON.parse(fs.readFileSync(mapPath, "utf8"));

/** Same naming convention as the previous downloader: <basename>-<6hex>.<ext> */
function localName(url) {
  const base = url.split("/").pop() ?? "asset";
  const dot = base.lastIndexOf(".");
  const stem = dot === -1 ? base : base.slice(0, dot);
  const ext = dot === -1 ? "bin" : base.slice(dot + 1);
  const hash = crypto.createHash("sha256").update(url).digest("hex").slice(0, 6);
  return `${stem}-${hash}.${ext}`;
}

async function download(url, file) {
  const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1000) throw new Error(`suspiciously small (${buf.length}B) ${url}`);
  fs.writeFileSync(file, buf);
  return buf.length;
}
void download;

// 0) The elliman webp the earlier downloader skipped now 404s (the origin's
// CDN rotated listings). Substitute the other Chelsea capture from the same
// row so the demo card stays fully local; recorded here for auditability.
const elliman =
  "https://media.elliman.com/01a0f44b-e732-71f0-ad28-796769676fb7.webp";
const ellimanLocal =
  "/sites/www-findrealestate-com-715c1bfa/root-8a5edab2/content/115033550_DSC_8986_1-e01e5f.jpg";
map[elliman] = ellimanLocal;

// 2) `/_next/image` proxy URLs for the services/features card images — the raw
// media files are already downloaded under images/, so point at those.
const mediaToImage = {
  buy: "buy.fed72bc8.jpg",
  sell: "sell.90b8e66b.jpg",
  rent: "rent.6736c732.jpg",
  "mortgage-services": "mortgage-services.e92904b1.jpg",
  "property-management": "property-management.7a9cbb34.jpg",
  development: "development.0de63e1b.jpg",
};
for (const [stem, file] of Object.entries(mediaToImage)) {
  const proxied = `/_next/image?url=%2F_next%2Fstatic%2Fmedia%2F${encodeURIComponent(
    file,
  )}&w=1920&q=75&dpl=${DPL}`;
  map[proxied] = `/sites/www-findrealestate-com-715c1bfa/root-8a5edab2/images/${file}`;
}

fs.writeFileSync(mapPath, JSON.stringify(map, null, 2) + "\n");
console.log("asset map entries:", Object.keys(map).length);
