import { launch } from "../scripts/lib/browser.mjs";

async function probe(url, vp) {
  const { browser, page } = await launch({ width: vp.w, height: vp.h });
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.evaluate((ms) => setTimeout(ms, ms), 2200);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.evaluate((ms) => setTimeout(ms, ms), 2000);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.evaluate((ms) => setTimeout(ms, ms), 1500);

  const data = await page.evaluate(() => {
    const footer = document.querySelector("footer.footer_wrapper") || document.querySelector(".footer_wrapper");
    const wrap = footer ? footer.querySelector(".footer_content") : null;
    const children = wrap ? [...wrap.children].map((c) => {
      const r = c.getBoundingClientRect();
      const cls = (c.className || "").toString().split(" ");
      return { tag: c.tagName.toLowerCase(), clsFirst: cls[0] || "(none)", clsAll: cls.length <= 6 ? cls : cls.slice(0, 6).concat([cls.length - 6 + " more"]), top: Math.round(r.top + window.scrollY), bottom: Math.round(r.bottom + window.scrollY), left: Math.round(r.left + window.scrollX), w: Math.round(r.width), h: Math.round(r.height), childrenCount: c.children.length };
    }) : [];
    const logoBlock = wrap ? wrap.querySelector(".footer_logo") : null;
    const logoSvgs = logoBlock ? [...logoBlock.querySelectorAll("svg")] : [];
    const logoSvgData = logoSvgs.length ? logoSvgs.map((s) => ({
      viewBox: s.getAttribute("viewBox"),
      width: s.getAttribute("width"),
      height: s.getAttribute("height"),
      style: s.getAttribute("style"),
      ariaLabel: s.getAttribute("aria-label"),
      role: s.getAttribute("role"),
      pathsCount: s.querySelectorAll("path").length,
      pathD0: s.querySelector("path") ? s.querySelector("path").getAttribute("d")?.slice(0, 60) : null,
      rect: s.getBoundingClientRect() ? { top: Math.round(s.getBoundingClientRect().top + window.scrollY), bottom: Math.round(s.getBoundingClientRect().bottom + window.scrollY), left: Math.round(s.getBoundingClientRect().left + window.scrollX), w: Math.round(s.getBoundingClientRect().width), h: Math.round(s.getBoundingClientRect().height), ratio: +((s.getBoundingClientRect().width / s.getBoundingClientRect().height) || 0).toFixed(3) } : null,
    })) : [];
    const docBottom = Math.round(Math.max(document.documentElement.scrollHeight, document.body.scrollHeight));
    const footerRect = footer ? footer.getBoundingClientRect() : null;
    return { docBottom, footerTop: wrap ? Math.round(wrap.getBoundingClientRect().top + window.scrollY) : null, footerBottom: footer ? Math.round(footerRect.bottom + window.scrollY) : null, footerH: footerRect ? Math.round(footerRect.height) : null, children, childrenCount: children.length, logoBlockPresent: !!logoBlock, logoSvgsCount: logoSvgs.length, logoSvgData };
  });

  await browser.close();
  return { url, ...data };
}

const ref390 = await probe("https://www.findrealestate.com/", { w: 390, h: 844 });
const clone390 = await probe("http://localhost:3001/", { w: 390, h: 844 });
const ref1440 = await probe("https://www.findrealestate.com/", { w: 1440, h: 900 });
const clone1440 = await probe("http://localhost:3001/", { w: 1440, h: 900 });

function dump(label, d) {
  console.log(`\n===== ${label} =====`);
  console.log("url:", d.url);
  console.log("docBottom:", d.docBottom, "footerTop:", d.footerTop, "footerBottom:", d.footerBottom, "footerH:", d.footerH);
  console.log("childrenCount:", d.childrenCount);
  d.children.forEach((c, i) => console.log(`  [${i}] <${c.tag}> .${c.clsFirst} top ${c.top} bottom ${c.bottom} left ${c.left} right ${c.left + c.w} w ${c.w} h ${c.h} children ${c.childrenCount}`));
  console.log("logoBlockPresent:", d.logoBlockPresent, "logoSvgsCount:", d.logoSvgsCount);
  d.logoSvgData.forEach((s, i) => console.log(`  svg[${i}]`, JSON.stringify({ viewBox: s.viewBox, width: s.width, height: s.height, style: s.style, ariaLabel: s.ariaLabel, role: s.role, pathsCount: s.pathsCount, pathD0: s.pathD0, rect: s.rect })));
}

dump("390 REF", ref390);
dump("390 CLONE", clone390);
dump("1440 REF", ref1440);
dump("1440 CLONE", clone1440);

const refLogo390 = ref390.logoSvgData[0];
const cloneLogo390 = clone390.logoSvgData[0];
const refLogo1440 = ref1440.logoSvgData[0];
const cloneLogo1440 = clone1440.logoSvgData[0];
console.log("\n===== logo comparison =====");
console.log("390 REF logo:", refLogo390 ? "present" : "absent", refLogo390 ? `viewBox ${refLogo390.viewBox} paths ${refLogo390.pathsCount} pathD0 ${JSON.stringify(refLogo390.pathD0)}` : "");
console.log("390 CLONE logo:", cloneLogo390 ? "present" : "absent", cloneLogo390 ? `viewBox ${cloneLogo390.viewBox} paths ${cloneLogo390.pathsCount} pathD0 ${JSON.stringify(cloneLogo390.pathD0)}` : "");
console.log("1440 REF logo:", refLogo1440 ? "present" : "absent", refLogo1440 ? `viewBox ${refLogo1440.viewBox} paths ${refLogo1440.pathsCount} pathD0 ${JSON.stringify(refLogo1440.pathD0)}` : "");
console.log("1440 CLONE logo:", cloneLogo1440 ? "present" : "absent", cloneLogo1440 ? `viewBox ${cloneLogo1440.viewBox} paths ${cloneLogo1440.pathsCount} pathD0 ${JSON.stringify(cloneLogo1440.pathD0)}` : "");
const cloneHasFIND = (s) => s && s.pathD0 && s.pathD0.startsWith("M836.06 1.01c77.3");
console.log("clone 390 FIND match:", cloneLogo390 ? cloneHasFIND(cloneLogo390) : false);
console.log("clone 1440 FIND match:", cloneLogo1440 ? cloneHasFIND(cloneLogo1440) : false);
console.log("clone 390 no width/height attr:", cloneLogo390 ? (!cloneLogo390.width && !cloneLogo390.height) : false);
console.log("clone 1440 no width/height attr:", cloneLogo1440 ? (!cloneLogo1440.width && !cloneLogo1440.height) : false);
console.log("clone 390 ratio:", cloneLogo390 ? cloneLogo390.rect?.ratio : null, "expect ~3.482");
console.log("clone 1440 ratio:", cloneLogo1440 ? cloneLogo1440.rect?.ratio : null, "expect ~3.482");
