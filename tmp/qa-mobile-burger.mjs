import { launch } from "../scripts/lib/browser.mjs";

async function probe(url, vp) {
  const { browser, page } = await launch({ width: vp.w, height: vp.h });
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.evaluate((ms) => setTimeout(ms, ms), 2200);

  const data = await page.evaluate(() => {
    const burger = document.querySelector(".burger-btn_btn") || document.querySelector("[aria-label='Menu control']") || document.querySelector(".header_burger-control");
    const spans = burger ? [...burger.querySelectorAll("span")] : [];
    const spanRects = spans.map((s, i) => ({
      i,
      rect: s.getBoundingClientRect() ? { top: Math.round(s.getBoundingClientRect().top), bottom: Math.round(s.getBoundingClientRect().bottom), left: Math.round(s.getBoundingClientRect().left), right: Math.round(s.getBoundingClientRect().right), w: Math.round(s.getBoundingClientRect().width), h: Math.round(s.getBoundingClientRect().height), ratio: +(s.getBoundingClientRect().width / (s.getBoundingClientRect().height || 1)).toFixed(3) } : null,
      style: s.getAttribute("style") || null,
      cls: (s.className || "").toString().slice(0, 40),
      parentRect: burger ? { w: Math.round(burger.getBoundingClientRect().width), h: Math.round(burger.getBoundingClientRect().height), overflow: getComputedStyle(burger).overflow, display: getComputedStyle(burger).display, position: getComputedStyle(burger).position } : null,
      parentCls: burger ? (burger.className || "").toString().split(" ").slice(0, 6) : null,
    }));
    const burgerComputed = burger ? { display: getComputedStyle(burger).display, height: getComputedStyle(burger).height, overflow: getComputedStyle(burger).overflow, flexDirection: getComputedStyle(burger).flexDirection, alignItems: getComputedStyle(burger).alignItems, position: getComputedStyle(burger).position, width: getComputedStyle(burger).width } : null;
    const docBodyOverflow = getComputedStyle(document.body).overflow;
    return { burgerPresent: !!burger, spansCount: spans.length, spanRects, burgerComputed, docBodyOverflow };
  });

  await browser.close();
  return { vp, ...data };
}

const ref390 = await probe("https://www.findrealestate.com/", { w: 390, h: 844 });
const clone390 = await probe("http://localhost:3001/", { w: 390, h: 844 });
const ref1440 = await probe("https://www.findrealestate.com/", { w: 1440, h: 900 });
const clone1440 = await probe("http://localhost:3001/", { w: 1440, h: 900 });

function dump(label, d) {
  console.log(`\n===== ${label} (${d.vp.w}x${d.vp.h}) =====`);
  console.log("burgerPresent:", d.burgerPresent, "spansCount:", d.spansCount);
  console.log("burgerComputed:", JSON.stringify(d.burgerComputed));
  console.log("docBodyOverflow:", d.docBodyOverflow);
  d.spanRects.forEach((r) => console.log("  span[", r.i, "]", JSON.stringify({ rect: r.rect, style: r.style, cls: r.cls }), "parentRect:", JSON.stringify(r.parentRect), "parentCls:", r.parentCls));
}

dump("390 REF", ref390);
dump("390 CLONE", clone390);
dump("1440 REF", ref1440);
dump("1440 CLONE", clone1440);

// assertions for mobile
const mobile = (d) => d.vp.w === 390;
const hasTwoLines = (d) => d.spansCount === 2;
const linesVisible = (d) => d.spanRects.every((r) => r.rect && r.rect.h > 0 && r.rect.w > 0);
const linesSeparated = (d) => {
  if (d.spanRects.length !== 2 || !d.spanRects[0].rect || !d.spanRects[1].rect) return false;
  return Math.abs(d.spanRects[0].rect.top - d.spanRects[1].rect.top) > 2;
};
const noOverflowHidden = (d) => !d.burgerComputed || d.burgerComputed.overflow !== "hidden";
console.log("\n===== mobile assertions =====");
console.log("390 REF two lines:", hasTwoLines(ref390), "visible:", linesVisible(ref390), "separated:", linesSeparated(ref390), "no overflow hidden:", noOverflowHidden(ref390));
console.log("390 CLONE two lines:", hasTwoLines(clone390), "visible:", linesVisible(clone390), "separated:", linesSeparated(clone390), "no overflow hidden:", noOverflowHidden(clone390));
console.log("1440 CLONE two lines:", hasTwoLines(clone1440), "visible:", linesVisible(clone1440), "separated:", linesSeparated(clone1440), "no overflow hidden:", noOverflowHidden(clone1440));
