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
    const logoBlock = wrap ? wrap.querySelector(".footer_logo") : null;
    const logoSvg = logoBlock ? logoBlock.querySelector("svg[data-footer-logo]") : null;
    const logoInlineStyle = logoSvg ? logoSvg.getAttribute("style") || null : null;
    const logoAttrs = logoSvg ? { xmlns: logoSvg.getAttribute("xmlns"), viewBox: logoSvg.getAttribute("viewBox"), width: logoSvg.getAttribute("width"), height: logoSvg.getAttribute("height"), style: logoSvg.getAttribute("style"), "data-footer-logo": logoSvg.getAttribute("data-footer-logo") } : null;
    const logoPaths = logoSvg ? [...logoSvg.querySelectorAll("path[data-letter]")] : [];
    const logoRect = logoSvg ? logoSvg.getBoundingClientRect() : null;
    const logoRectPage = logoRect ? { top: Math.round(logoRect.top + window.scrollY), bottom: Math.round(logoRect.bottom + window.scrollY), left: Math.round(logoRect.left + window.scrollX), right: Math.round(logoRect.right + window.scrollX), w: Math.round(logoRect.width), h: Math.round(logoRect.height) } : null;
    const logoBBoxRaw = logoRect ? { top: logoRect.top, bottom: logoRect.bottom, left: logoRect.left, right: logoRect.right, width: logoRect.width, height: logoRect.height, transform: logoSvg ? logoSvg.getAttribute("transform") || null : null } : null;
    const logoPathsData = logoPaths.map((p) => ({ letter: p.getAttribute("data-letter"), d: p.getAttribute("d")?.slice(0, 60), style: p.getAttribute("style") || null, rect: p.getBoundingClientRect() ? { top: Math.round(p.getBoundingClientRect().top + window.scrollY), bottom: Math.round(p.getBoundingClientRect().bottom + window.scrollY), left: Math.round(p.getBoundingClientRect().left + window.scrollX), w: Math.round(p.getBoundingClientRect().width), h: Math.round(p.getBoundingClientRect().height) } : null }));
    const docBottom = Math.round(Math.max(document.documentElement.scrollHeight, document.body.scrollHeight));
    const wrapper = document.querySelector(".footer_wrapper");
    const wrapperRect = wrapper ? wrapper.getBoundingClientRect() : null;
    const wrapperRectPage = wrapperRect ? { top: Math.round(wrapperRect.top + window.scrollY), bottom: Math.round(wrapperRect.bottom + window.scrollY), h: Math.round(wrapperRect.height) } : null;
    const topPadding = footer ? parseFloat(getComputedStyle(footer).getPropertyValue("padding-top")) || null : null;
    const bottomPadding = footer ? parseFloat(getComputedStyle(footer).getPropertyValue("padding-bottom")) || null : null;
    const logoTopPadding = logoBlock ? parseFloat(getComputedStyle(logoBlock).getPropertyValue("margin-top")) || null : null;
    return {
      docBottom, footerTop: wrap ? Math.round(wrap.getBoundingClientRect().top + window.scrollY) : null,
      footerBottom: footer ? Math.round(footer.getBoundingClientRect().bottom + window.scrollY) : null,
      wrapperRectPage, topPadding, bottomPadding, logoTopPadding,
      logoRectPage, logoBBoxRaw, logoInlineStyle, logoAttrs, logoPathsData, logoPathsCount: logoPaths.length,
    };
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
  console.log("docBottom:", d.docBottom);
  console.log("footerTop:", d.footerTop, "footerBottom:", d.footerBottom);
  console.log("wrapperRectPage:", JSON.stringify(d.wrapperRectPage));
  console.log("topPadding:", d.topPadding, "bottomPadding:", d.bottomPadding, "logoTopPadding:", d.logoTopPadding);
  console.log("logoRectPage:", JSON.stringify(d.logoRectPage));
  console.log("logoBBoxRaw:", JSON.stringify(d.logoBBoxRaw));
  console.log("logoInlineStyle:", d.logoInlineStyle);
  console.log("logoAttrs:", d.logoAttrs);
  console.log("logoPathsCount:", d.logoPathsCount);
  if (d.logoPathsData.length) {
    console.log("logoPathsData:");
    d.logoPathsData.forEach((p) => console.log("  ", JSON.stringify(p.letter), JSON.stringify(p.rect), "|", JSON.stringify(p.d), "|", JSON.stringify(p.style)));
  }
}

dump("390 REF", ref390);
dump("390 CLONE", clone390);
dump("1440 REF", ref1440);
dump("1440 CLONE", clone1440);
