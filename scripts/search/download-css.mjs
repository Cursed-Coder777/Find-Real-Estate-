// Downloads the origin's stylesheets for /search into the search page's own
// source-css/ directory.
//
// The homepage capture is stale for this route: the origin was redeployed
// (deploy ids differ), and /search pulls 19 stylesheets of which several
// route-specific modules were never fetched. Nothing in the existing pipeline
// writes source-css/, so this does it explicitly.
//
// Writes:
//   docs/research/<SITE_KEY>/<PAGE_KEY>/source-css/*.css
//   docs/research/<SITE_KEY>/<PAGE_KEY>/css-urls.txt
//   docs/research/<SITE_KEY>/<PAGE_KEY>/chunks.txt
import fs from "node:fs";
import path from "node:path";
import { launch } from "../lib/browser.mjs";

const SITE_KEY = "www-findrealestate-com-715c1bfa";
const PAGE_KEY = "search-6fb5b778";
const TARGET = "https://www.findrealestate.com/search";
const ROOT = process.cwd();
const RES = path.join(ROOT, "docs/research", SITE_KEY, PAGE_KEY);
const SRC = path.join(RES, "source-css");

fs.mkdirSync(SRC, { recursive: true });

const { browser, page } = await launch({ width: 1440, height: 900 });

// collect every stylesheet + script the route requests
const cssUrls = new Set();
const jsUrls = new Set();
page.on("response", (r) => {
  const u = r.url();
  if (/\/_next\/static\/css\//.test(u) && u.endsWith(".css")) cssUrls.add(u);
  if (/\/_next\/static\/chunks\//.test(u) && /\.js$/.test(u)) jsUrls.add(u);
});

// `networkidle` never settles here — the map view keeps connections open — so
// wait on load plus a fixed settle, the same approach as the other probes.
await page.goto(TARGET, { waitUntil: "domcontentloaded", timeout: 120000 });
await page.waitForTimeout(6000);
// also read the <link rel=stylesheet> tags in case some are cached
await page.evaluate(() => {
  for (const l of document.querySelectorAll('link[rel="stylesheet"]')) {
    if (l.href) window.__css = [...(window.__css ?? []), l.href];
  }
});
const inline = await page.evaluate(() => window.__css ?? []);
inline.forEach((u) => cssUrls.add(u));

await page.waitForTimeout(2000);

const list = [...cssUrls].sort();
fs.writeFileSync(path.join(RES, "css-urls.txt"), list.join("\n"));
fs.writeFileSync(path.join(RES, "chunks.txt"), [...jsUrls].sort().join("\n"));

console.log(`stylesheets: ${list.length}`);
let ok = 0;
for (const u of list) {
  const name = new URL(u).pathname.split("/").pop();
  const dest = path.join(SRC, name);
  try {
    const res = await page.request.get(u, { timeout: 45000 });
    if (!res.ok()) {
      console.log(`  FAIL ${res.status()} ${name}`);
      continue;
    }
    const body = await res.text();
    fs.writeFileSync(dest, body);
    ok++;
    console.log(`  ${String(body.length).padStart(7)}  ${name}`);
  } catch (e) {
    console.log(`  ERR  ${name}  ${String(e).slice(0, 60)}`);
  }
}
console.log(`\ndownloaded ${ok}/${list.length} into ${SRC}`);
console.log(`scripts recorded: ${jsUrls.size}`);

await browser.close();