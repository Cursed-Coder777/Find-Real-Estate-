// Localize the mobile doc-height delta: per-section heights, live origin vs clone.
import { launch } from "../scripts/lib/browser.mjs";

const URLS = {
  origin: "https://www.findrealestate.com/",
  clone: "http://localhost:3100/",
};

async function sections(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll("main > *")].map((el) => {
      const r = el.getBoundingClientRect();
      return {
        cls: (el.className || "").toString().split(" ")[0] || "(section)",
        top: Math.round(r.top + window.scrollY),
        height: Math.round(r.height),
      };
    }),
  );
}

const results = {};
for (const [label, url] of Object.entries(URLS)) {
  const { browser, page } = await launch({ width: 390, height: 844 });
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(2500);
  // walk the page so lazy content settles, like the original capture did
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.8);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 100));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1500);
  results[label] = await sections(page);
  results[label + "_docHeight"] = await page.evaluate(() =>
    Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
  );
  await browser.close();
}

const o = results.origin ?? [];
const c = results.clone ?? [];
console.log("origin docHeight", results.origin_docHeight, "clone docHeight", results.clone_docHeight);
for (let i = 0; i < Math.max(o.length, c.length); i++) {
  const a = o[i];
  const b = c[i];
  const dh = a && b ? b.height - a.height : "?";
  console.log(
    String(i).padStart(2),
    (a?.cls ?? "-").padEnd(24),
    "origin", String(a?.height ?? "-").padStart(6),
    "clone", String(b?.height ?? "-").padStart(6),
    "Δ", dh,
  );
}
