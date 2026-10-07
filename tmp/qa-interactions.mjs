// QA sweep for the remaining interactive behaviors: hero scroll scrub,
// arrows marquee (desktop) and burger menu (mobile), plus console errors.
import { launch } from "../scripts/lib/browser.mjs";

const CLONE = process.env.CLONE_URL ?? "http://localhost:3100/";
const errors = [];

function watch(page) {
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text().slice(0, 300));
  });
  page.on("pageerror", (err) => errors.push(`pageerror: ${String(err).slice(0, 300)}`));
}

// ---------- desktop: hero scrub + arrows marquee ----------
const heroStates = [];
let arrows = null;
{
  const { browser, page } = await launch({ width: 1440, height: 900 });
  watch(page);
  await page.goto(CLONE, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(2000);

  for (const y of [0, 600, 3000]) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(700);
    heroStates.push(
      await page.evaluate(() => {
        const g = (sel) => {
          const el = document.querySelector(sel);
          return el ? getComputedStyle(el) : null;
        };
        const content = g(".hero_content");
        const house = g("[data-hero-house]");
        const logo = g("[data-hero-logo]");
        return {
          scrollY: Math.round(window.scrollY),
          contentOpacity: content?.opacity,
          houseTransform: house?.transform,
          logoOpacity: logo?.opacity,
        };
      }),
    );
  }

  await page.evaluate(() => {
    document
      .querySelector(".arrows-section_root")
      ?.scrollIntoView({ block: "center" });
  });
  await page.waitForTimeout(500);
  const sample = () =>
    page.evaluate(() => {
      const els = [...document.querySelectorAll(".arrows-section_root *")];
      for (const el of els) {
        const t = getComputedStyle(el).transform;
        if (t && t !== "none" && t !== "matrix(1, 0, 0, 1, 0, 0)") return t;
      }
      return null;
    });
  const a1 = await sample();
  await page.waitForTimeout(1200);
  const a2 = await sample();
  arrows = { before: a1, after: a2, animating: a1 !== a2 && a1 !== null };
  await browser.close();
}

// ---------- mobile: burger menu ----------
let burger = null;
{
  const { browser, page } = await launch({ width: 390, height: 844 });
  watch(page);
  await page.goto(CLONE, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(2000);

  const btn = await page.$(".burger-btn_btn");
  burger = { buttonFound: Boolean(btn) };
  if (btn) {
    await btn.click();
    await page.waitForTimeout(700);
    burger.open = await page.evaluate(() => ({
      dataOpen: document
        .querySelector(".burger-menu_wrapper")
        ?.getAttribute("data-open"),
      backdropTransform: getComputedStyle(
        document.querySelector(".burger-menu_backdrop"),
      ).transform.slice(0, 40),
      htmlClasses: document.documentElement.className,
      opacity: getComputedStyle(
        document.querySelector(".burger-menu_wrapper"),
      ).opacity,
    }));
    await btn.click();
    await page.waitForTimeout(700);
    burger.closed = await page.evaluate(() => ({
      dataOpen: document
        .querySelector(".burger-menu_wrapper")
        ?.getAttribute("data-open"),
      htmlClasses: document.documentElement.className,
    }));
  }
  await browser.close();
}

console.log(
  JSON.stringify({ heroStates, arrows, burger, consoleErrors: errors }, null, 2),
);
