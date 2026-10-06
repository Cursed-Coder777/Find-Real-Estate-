import fs from "node:fs";
import path from "node:path";
import { launch, settle, RESEARCH_ROOT, TARGET_URL } from "./lib/browser.mjs";

const grab = (selector) => {
  const el = document.querySelector(selector);
  return el ? el.outerHTML : null;
};

const WANTED = {
  header: "header",
  "burger-menu": '[class*="burger-menu_wrapper"]',
  footer: '[class*="footer_wrapper"]',
};

async function main() {
  const { browser, page } = await launch({ width: 1440, height: 900 });
  const out = {};
  try {
    await page.goto(TARGET_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
    await settle(page);
    for (const [name, sel] of Object.entries(WANTED)) {
      const html = await page.evaluate(grab, sel);
      out[name] = html;
      console.log(name, html ? html.length : "NOT FOUND");
    }
    const dir = path.join(RESEARCH_ROOT, "chrome");
    fs.mkdirSync(dir, { recursive: true });
    for (const [name, html] of Object.entries(out)) {
      if (html) fs.writeFileSync(path.join(dir, `${name}.html`), html);
    }

    // Interactions: open the burger menu and the first nav dropdown, then dump.
    await page.click('[class*="header_burger-control"]').catch(() => {});
    await page.waitForTimeout(900);
    const open = await page.evaluate(
      () => document.documentElement.className + " || " + document.body.className,
    );
    console.log("after burger click:", open);
    const burgerOpen = await page.evaluate(grab, '[class*="burger-menu_wrapper"]');
    if (burgerOpen) fs.writeFileSync(path.join(dir, "burger-menu-open.html"), burgerOpen);
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
