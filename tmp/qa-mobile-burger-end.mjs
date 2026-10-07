import { launch } from "../scripts/lib/browser.mjs";

const CLONE = process.env.CLONE_URL ?? "http://localhost:3001/";
const { browser, page } = await launch({ width: 390, height: 844 });
await page.goto(CLONE, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.evaluate((ms) => setTimeout(ms, ms), 2200);

const data = await page.evaluate(() => {
  const burger = document.querySelector(".burger-btn_btn") || document.querySelector("[aria-label='Menu control']") || document.querySelector(".header_burger-control");
  const spans = burger ? [...burger.querySelectorAll("span")] : [];
  const rects = spans.map((s) => s.getBoundingClientRect());
  return {
    burgerPresent: !!burger,
    spansCount: spans.length,
    rects: rects.map((r) => ({ w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), bottom: Math.round(r.bottom) })),
    burgerComputed: burger ? { display: getComputedStyle(burger).display, height: getComputedStyle(burger).height, overflow: getComputedStyle(burger).overflow } : null,
  };
});
await browser.close();
console.log(JSON.stringify(data, null, 2));
console.log("two lines:", data.spansCount === 2, "both nonzero:", data.rects.every((r) => r.h > 0 && r.w > 0), "separated:", data.rects.length === 2 && Math.abs(data.rects[0].top - data.rects[1].top) > 2);
