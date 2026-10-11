// Captures /search listing data page by page via the origin's own pagination
// query params (?page=N), then downloads every referenced asset into the
// search page's own public asset root.
//
// Usage:
//   node scripts/search/capture-listings.mjs [--pages 10] [--no-images]
//   node scripts/search/capture-listings.mjs --download-only
//
// Writes:
//   docs/research/www-findrealestate-com-715c1bfa/search-6fb5b778/listings.json
//   docs/research/.../assets.txt
//   docs/research/.../ARTIFACT_MANIFEST.json
//   public/sites/www-findrealestate-com-715c1bfa/search-6fb5b778/images/*
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { launch } from "../lib/browser.mjs";

const SITE_KEY = "www-findrealestate-com-715c1bfa";
const PAGE_KEY = "search-6fb5b778";
const ORIGIN = "https://www.findrealestate.com";
const BASE_QUERY = "Type=sale&PropertyType=residential&address=Manhattan";

const ROOT = process.cwd();
const RES = path.join(ROOT, "docs/research", SITE_KEY, PAGE_KEY);
const PUBLIC = path.join(ROOT, "public/sites", SITE_KEY, PAGE_KEY, "images");

const argv = process.argv.slice(2);
const argOf = (flag, dflt) => {
  const i = argv.indexOf(flag);
  return i !== -1 && argv[i + 1] ? argv[i + 1] : dflt;
};
const PAGES = Number(argOf("--pages", 10));
const SKIP_IMAGES = argv.includes("--no-images");
const DOWNLOAD_ONLY = argv.includes("--download-only");

const ensure = (d) => fs.mkdirSync(d, { recursive: true });

/**
 * Deterministic, collision-free local filename.
 *
 * Basenames are NOT unique across this route: every Compass listing serves a
 * different image at a URL ending in `origin.jpg`, and 64 of the 346 asset URLs
 * collide that way. Naming by basename alone made each one overwrite the last,
 * so ~64 listings ended up showing another listing's agency logo. Colliding
 * names therefore get a short hash of the full URL appended.
 */
function planNames(urls) {
  const byBase = new Map();
  for (const u of urls) {
    let b;
    try {
      b = new URL(u).pathname.split("/").pop().split("?")[0];
    } catch {
      b = "";
    }
    b = b || `asset-${crypto.createHash("sha1").update(u).digest("hex").slice(0, 8)}`;
    if (!byBase.has(b)) byBase.set(b, []);
    byBase.get(b).push(u);
  }
  const plan = new Map();
  for (const [b, group] of byBase) {
    for (const u of group) {
      plan.set(
        u,
        group.length === 1
          ? b
          : `${crypto.createHash("sha1").update(u).digest("hex").slice(0, 8)}-${b}`,
      );
    }
  }
  return plan;
}

const { browser, page } = await launch({ width: 1440, height: 900 });

const extract = () =>
  page.evaluate(() => {
    const cards = [...document.querySelectorAll('[class*="listing-card_container"]')];
    return {
      resultCount:
        document.querySelector('[class*="list-view_list-count"]')?.innerText?.trim() ??
        null,
      cards: cards.map((card) => {
        const addr =
          card.querySelector('[class*="listing-card_address"]')?.innerText?.trim() ??
          "";
        const amenities = [
          ...card.querySelectorAll('[class*="listing-card_amenities"] span'),
        ]
          .map((s) => s.innerText.trim())
          .filter(Boolean);
        const slides = [
          ...card.querySelectorAll('[class*="hover-gallery_slide"] img'),
        ].map((img) => ({
          src: img.currentSrc || img.src,
          w: img.naturalWidth,
          h: img.naturalHeight,
          broken: img.complete && img.naturalWidth === 0,
        }));
        const logo = card.querySelector(
          '[class*="hover-gallery_data-source-logo"] img, [class*="data-source-logo-image"]',
        );
        const price =
          card.innerText.match(/\$[\d,]+/)?.[0] ??
          amenities.find((a) => a.startsWith("$")) ??
          null;
        return {
          href: card.querySelector("a")?.getAttribute("href") ?? null,
          price,
          amenities,
          address: addr,
          images: slides.map((s) => s.src),
          imageMeta: slides,
          dataSourceLogo: logo ? logo.currentSrc || logo.src : null,
          rawText: card.innerText.replace(/\n+/g, " | ").slice(0, 300),
        };
      }),
    };
  });

let listings = [];
let resultCount = null;
let urls = [];

if (DOWNLOAD_ONLY) {
  const saved = JSON.parse(
    fs.readFileSync(path.join(RES, "listings.json"), "utf8"),
  );
  resultCount = saved.resultCountOnOrigin;
  listings = saved.listings;
  urls = fs
    .readFileSync(path.join(RES, "assets.txt"), "utf8")
    .split("\n")
    .filter(Boolean);
  console.log(`--download-only: reusing ${listings.length} listings, ${urls.length} urls`);
} else {
  for (let p = 1; p <= PAGES; p++) {
    const url = `${ORIGIN}/search?${BASE_QUERY}&page=${p}`;
    process.stdout.write(`page ${p}/${PAGES} … `);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.waitForTimeout(2600);
    await page
      .evaluate(async () => {
        const step = 500;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 90));
        }
        scrollTo(0, 0);
      })
      .catch(() => {});
    await page.waitForTimeout(1200);

    const { cards, resultCount: rc } = await extract();
    if (!cards.length) {
      console.log("no cards, stopping");
      break;
    }
    console.log(`${cards.length} cards`);
    if (p === 1) resultCount = rc;
    for (const c of cards) {
      c.page = p;
      listings.push(c);
    }
  }

  const seen = new Set();
  listings = listings.filter((l) => {
    const k = l.href ?? JSON.stringify(l.images);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  const assetUrls = new Set();
  for (const c of listings) {
    for (const i of c.images) if (i) assetUrls.add(i);
    if (c.dataSourceLogo) assetUrls.add(c.dataSourceLogo);
  }
  urls = [...assetUrls].sort();

  ensure(RES);
  fs.writeFileSync(
    path.join(RES, "listings.json"),
    JSON.stringify(
      {
        source: `${ORIGIN}/search?${BASE_QUERY}`,
        capturedAt: new Date().toISOString(),
        pagesRequested: PAGES,
        resultCountOnOrigin: resultCount,
        cardCount: listings.length,
        listings,
      },
      null,
      2,
    ),
  );
  fs.writeFileSync(path.join(RES, "assets.txt"), urls.join("\n"));
  console.log(
    `\ncaptured ${listings.length} unique listings from ${PAGES} pages (origin reports ${resultCount})`,
  );
  console.log(`asset urls: ${urls.length}`);
}

if (SKIP_IMAGES) {
  console.log("--no-images: skipping download");
  await browser.close();
  process.exit(0);
}

// ---------- download ----------
ensure(PUBLIC);
const names = planNames(urls);
const disambiguated = [...names.values()].filter((n) => /^[0-9a-f]{8}-/.test(n)).length;
console.log(
  `naming: ${urls.length - disambiguated} plain, ${disambiguated} hash-suffixed (collision-free)`,
);

const manifest = [];
let ok = 0;
let failed = 0;
const broken = [];

for (const [i, u] of urls.entries()) {
  const name = names.get(u);
  const dest = path.join(PUBLIC, name);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
    ok++;
    manifest.push({
      source: u,
      local: `/sites/${SITE_KEY}/${PAGE_KEY}/images/${name}`,
      status: "cached",
    });
    continue;
  }
  try {
    const res = await page.request.get(u, { timeout: 45000 });
    if (!res.ok()) {
      failed++;
      broken.push({ source: u, status: res.status() });
      continue;
    }
    const buf = await res.body();
    fs.writeFileSync(dest, buf);
    ok++;
    manifest.push({
      source: u,
      local: `/sites/${SITE_KEY}/${PAGE_KEY}/images/${name}`,
      status: "ok",
      bytes: buf.length,
    });
  } catch (e) {
    failed++;
    broken.push({ source: u, status: String(e).slice(0, 80) });
  }
  if ((i + 1) % 25 === 0) console.log(`  ${i + 1}/${urls.length}`);
}

fs.writeFileSync(
  path.join(RES, "ARTIFACT_MANIFEST.json"),
  JSON.stringify(
    {
      page: `${ORIGIN}/search`,
      listingCount: listings.length,
      total: urls.length,
      ok,
      failed,
      // The origin itself serves broken images on this route; per the agreed
      // scope these are replicated as-is rather than substituted.
      brokenOnOrigin: broken,
      assets: manifest,
    },
    null,
    2,
  ),
);

console.log(`\ndownloaded ${ok}/${urls.length} (${failed} failed)`);
if (broken.length) {
  console.log("failed:");
  broken.slice(0, 25).forEach((b) => console.log(`  ${b.status}  ${b.source.slice(0, 110)}`));
}
await browser.close();