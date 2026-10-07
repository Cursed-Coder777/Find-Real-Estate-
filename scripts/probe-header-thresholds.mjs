import { launch, settle, TARGET_URL } from "./lib/browser.mjs";

async function main() {
  const { browser, page } = await launch({ width: 1440, height: 900 });
  try {
    await page.goto(TARGET_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
    await settle(page);
    const read = () =>
      page.evaluate(() => {
        const h = document.querySelector("header");
        return { y: Math.round(window.scrollY), cls: h.className };
      });

    console.log("--- ascending (find -hidden / -fixed entry) ---");
    for (const y of [0, 50, 90, 100, 110, 120, 150, 400, 800, 880, 900, 1000, 1100, 1200, 1500, 1800, 2200, 2600, 3000]) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(450);
      const r = await read();
      console.log(y, "->", r.y, r.cls.replace(/header_wrapper__\w+ /, ""));
    }

    console.log("--- descending (does -hidden clear?) ---");
    for (const y of [2600, 2000, 1400, 900, 700, 500, 300, 100, 0]) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(600);
      const r = await read();
      console.log(y, "->", r.y, r.cls.replace(/header_wrapper__\w+ /, ""));
    }
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
