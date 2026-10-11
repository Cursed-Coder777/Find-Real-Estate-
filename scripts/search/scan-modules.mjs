// Re-scans /search for CSS modules AFTER opening every dropdown/collapsible,
// so lazily-rendered menu modules (price-dropdown, beds-and-baths-dropdown,
// check-dropdown, collapsible, ...) are included in the install list.
//
// Usage: node scripts/search/scan-modules.mjs [--out <file>]
import { launch } from "../lib/browser.mjs";
import fs from "node:fs";

const SITE_KEY = "www-findrealestate-com-715c1bfa";
const PAGE_KEY = "search-6fb5b778";
const TARGET = "https://www.findrealestate.com/search";
const OUT =
  process.argv.includes("--out") &&
  process.argv[process.argv.indexOf("--out") + 1]
    ? process.argv[process.argv.indexOf("--out") + 1]
    : `docs/research/${SITE_KEY}/${PAGE_KEY}/modules-used.json`;

const { browser, page } = await launch({ width: 1440, height: 900 });
await page.goto(TARGET, { waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForTimeout(4500);

const modulesSeen = () =>
  page.evaluate(() => {
    const set = new Map();
    for (const el of document.querySelectorAll("*")) {
      const c =
        (typeof el.className === "string"
          ? el.className
          : (el.getAttribute?.("class") ?? "")) || "";
      for (const k of c.split(/\s+/)) {
        if (!k) continue;
        const mod = k.split("_")[0];
        if (!mod) continue;
        if (!set.has(mod)) set.set(mod, new Set());
        set.get(mod).add(k.replace(/__[A-Za-z0-9_-]+$/, ""));
      }
    }
    return [...set].map(([mod, classes]) => [mod, [...classes]]);
  });

const before = new Map(await modulesSeen());

// open every trigger, twice per pass (some menus only mount on open)
const triggerSel =
  '[class*="select-base_trigger"],[class*="dropdown-base_trigger"],[class*="check-dropdown_trigger"],[class*="sort-by_trigger"],[class*="mobile-filters_trigger"],[class*="filters-bar_option"],[class*="collapsible_trigger"]';

for (let pass = 0; pass < 2; pass++) {
  const n = await page.$$eval(triggerSel, (els) => els.length).catch(() => 0);
  for (let i = 0; i < n; i++) {
    const els = await page.$$(triggerSel);
    if (!els[i]) continue;
    await els[i].click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(700);
  }
  // close whatever is open
  await page.keyboard.press("Escape").catch(() => {});
  await page.waitForTimeout(300);
}

const after = new Map(await modulesSeen());

const merged = new Map();
for (const [k, v] of before) merged.set(k, new Set(v));
const NEW = [];
for (const [k, v] of after) {
  for (const c of v) {
    if (!merged.has(k)) merged.set(k, new Set());
    if (!merged.get(k).has(c)) NEW.push(`${k}_${c}`);
    merged.get(k).add(c);
  }
}

const out = {
  scannedAt: new Date().toISOString(),
  url: TARGET,
  moduleCount: merged.size,
  modules: [...merged]
    .map(([mod, classes]) => ({ mod, classes: [...classes] }))
    .sort((a, b) => a.mod.localeCompare(b.mod)),
  discoveredOnlyAfterOpening: NEW,
};
fs.mkdirSync("docs/research/" + SITE_KEY + "/" + PAGE_KEY, { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out, null, 2));

console.log(`modules after opening all menus: ${merged.size}`);
console.log(`\nNEW modules/classes that only appear once menus are open:`);
for (const n of NEW) console.log("  + " + n);
console.log(`\nall modules (${merged.size}):`);
console.log([...merged.keys()].sort().join(" "));
console.log(`\nwrote ${OUT}`);
await browser.close();