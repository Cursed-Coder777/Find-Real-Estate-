import { launch } from "../scripts/lib/browser.mjs";

const CLONE = process.env.CLONE_URL ?? "http://localhost:3001/";

async function probe(vp) {
  const { browser, page } = await launch({ width: vp.w, height: vp.h });
  await page.goto(CLONE, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.evaluate((ms) => setTimeout(ms, ms), 2200);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.evaluate((ms) => setTimeout(ms, ms), 2000);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.evaluate((ms) => setTimeout(ms, ms), 1500);

  const data = await page.evaluate(() => {
    const footer = document.querySelector("footer.footer_wrapper") || document.querySelector(".footer_wrapper");
    const logoBlock = footer ? footer.querySelector(".footer_logo") : null;
    const logoSvgs = logoBlock ? [...logoBlock.querySelectorAll("svg[data-footer-logo], svg[role='img'][aria-label='FIND']")] : [];
    const logoSvg = logoBlock ? logoBlock.querySelector("svg") : null;
    const rects = logoSvgs.length ? logoSvgs.map((s) => ({ svg: true, viewBox: s.getAttribute("viewBox"), width: s.getAttribute("width"), height: s.getAttribute("height"), style: s.getAttribute("style"), ariaLabel: s.getAttribute("aria-label"), role: s.getAttribute("role"), rect: s.getBoundingClientRect() ? { w: Math.round(s.getBoundingClientRect().width), h: Math.round(s.getBoundingClientRect().height), ratio: +(s.getBoundingClientRect().width / s.getBoundingClientRect().height).toFixed(3) } : null })) : [];
    const footerChildren = logoBlock ? [...logoBlock.parentElement?.children ?? []].map((c) => ({ tag: c.tagName.toLowerCase(), cls: (c.className || "").toString().split(" ")[0] })) : [];
    return { footerPresent: !!footer, logoBlockPresent: !!logoBlock, logoSvgsCount: logoSvgs.length, rects, footerChildren, logoSvgWidth: logoSvg ? logoSvg.getAttribute("width") : null, logoSvgHeight: logoSvg ? logoSvg.getAttribute("height") : null };
  });

  await browser.close();
  return { vp, ...data };
}

const r390 = await probe({ w: 390, h: 844 });
const r768 = await probe({ w: 768, h: 1024 });
const r1440 = await probe({ w: 1440, h: 900 });

function dump(label, d) {
  console.log(`\n===== ${label} =====`);
  console.log("footerPresent:", d.footerPresent, "logoBlockPresent:", d.logoBlockPresent, "logoSvgsCount:", d.logoSvgsCount);
  console.log("logoSvgWidth attr:", d.logoSvgWidth, "logoSvgHeight attr:", d.logoSvgHeight);
  console.log("footer_children:", JSON.stringify(d.footerChildren));
  d.rects.forEach((r, i) => console.log(`  svg[${i}]`, JSON.stringify({ viewBox: r.viewBox, width: r.width, height: r.height, role: r.role, ariaLabel: r.ariaLabel, style: r.style, rect: r.rect })));
}
dump("390", r390);
dump("768", r768);
dump("1440", r1440);

// assertions
const ok = (cond, msg) => { if (!cond) console.log("ASSERT FAIL:", msg); };
ok(r1440.logoSvgsCount === 1, `expected 1 FIND svg on desktop, got ${r1440.logoSvgsCount}`);
ok(r1440.rects[0]?.viewBox === "0 0 975 280", "expected viewBox 0 0 975 280");
ok(!r1440.rects[0]?.width, "expected no width attr on svg (responsive)");
ok(!r1440.rects[0]?.height, "expected no height attr on svg (responsive)");
ok(r1440.rects[0]?.ariaLabel === "FIND", "expected aria-label FIND");
ok(r1440.rects[0]?.role === "img", "expected role img");
const ratio1440 = r1440.rects[0]?.rect?.ratio;
console.log("desktop rect ratio:", ratio1440, "expected ~3.482 (975/280)");
ok(Math.abs((ratio1440 ?? 0) - 3.482) < 0.02, `desktop ratio ${ratio1440} not near 3.482`);
const ratio390 = r390.rects[0]?.rect?.ratio;
console.log("mobile rect ratio:", ratio390);
ok(Math.abs((ratio390 ?? 0) - 3.482) < 0.02, `mobile ratio ${ratio390} not near 3.482`);
