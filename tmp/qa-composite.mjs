// Verify .hero_composite seed (opacity 0 at rest -> 1 when scrolled) and
// classify console errors (expect only <Link> prefetch 404s to missing routes).
import { launch } from "../scripts/lib/browser.mjs";

const CLONE = process.env.CLONE_URL ?? "http://localhost:3100/";
const errors = [];

const { browser, page } = await launch({ width: 1440, height: 900 });
page.on("response", (res) => {
  if (res.status() >= 400) errors.push(`${res.status()} ${new URL(res.url()).pathname}`);
});
await page.goto(CLONE, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(2000);

const states = [];
for (const y of [0, 3000]) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(700);
  states.push(
    await page.evaluate(() => ({
      y: Math.round(window.scrollY),
      composite: getComputedStyle(document.querySelector("[data-hero-composite]")).opacity,
      logo: getComputedStyle(document.querySelector("[data-hero-logo]")).opacity,
      smoke: getComputedStyle(document.querySelector("[data-hero-smoke-top]")).transform.slice(0, 50),
    })),
  );
}

console.log(JSON.stringify({ states, failedRequests: errors }, null, 2));
await browser.close();
