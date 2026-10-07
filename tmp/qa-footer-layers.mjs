import { launch } from "../scripts/lib/browser.mjs";

async function probe(url, vp) {
  const { browser, page } = await launch({ width: vp.w, height: vp.h });
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  // settle + scroll to bottom so footer is in its final revealed state
  await page.evaluate((ms) => setTimeout(ms, ms), 2400);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.evaluate((ms) => setTimeout(ms, ms), 2200);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.evaluate((ms) => setTimeout(ms, ms), 1700);

  const data = await page.evaluate(() => {
    const footer = document.querySelector("footer.footer_wrapper") || document.querySelector(".footer_wrapper");
    const wrap = footer ? footer.querySelector(".footer_content") : null;
    const children = wrap ? [...wrap.children].map((c) => {
      const r = c.getBoundingClientRect();
      const cs = c.className ? c.className.toString().split(" ") : [];
      return { tag: c.tagName.toLowerCase(), clsFirst: cs[0] || "(none)", clsAll: cs.length <= 6 ? cs : cs.slice(0, 6).concat([cs.length - 6 + " more"]), top: Math.round(r.top + window.scrollY), bottom: Math.round(r.bottom + window.scrollY), left: Math.round(r.left + window.scrollX), w: Math.round(r.width), h: Math.round(r.height), childrenCount: c.children.length };
    }) : [];
    const docBottom = Math.round(Math.max(document.documentElement.scrollHeight, document.body.scrollHeight));
    const footerRect = footer ? footer.getBoundingClientRect() : null;
    return {
      docBottom, footerTop: wrap ? Math.round(wrap.getBoundingClientRect().top + window.scrollY) : null,
      footerBottom: footer ? Math.round(footerRect.bottom + window.scrollY) : null,
      footerH: footerRect ? Math.round(footerRect.height) : null,
      children, childrenCount: children.length,
    };
  });

  await browser.close();
  return { url, ...data };
}

const ref390 = await probe("https://www.findrealestate.com/", { w: 390, h: 844 });
const clone390 = await probe("http://localhost:3001/", { w: 390, h: 844 });
const ref1440 = await probe("https://www.findrealestate.com/", { w: 1440, h: 900 });
const clone1440 = await probe("http://localhost:3001/", { w: 1440, h: 900 });

// ---- pixel maps of footer blocks ----
function blockPixelMap(doc) {
  return doc.children.map((c, i) => ({ i, cls: c.clsFirst, tag: c.tag, top: c.top, bottom: c.bottom, left: c.left, right: c.left + c.w, w: c.w, h: c.h, childrenCount: c.childrenCount }));
}
function summarize(label, d) {
  console.log(`\n===== ${label} =====`);
  console.log("docBottom:", d.docBottom, "footerH:", d.footerH);
  console.log("children:", d.childrenCount);
  d.children.forEach((c, i) => console.log(`  [${i}] <${c.tag}> .${c.clsFirst} top ${c.top} bottom ${c.bottom} left ${c.left} right ${c.left+c.w} w ${c.w} h ${c.h}`));
  console.log("pixel map:");
  blockPixelMap(d).forEach((b) => console.log("  ", JSON.stringify(b)));
}
summarize("390 REF", ref390);
summarize("390 CLONE", clone390);
summarize("1440 REF", ref1440);
summarize("1440 CLONE", clone1440);

function diff(a, b, keys) {
  for (const k of keys) {
    if (a[k] !== b[k]) return `${k}: ref=${JSON.stringify(a[k])} clone=${JSON.stringify(b[k])}`;
  }
  return null;
}
function footerGapBottom(doc) {
  if (!doc.children.length) return null;
  const last = doc.children[doc.children.length - 1];
  return doc.docBottom - last.bottom;
}
console.log("\n===== footer gap to page-bottom (px) =====");
const g390r = footerGapBottom(ref390);
const g390c = footerGapBottom(clone390);
console.log("390 REF gap:", g390r, "CLONE gap:", g390c, "delta:", (g390c ?? 0) - (g390r ?? 0));
const g1440r = footerGapBottom(ref1440);
const g1440c = footerGapBottom(clone1440);
console.log("1440 REF gap:", g1440r, "CLONE gap:", g1440c, "delta:", (g1440c ?? 0) - (g1440r ?? 0));


function dump(label, d) {
  console.log(`\n===== ${label} =====`);
  console.log("docBottom:", d.docBottom, "footerTop:", d.footerTop, "footerBottom:", d.footerBottom, "footerH:", d.footerH);
  console.log("children:", d.childrenCount);
  d.children.forEach((c, i) => console.log(`  [${i}] <${c.tag}> .${c.clsFirst} top ${c.top} bottom ${c.bottom} w ${c.w} h ${c.h} ->`, JSON.stringify(c.clsAll), "children:", c.childrenCount));
}

dump("390 REF", ref390);
dump("390 CLONE", clone390);
dump("1440 REF", ref1440);
dump("1440 CLONE", clone1440);
