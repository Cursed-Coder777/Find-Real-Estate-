import fs from "node:fs";
import path from "node:path";
import { launch, settle, RESEARCH_ROOT, TARGET_URL } from "./lib/browser.mjs";

const PROBE = () => {
  const out = [];
  // Highlight overlays: absolutely positioned divs with the translucent white bg
  document
    .querySelectorAll('div[style*="rgba(255, 255, 255, 0.8)"], div[style*="rgba(255,255,255,0.8)"]')
    .forEach((el, i) => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      out.push({
        i,
        parentSection: el.closest("section")?.className || el.closest("main")?.className,
        transform: cs.transform,
        scale: cs.scale,
        opacity: cs.opacity,
        width: Math.round(r.width),
        parentWidth: Math.round(el.parentElement.getBoundingClientRect().width),
        inset: cs.inset,
        origin: cs.transformOrigin,
      });
    });
  return out;
};

const REVEAL_PROBE = () => {
  const out = [];
  document.querySelectorAll("h1, h2, .em, p, span").forEach((el) => {
    if (!el.className && el.tagName !== "H1" && el.tagName !== "H2") return;
    const inline = el.getAttribute("style") || "";
    if (!inline) return;
    out.push({
      tag: el.tagName,
      cls: (el.className || "").toString().slice(0, 60),
      style: inline.slice(0, 200),
    });
  });
  return out.slice(0, 60);
};

async function main() {
  const { browser, page } = await launch({ width: 1440, height: 900 });
  const report = {};
  try {
    await page.goto(TARGET_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
    await settle(page);
    for (const y of [0, 3600, 4200, 7300, 8200, 10300, 11100, 12000, 15600]) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(1400);
      report[y] = {
        highlights: await page.evaluate(PROBE),
        reveals: await page.evaluate(REVEAL_PROBE),
      };
      console.log("--- scroll", y, "highlights:", report[y].highlights.length, "reveals:", report[y].reveals.length);
    }
    fs.writeFileSync(path.join(process.cwd(), "docs/research/www-findrealestate-com-715c1bfa/root-8a5edab2/highlight-probe.json"), JSON.stringify(report, null, 2));
    // summarise
    for (const [y, v] of Object.entries(report)) {
      console.log("== y=" + y);
      v.highlights.slice(0, 6).forEach((h) =>
        console.log("   ", h.parentSection?.split(" ")[0], "transform:", h.transform, "op:", h.opacity, "w:", h.width + "/" + h.parentWidth, h.transformOrigin),
      );
    }
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
