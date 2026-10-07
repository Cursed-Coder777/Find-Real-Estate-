// Visual QA: clone (localhost:3100) vs the origin references captured in
// docs/design-references + BEHAVIORS.md (origin doc heights 16289 / 12506 / 23308).
import { launch, settle, SHOT_ROOT, RESEARCH_ROOT, writeJson } from "../scripts/lib/browser.mjs";
import fs from "node:fs";
import path from "node:path";

const CLONE = process.env.CLONE_URL ?? "http://localhost:3100/";
const SUFFIX = process.env.OUT_SUFFIX ?? "";
const ORIGIN_HEIGHTS = { "1440x900": 16289, "768x1024": 12506, "390x844": 23308 };

const failedRequests = [];

async function audit(page, label, shotName) {
  const metrics = await page.evaluate(() => {
    const doc = document.documentElement;
    const sections = [...document.querySelectorAll("main > *")].map((el) => {
      const r = el.getBoundingClientRect();
      const y = r.top + window.scrollY;
      return {
        tag: el.tagName.toLowerCase(),
        cls: (el.className || "").toString().split(" ")[0] || "(section)",
        top: Math.round(y),
        height: Math.round(r.height),
      };
    });
    const header = document.querySelector("header");
    const imgs = [...document.querySelectorAll("img")];
    const broken = imgs
      .filter((i) => i.complete && i.naturalWidth === 0)
      .map((i) => i.getAttribute("src"));
    return {
      docHeight: Math.round(
        Math.max(doc.scrollHeight, document.body.scrollHeight),
      ),
      clientWidth: doc.clientWidth,
      scrollWidth: Math.round(doc.scrollWidth),
      hasHorizontalOverflow: doc.scrollWidth > doc.clientWidth + 1,
      lenisClass: doc.classList.contains("lenis"),
      headerClass: header ? header.className : null,
      sections,
      imgCount: imgs.length,
      brokenImages: broken,
    };
  });

  await page.screenshot({
    path: path.join(SHOT_ROOT, shotName.replace(".png", `${SUFFIX}.png`)),
    fullPage: true,
  });
  const ref = ORIGIN_HEIGHTS[label];
  metrics.heightDeltaVsOrigin = ref ? metrics.docHeight - ref : null;
  return metrics;
}

// ---- desktop ----
{
  const { browser, page } = await launch({ width: 1440, height: 900 });
  page.on("response", (res) => {
    if (res.status() >= 400) failedRequests.push(`${res.status()} ${res.url()}`);
  });
  await page.goto(CLONE, { waitUntil: "domcontentloaded", timeout: 60000 });
  await settle(page);
  const desktop = await audit(page, "1440x900", "clone-full-desktop-1440.png");

  // header behaviour: down => -hidden, up => revealed, past 3x vh => -fixed
  const headerProbe = {};
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(400);
  headerProbe.scrolledDownHidden = (
    await page.evaluate(() => document.querySelector("header").className)
  ).includes("header_-hidden");
  await page.evaluate(() => window.scrollTo(0, 200));
  await page.waitForTimeout(400);
  headerProbe.scrolledUpRevealed = !(
    await page.evaluate(() => document.querySelector("header").className)
  ).includes("header_-hidden");
  await page.evaluate(() => window.scrollTo(0, Math.round(window.innerHeight * 3.2)));
  await page.waitForTimeout(400);
  headerProbe.pastHeroFixed = (
    await page.evaluate(() => document.querySelector("header").className)
  ).includes("header_-fixed");

  // testimonials: bullet 3 switches the slide
  await page.evaluate(() => {
    document.querySelector(".testimonials_root")?.scrollIntoView();
  });
  await page.waitForTimeout(600);
  const bullets = await page.$$(".testimonials_carousel .swiper-pagination-bullet");
  let testimonialProbe = { bulletCount: bullets.length };
  if (bullets.length >= 3) {
    await bullets[2].click();
    await page.waitForTimeout(700);
    testimonialProbe.activeAuthorAfterBullet3 = await page.evaluate(
      () =>
        document.querySelector(
          ".testimonials_carousel .swiper-slide-active .testimonials_author",
        )?.textContent ?? null,
    );
    testimonialProbe.bullet3Active = await page.evaluate(() =>
      document
        .querySelectorAll(".testimonials_carousel .swiper-pagination-bullet")[2]
        ?.classList.contains("swiper-pagination-bullet-active"),
    );
  }

  // services hover reveal
  await page.evaluate(() => {
    document.querySelector(".services_root")?.scrollIntoView();
  });
  await page.waitForTimeout(600);
  const item = await page.$(".services_item");
  let servicesHover = null;
  if (item) {
    await item.hover();
    await page.waitForTimeout(900);
    servicesHover = await page.evaluate(() => {
      const bg = document.querySelector(".services_item .services_item-bg");
      return bg ? getComputedStyle(bg).opacity : null;
    });
  }

  writeJson(path.join(RESEARCH_ROOT, `visual-qa-desktop${SUFFIX}.json`), {
    ...desktop,
    headerProbe,
    testimonialProbe,
    servicesHover,
  });
  await browser.close();
}

// ---- mobile ----
{
  const { browser, page } = await launch({ width: 390, height: 844 });
  page.on("response", (res) => {
    if (res.status() >= 400) failedRequests.push(`${res.status()} ${res.url()}`);
  });
  await page.goto(CLONE, { waitUntil: "domcontentloaded", timeout: 60000 });
  await settle(page);
  const mobile = await audit(page, "390x844", "clone-full-mobile-390.png");
  writeJson(path.join(RESEARCH_ROOT, `visual-qa-mobile${SUFFIX}.json`), mobile);
  await browser.close();
}

const summary = {
  failedRequests,
};
fs.writeFileSync(
  path.join(RESEARCH_ROOT, `visual-qa-summary${SUFFIX}.json`),
  JSON.stringify(summary, null, 2),
);
console.log(JSON.stringify(summary, null, 2));
