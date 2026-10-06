import { launch, settle, TARGET_URL } from "./lib/browser.mjs";

async function main() {
  const { browser, page } = await launch({ width: 1440, height: 900 });
  try {
    await page.goto(TARGET_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
    await settle(page);

    const sel = "section[class*='why-us_root'] div[style*='rgba(255, 255, 255, 0.8)']";
    const read = async (label) => {
      const v = await page.evaluate((s) => {
        const el = document.querySelector(s);
        if (!el) return null;
        const cs = getComputedStyle(el);
        return {
          transform: cs.transform,
          transformOrigin: cs.transformOrigin,
          width: Math.round(el.getBoundingClientRect().width),
          parentWidth: Math.round(el.parentElement.getBoundingClientRect().width),
          textOpacity: getComputedStyle(el.parentElement).opacity,
        };
      }, sel);
      console.log(label, JSON.stringify(v));
    };

    console.log("--- parked just above the section ---");
    await page.evaluate(() => window.scrollTo(0, 3000));
    await page.waitForTimeout(1800);
    await read("pre ");

    console.log("--- scroll into view, sample every 120ms ---");
    await page.evaluate(() => window.scrollTo(0, 3700));
    for (let i = 0; i < 22; i++) {
      await page.waitForTimeout(120);
      await read(`t=${(i + 1) * 120}ms`);
    }

    console.log("--- scroll back above, sample ---");
    await page.evaluate(() => window.scrollTo(0, 2000));
    for (let i = 0; i < 12; i++) {
      await page.waitForTimeout(150);
      await read(`back t=${(i + 1) * 150}ms`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
