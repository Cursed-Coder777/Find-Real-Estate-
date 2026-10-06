import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

export const SITE_KEY = "www-findrealestate-com-715c1bfa";
export const PAGE_KEY = "root-8a5edab2";
export const APP_ROOT = process.cwd();
export const RESEARCH_ROOT = path.join(
  APP_ROOT,
  "docs/research",
  SITE_KEY,
  PAGE_KEY,
);
export const SHOT_ROOT = path.join(
  APP_ROOT,
  "docs/design-references",
  SITE_KEY,
  PAGE_KEY,
);

export const TARGET_URL = "https://www.findrealestate.com/";

export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

export async function launch({ width = 1440, height = 900 } = {}) {
  const browser = await chromium.launch({
    executablePath: "/usr/bin/chromium",
    args: [
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--hide-scrollbars",
      "--force-color-profile=srgb",
    ],
  });
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36",
    locale: "en-US",
  });
  const page = await context.newPage();
  return { browser, context, page };
}

export async function settle(page, ms = 1200) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(ms);
  // scroll through the page to trigger lazy loads / reveal animations, then return to top
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.8);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 400));
  });
  await page.waitForTimeout(ms);
  try {
    await page.waitForLoadState("networkidle", { timeout: 8000 });
  } catch {
    /* ignore */
  }
}

export function writeJson(file, data) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  return file;
}
