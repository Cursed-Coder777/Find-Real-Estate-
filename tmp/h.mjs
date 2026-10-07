import { launch, settle, TARGET_URL } from "../scripts/lib/browser.mjs";
const { browser, page } = await launch({ width: 1440, height: 900 });
await page.goto(TARGET_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
await settle(page);
for (const y of [2650, 2690, 2700, 2710, 2750, 2800, 2900, 3000]) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(500);
  const c = await page.evaluate(() => document.querySelector("header").className);
  console.log(y, c.includes("header_-fixed") ? "FIXED" : "-");
}
await browser.close();
