import { launch } from "../scripts/lib/browser.mjs";

const REF = "https://www.findrealestate.com/";
const CLONE = process.env.CLONE_URL ?? "http://localhost:3001/";

async function probe(url, vp) {
  const { browser, page } = await launch({ width: vp.w, height: vp.h });
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  // settle + scroll to bottom so footer is in its final revealed state
  // settle + scroll to bottom so footer is in its final revealed state
  await page.evaluate((ms) => setTimeout(ms, ms), 2200);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.evaluate((ms) => setTimeout(ms, ms), 2000);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.evaluate((ms) => setTimeout(ms, ms), 1500);    const data = await page.evaluate(() => {
    const footer = document.querySelector("footer") || document.querySelector(".footer_wrapper");
    const footerWrapper = document.querySelector("footer.footer_wrapper") || document.querySelector(".footer_wrapper");
    const wrap = footer ? footer.querySelector(".footer_content") : null;
    const blocks = [...(wrap?.children ?? [])].map((el) => {
      const r = el.getBoundingClientRect();
      const top = Math.round(r.top + window.scrollY);
      const bottom = Math.round(r.bottom + window.scrollY);
      return { cls: (el.className || "").toString().split(" ")[0], top, bottom, w: Math.round(r.width), h: Math.round(r.height) };
    });
    const paragraphNodes = wrap ? [...wrap.querySelectorAll("p, a, span, div")] : [];
    const outlineBlocks = wrap
      ? [...wrap.querySelectorAll("h1, h2, h3, h4, h5, h6, .footer_newsletter-title, .footer_contact-label, .footer_nav-link, .footer_social-link, .footer_copyright-container > *")]
      : [];
    const paras = paragraphNodes
      .filter((n) => n.textContent?.trim().length > 0)
      .map((n) => {
        const r = n.getBoundingClientRect();
        return {
          cls: (n.className || "").toString().split(" ")[0],
          txt: n.textContent?.trim().slice(0, 120),
          top: Math.round(r.top + window.scrollY),
          bottom: Math.round(r.bottom + window.scrollY),
          left: Math.round(r.left + window.scrollX),
          w: Math.round(r.width),
          h: Math.round(r.height),
        };
      });
    const imgs = [...document.querySelectorAll("img")].map((i) => {
      const r = i.getBoundingClientRect();
      return { src: i.getAttribute("src")?.slice(0, 90), naturalWidth: i.naturalWidth, naturalHeight: i.naturalHeight, ok: !i.complete || i.naturalWidth > 0, top: Math.round(r.top + window.scrollY), bottom: Math.round(r.bottom + window.scrollY), w: Math.round(r.width), h: Math.round(r.height) };
    });
    const docBottom = Math.round(Math.max(document.documentElement.scrollHeight, document.body.scrollHeight));
    const footerTop = wrap ? Math.round(wrap.getBoundingClientRect().top + window.scrollY) : null;
    const footerBottom = footer ? Math.round(footer.getBoundingClientRect().bottom + window.scrollY) : null;
    const footerTopWindow = wrap ? Math.round(wrap.getBoundingClientRect().top) : null;
    const footerBottomWindow = footer ? Math.round(footer.getBoundingClientRect().bottom) : null;
    const logoPaths = footerWrapper ? [...footerWrapper.querySelectorAll("svg[data-footer-logo]")] : [];
    const logoRectsRaw = logoPaths.length ? logoPaths.map((p) => p.getBoundingClientRect()) : [];
    const logoPathRects = logoRectsRaw.map((r) => ({ top: Math.round(r.top + window.scrollY), bottom: Math.round(r.bottom + window.scrollY), left: Math.round(r.left + window.scrollX), w: Math.round(r.width), h: Math.round(r.height) }));
    const logoInlineStyle = logoPaths.length ? logoPaths[0]?.getAttribute("style") || null : null;
    const logoBBoxRaw = logoRectsRaw.length ? (() => { const rs = logoRectsRaw; let top=1e9,bottom=-1e9,left=1e9,right=-1e9; for(const r of rs){if(r.top<top)top=r.top;if(r.bottom>bottom)bottom=r.bottom;if(r.left<left)left=r.left;if(r.right>right)right=r.right;} return { top, bottom, left, right, width: right-left, height: bottom-top }; })() : null;
    const footerABCRect = footerWrapper ? footerWrapper.getBoundingClientRect() : null;
    const footerWrapperTop = footerABCRect ? Math.round(footerABCRect.top + window.scrollY) : null;
    const footerWrapperBottom = footerABCRect ? Math.round(footerABCRect.bottom + window.scrollY) : null;
    const footerWrapperTopWindow = footerABCRect ? Math.round(footerABCRect.top) : null;
    const footerWrapperBottomWindow = footerABCRect ? Math.round(footerABCRect.bottom) : null;
    const footerABCRectRaw = footerABCRect ?? null;
    const mainTop = document.querySelector("main") ? Math.round(document.querySelector("main").getBoundingClientRect().top + window.scrollY) : null;
    const mainBottom = document.querySelector("main") ? Math.round(document.querySelector("main").getBoundingClientRect().bottom + window.scrollY) : null;
    const lastMainChild = document.querySelector("main")?.lastElementChild;
    const lastMainBottom = lastMainChild ? Math.round(lastMainChild.getBoundingClientRect().bottom + window.scrollY) : null;
    return { blocks, paras, outlineBlocks, imgs, docBottom, footerTop, footerBottom, footerTopWindow, footerBottomWindow, footerWrapperTop, footerWrapperBottom, footerWrapperTopWindow, footerWrapperBottomWindow, logoPathsCount: logoPaths.length, logoPathRects, logoBBoxRaw, logoInlineStyle, mainTop, mainBottom, lastMainBottom };
  });

  await browser.close();
  return { url, ...data };
}

const ref390 = await probe(REF, { w: 390, h: 844 });
const clone390 = await probe(CLONE, { w: 390, h: 844 });
const ref1440 = await probe(REF, { w: 1440, h: 900 });
const clone1440 = await probe(CLONE, { w: 1440, h: 900 });

// ---- focus on footer alone ----
function footerParagraphDiff(ref, clone) {
  const r = ref.paras || [];
  const c = clone.paras || [];
  const byTxtR = new Map(r.map((p) => [p.txt, p]));
  const byTxtC = new Map(c.map((p) => [p.txt, p]));
  const keys = new Set([...byTxtR.keys()].filter((k) => k.length > 0).sort());
  const rows = [];
  for (const k of keys) {
    const a = byTxtR.get(k);
    const b = byTxtC.get(k);
    rows.push({ txt: k, refTop: a?.top, cloneTop: b?.top, topDelta: (b?.top ?? null) - (a?.top ?? null), refLeft: a?.left, cloneLeft: b?.left, leftDelta: (b?.left ?? null) - (a?.left ?? null), refW: a?.w, cloneW: b?.w, refH: a?.h, cloneH: b?.h });
  }
  return rows;
}

console.log("\n===== 390 paragraph-level footer diff =====");
const diff390 = footerParagraphDiff(ref390, clone390);
diff390.forEach((d) => console.log(JSON.stringify({ txt: d.txt.slice(0, 90), refTop: d.refTop, cloneTop: d.cloneTop, topDelta: d.topDelta, refLeft: d.refLeft, cloneLeft: d.cloneLeft, leftDelta: d.leftDelta, refW: d.refW, cloneW: d.cloneW })));
console.log("===== 1440 paragraph-level footer diff =====");
const diff1440 = footerParagraphDiff(ref1440, clone1440);
diff1440.forEach((d) => console.log(JSON.stringify({ txt: d.txt.slice(0, 90), refTop: d.refTop, cloneTop: d.cloneTop, topDelta: d.topDelta, refLeft: d.refLeft, cloneLeft: d.cloneLeft, leftDelta: d.leftDelta, refW: d.refW, cloneW: d.cloneW })));

function brief(obj) {
  return {
    docBottom: obj.docBottom,
    footerTop: obj.footerTop,
    footerBottom: obj.footerBottom,
    footerTopWindow: obj.footerTopWindow,
    footerBottomWindow: obj.footerBottomWindow,
    footerWrapperTop: obj.footerWrapperTop,
    footerWrapperBottom: obj.footerWrapperBottom,
    footerWrapperTopWindow: obj.footerWrapperTopWindow,
    footerWrapperBottomWindow: obj.footerWrapperBottomWindow,
    logoPathsCount: obj.logoPathsCount,
    logoPathRects: obj.logoPathRects,
    logoBBoxRaw: obj.logoBBoxRaw,
    logoInlineStyle: obj.logoInlineStyle,
    mainTop: obj.mainTop,
    mainBottom: obj.mainBottom,
    lastMainBottom: obj.lastMainBottom,
    blockCount: obj.blocks.length,
    paraCount: obj.paras.length,
    outlineCount: obj.outlineBlocks?.length ?? 0,
    imgCount: obj.imgs.length,
    brokenImgs: obj.imgs.filter((i) => !i.ok).map((i) => i.src),
  };
}

console.log("===== 390 =====");
console.log("REF:", JSON.stringify(brief(ref390), null, 2));
console.log("CLONE:", JSON.stringify(brief(clone390), null, 2));
console.log("REF logoPathRects:", ref390.logoPathRects);
console.log("CLONE logoPathRects:", clone390.logoPathRects);
console.log("REF logoBBoxRaw:", ref390.logoBBoxRaw);
console.log("CLONE logoBBoxRaw:", clone390.logoBBoxRaw);
console.log("REF logoPathCount:", ref390.logoPathsCount);
console.log("CLONE logoPathCount:", clone390.logoPathsCount);
console.log("REF logoInlineStyle:", ref390.logoInlineStyle);
console.log("CLONE logoInlineStyle:", clone390.logoInlineStyle);
console.log("blocks REF:");
ref390.blocks.forEach((b) => console.log(" ", b.cls, "top", b.top, "bot", b.bottom, "w", b.w, "h", b.h));
console.log("blocks CLONE:");
clone390.blocks.forEach((b) => console.log(" ", b.cls, "top", b.top, "bot", b.bottom, "w", b.w, "h", b.h));
console.log("paras REF (first 60):");
ref390.paras.slice(0, 60).forEach((p) => console.log(" ", JSON.stringify(p.cls), "|", p.top, p.left, p.w, p.h, "|", JSON.stringify(p.txt)));
console.log("paras CLONE (first 60):");
clone390.paras.slice(0, 60).forEach((p) => console.log(" ", JSON.stringify(p.cls), "|", p.top, p.left, p.w, p.h, "|", JSON.stringify(p.txt)));
console.log("outlineBlocks REF (first 60):");
ref390.outlineBlocks?.slice(0, 60).forEach((o) => console.log(" ", JSON.stringify(o.cls), "|", o.top, o.left, o.w, o.h, "|", JSON.stringify(o.txt)));
console.log("outlineBlocks CLONE (first 60):");
clone390.outlineBlocks?.slice(0, 60).forEach((o) => console.log(" ", JSON.stringify(o.cls), "|", o.top, o.left, o.w, o.h, "|", JSON.stringify(o.txt)));
console.log("===== 1440 =====");
console.log("REF:", JSON.stringify(brief(ref1440), null, 2));
console.log("CLONE:", JSON.stringify(brief(clone1440), null, 2));
console.log("REF logoPathRects:", ref1440.logoPathRects);
console.log("CLONE logoPathRects:", clone1440.logoPathRects);
console.log("REF logoBBoxRaw:", ref1440.logoBBoxRaw);
console.log("CLONE logoBBoxRaw:", clone1440.logoBBoxRaw);
console.log("REF logoPathCount:", ref1440.logoPathsCount);
console.log("CLONE logoPathCount:", clone1440.logoPathsCount);
console.log("REF logoInlineStyle:", ref1440.logoInlineStyle);
console.log("CLONE logoInlineStyle:", clone1440.logoInlineStyle);
console.log("blocks REF:");
ref1440.blocks.forEach((b) => console.log(" ", b.cls, "top", b.top, "bot", b.bottom, "w", b.w, "h", b.h));
console.log("blocks CLONE:");
clone1440.blocks.forEach((b) => console.log(" ", b.cls, "top", b.top, "bot", b.bottom, "w", b.w, "h", b.h));
console.log("paras REF (first 80):");
ref1440.paras.slice(0, 80).forEach((p) => console.log(" ", JSON.stringify(p.cls), "|", p.top, p.left, p.w, p.h, "|", JSON.stringify(p.txt)));
console.log("paras CLONE (first 80):");
clone1440.paras.slice(0, 80).forEach((p) => console.log(" ", JSON.stringify(p.cls), "|", p.top, p.left, p.w, p.h, "|", JSON.stringify(p.txt)));
console.log("outlineBlocks REF (first 80):");
ref1440.outlineBlocks?.slice(0, 80).forEach((o) => console.log(" ", JSON.stringify(o.cls), "|", o.top, o.left, o.w, o.h, "|", JSON.stringify(o.txt)));
console.log("outlineBlocks CLONE (first 80):");
clone1440.outlineBlocks?.slice(0, 80).forEach((o) => console.log(" ", JSON.stringify(o.cls), "|", o.top, o.left, o.w, o.h, "|", JSON.stringify(o.txt)));
